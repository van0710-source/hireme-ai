import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Resend } from 'resend';
import { calculateCost } from '@/lib/cost';
import { createAdminClient } from '@/lib/supabase-admin';
import {
  buildQuotaUpdate,
  computeQuotaStatus,
  determineDeduction,
  type DeviceQuota,
} from '@/lib/quota';
import {
  isValidDeviceId,
  MAX_RESUME_LENGTH,
  sanitizeOptionalTarget,
  sanitizeText,
} from '@/lib/validation';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL ?? 'https://api.deepseek.com',
});

const resend = new Resend(process.env.RESEND_API_KEY);

const COST_WARNING = 20;
const COST_SHUTDOWN = 40;

async function checkCostAndAlert(): Promise<{ shouldStop: boolean }> {
  const supabase = createAdminClient();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data } = await supabase
    .from('monthly_cost')
    .select('total_cost_usd')
    .eq('year_month', currentMonth)
    .maybeSingle();

  const totalCost = data?.total_cost_usd || 0;

  if (totalCost >= COST_SHUTDOWN) {
    return { shouldStop: true };
  }

  if (totalCost >= COST_WARNING) {
    const alertKey = `cost_alert_${currentMonth}`;
    const { data: alerted } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', alertKey)
      .maybeSingle();

    if (!alerted && process.env.ALERT_EMAIL && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'HireMe AI <alert@hireme-ai.com>',
        to: process.env.ALERT_EMAIL,
        subject: `Cost Alert: $${totalCost.toFixed(2)}`,
        html: `<p>Monthly API cost has reached <strong>$${totalCost.toFixed(2)}</strong>.</p>`,
      });

      await supabase.from('system_settings').upsert({
        key: alertKey,
        value: 'sent',
        updated_at: new Date().toISOString(),
      });
    }
  }

  return { shouldStop: false };
}

async function getOrCreateDeviceQuota(deviceId: string): Promise<DeviceQuota> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('anonymous_devices')
    .select('total_used, credits, paid_uses')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (existing) {
    return {
      total_used: existing.total_used ?? 0,
      credits: existing.credits ?? 0,
      paid_uses: existing.paid_uses ?? 0,
    };
  }

  await supabase.from('anonymous_devices').insert({
    device_id: deviceId,
    last_seen_at: new Date().toISOString(),
    total_used: 0,
    credits: 0,
    paid_uses: 0,
  });

  return { total_used: 0, credits: 0, paid_uses: 0 };
}

function buildPrompt(resumeText: string, target?: string): string {
  const targetSection = target
    ? `Target company or industry: ${target}

Tailoring requirements:
- Mirror the language, values, and role expectations associated with this target
- Emphasize skills and achievements most relevant to this target
- Interview questions must reflect what this company/industry typically asks
- Use Western US/EU recruiting style: direct, confident, results-oriented
- Avoid humble hedging and non-native phrasing patterns
- Output must differ substantially from a generic version (different keywords, emphasis, and question angles)`
    : `No specific target provided. Generate a strong general-purpose version using Western US/EU recruiting style: direct, confident, results-oriented.`;

  return `Based on the following resume, generate three parts in THE SAME LANGUAGE as the resume:

1. Optimized resume (use strong action verbs, quantify achievements, ATS-friendly keywords)
2. 10 interview questions with key points for answers
3. 30-second self-introduction (follow the CRITICAL RULES in the system prompt)

${targetSection}

Resume:
${resumeText}`;
}

export async function POST(request: Request) {
  try {
    const { shouldStop } = await checkCostAndAlert();
    if (shouldStop) {
      return NextResponse.json(
        { error: 'Service temporarily paused due to cost limit. Please try again next month.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const deviceId = body.deviceId as string;
    const resumeText = sanitizeText(body.resumeText, MAX_RESUME_LENGTH);
    const target = sanitizeOptionalTarget(body.targetCompanyOrIndustry);

    if (!deviceId || !isValidDeviceId(deviceId)) {
      return NextResponse.json({ error: 'Valid deviceId required' }, { status: 400 });
    }

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    const quota = await getOrCreateDeviceQuota(deviceId);
    const deduction = determineDeduction(quota);

    if (!deduction) {
      return NextResponse.json(
        {
          error: 'Free limit reached. Please purchase credits to continue.',
          code: 'PAYMENT_REQUIRED',
        },
        { status: 402 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an expert career coach for global job seekers targeting Western markets.

CRITICAL RULES for the 30-second self-introduction:
1. Use FIRST PERSON ("I", "my", "me")
2. Start with your current role and experience level
3. Focus on ACHIEVEMENTS with metrics, not responsibilities
4. Use ACTION VERBS: led, built, optimized, reduced, delivered, scaled
5. End with VALUE OFFER: what you can do for THEM
6. Avoid humble or hedging language
7. Keep tone CONFIDENT and DIRECT

All output is AI-generated suggestions for reference only. Never promise interview or job outcomes.`,
        },
        {
          role: 'user',
          content: buildPrompt(resumeText, target),
        },
      ],
      temperature: target ? 0.85 : 0.7,
    });

    const result = completion.choices[0].message.content;
    const usage = completion.usage;
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;
    const cost = calculateCost('deepseek-chat', inputTokens, outputTokens);

    const supabase = createAdminClient();

    await supabase.from('cost_logs').insert({
      device_id: deviceId,
      model: 'deepseek-chat',
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      cost_usd: cost,
    });

    const currentMonth = new Date().toISOString().slice(0, 7);
    await supabase.rpc('increment_monthly_cost', {
      p_year_month: currentMonth,
      p_cost: cost,
    });

    const quotaUpdate = buildQuotaUpdate(quota, deduction);
    await supabase.from('anonymous_devices').upsert(
      {
        device_id: deviceId,
        last_seen_at: new Date().toISOString(),
        ...quotaUpdate,
      },
      { onConflict: 'device_id' }
    );

    const updatedStatus = computeQuotaStatus({
      total_used: quotaUpdate.total_used,
      credits: quotaUpdate.credits ?? quota.credits,
      paid_uses: quotaUpdate.paid_uses ?? quota.paid_uses,
    });

    return NextResponse.json({
      result,
      quota: updatedStatus,
    });
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
