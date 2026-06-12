import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { calculateCost } from '@/lib/cost';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const DAILY_LIMIT = 3;
const COST_WARNING = 20;   // $20 预警
const COST_SHUTDOWN = 40;   // $40 关停

async function checkCostAndAlert(): Promise<{ shouldStop: boolean }> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data } = await supabase
    .from('monthly_cost')
    .select('total_cost_usd')
    .eq('year_month', currentMonth)
    .maybeSingle();
  
  const totalCost = data?.total_cost_usd || 0;
  console.log('当前月成本:', totalCost);
  
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
    
    if (!alerted) {
      console.log('发送预警邮件...');
      await resend.emails.send({
        from: 'HireMe AI <alert@hireme-ai.com>',
        to: process.env.ALERT_EMAIL!,
        subject: `⚠️ Cost Alert: $${totalCost.toFixed(2)}`,
        html: `<p>Monthly API cost has reached <strong>$${totalCost.toFixed(2)}</strong>.</p>
               <p>Warning threshold: $${COST_WARNING}</p>
               <p>Shutdown threshold: $${COST_SHUTDOWN}</p>
               <p>Please check your usage.</p>`,
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

export async function POST(request: Request) {
  try {
    const { shouldStop } = await checkCostAndAlert();
    if (shouldStop) {
      return NextResponse.json(
        { error: 'Service temporarily paused due to cost limit. Please try again next month.' },
        { status: 503 }
      );
    }
    
    const { resumeText, deviceId } = await request.json();
    
    console.log('收到请求, deviceId:', deviceId);
    
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId required' }, { status: 400 });
    }
    
    const today = new Date().toISOString().slice(0, 10);
    const { data: usageData } = await supabase
      .from('daily_usage')
      .select('call_count')
      .eq('device_id', deviceId)
      .eq('usage_date', today)
      .maybeSingle();
    
    const currentCount = usageData?.call_count || 0;
    console.log('今日已使用次数:', currentCount);
    
    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Daily limit reached. Come back tomorrow.' },
        { status: 429 }
      );
    }
    
    console.log('调用 AI...');
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an expert career coach for global job seekers.

CRITICAL RULES for the 30-second self-introduction:
1. Use FIRST PERSON ("I", "my", "me")
2. Start with your current role and experience level: "I'm a [role] with [X] years of experience in [field]"
3. Focus on ACHIEVEMENTS with metrics, not responsibilities
4. Use ACTION VERBS: led, built, optimized, reduced, delivered, scaled
5. End with VALUE OFFER: what you can do for THEM
6. Avoid humble or hedging language
7. Keep tone CONFIDENT and DIRECT`,
        },
        {
          role: 'user',
          content: `Based on the following resume, generate three parts in THE SAME LANGUAGE as the resume:

1. Optimized resume (use strong action verbs, quantify achievements)
2. 10 interview questions with key points for answers
3. 30-second self-introduction (follow the CRITICAL RULES above)

Resume:
${resumeText}`,
        },
      ],
      temperature: 0.7,
    });
    
    const result = completion.choices[0].message.content;
    const usage = completion.usage;
    
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;
    const cost = calculateCost('deepseek-chat', inputTokens, outputTokens);
    
    console.log('Token消耗:', { inputTokens, outputTokens, totalTokens, cost });
    
    // 记录成本
    const { error: costError } = await supabase.from('cost_logs').insert({
      device_id: deviceId,
      model: 'deepseek-chat',
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      cost_usd: cost,
    });
    
    if (costError) {
      console.error('成本记录失败:', costError);
    } else {
      console.log('成本记录成功');
    }
    
    // 更新月度总成本
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { error: rpcError } = await supabase.rpc('increment_monthly_cost', {
      p_year_month: currentMonth,
      p_cost: cost,
    });
    
    if (rpcError) {
      console.error('月度成本更新失败:', rpcError);
    }
    
    // 更新设备信息
    await supabase.from('anonymous_devices').upsert({
      device_id: deviceId,
      last_seen_at: new Date().toISOString(),
    }, { onConflict: 'device_id' });
    
    // 更新每日使用次数
    if (currentCount === 0) {
      await supabase.from('daily_usage').insert({
        device_id: deviceId,
        usage_date: today,
        call_count: 1,
      });
    } else {
      await supabase.from('daily_usage')
        .update({ call_count: currentCount + 1 })
        .eq('device_id', deviceId)
        .eq('usage_date', today);
    }
    
    console.log('请求处理完成');
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}