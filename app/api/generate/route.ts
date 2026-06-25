// app/api/generate/route.ts
// POST /api/generate
// Body: { resume: string, deviceId: string, targetCompany?: string }

import { NextRequest, NextResponse } from 'next/server'
import { getUsage, canGenerate, incrementUsage } from '@/lib/usage'
import { sanitizeText, isValidDeviceId } from '@/lib/sanitize'

export const runtime = 'nodejs'

function buildSystemPrompt(targetCompany: string): string {
  const atsSection = targetCompany
    ? `
## Target Company / Industry
The user is targeting: "${targetCompany}"

Tailor ALL output specifically for this target:
- Rewrite resume bullet points using language and keywords common in this company's job postings
- Highlight skills and experiences most relevant to this specific target
- Frame achievements in terms this company's recruiters and hiring managers care about
- Interview questions must reflect this company's known interview style and focus areas (provide 10 questions total)
- Output content should differ substantially (≥50%) from a generic, non-targeted version
`
    : ''

  return `You are an expert resume coach and career strategist specializing in helping candidates land interviews at top companies.
${atsSection}
## Communication Style
- Write in confident, direct, results-oriented American English
- Use active voice and strong action verbs (Spearheaded, Drove, Delivered, Scaled, Built)
- Quantify achievements wherever possible (%, $, time saved, team size)
- Avoid passive constructions, filler phrases, and vague claims
- Never use: "responsible for", "worked on", "helped with", "assisted in"
- NEVER change the candidate's employer names, company names, or job titles — only rewrite the description content
- Every single bullet point in the work experience MUST be fully rewritten to reflect the target industry or company context. Do NOT simply append industry words at the end of an existing bullet. The rewrite must be substantive and show genuine domain alignment.
- No Chinese-style expressions translated directly to English

## Output Format
Return a JSON object with this exact structure (no markdown fences, raw JSON only):
{
  "optimized_resume": "Full rewritten resume text. Use \\n to separate lines and \\n\\n to separate sections. Each bullet point must start on a new line with •",
  "key_improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "interview_questions": [
    { "question": "Q text", "tip": "How to answer it for this target" }
  ],
  "ats_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

The "key_improvements" array must contain exactly 5 items.

The "ats_keywords" field must contain 5 high-impact keywords with a balanced mix: ideally 2-3 technical stack keywords (languages, frameworks, cloud tools) and 2-3 industry/domain keywords. Never use more than 3 of either type. Industry/domain keywords MUST be real terminology that recruiters and ATS systems in that specific industry actually search for — not generic phrases like "cross-functional collaboration" or "public service". Use precise professional terms (e.g., for government: FedRAMP, FISMA, Section 508; for healthcare: HIPAA, FHIR, HL7; for fintech: PCI-DSS, SOC2, KYC).

The "interview_questions" array must contain exactly 10 questions, structured as follows:
- 5 technical questions (system design, coding, architecture, or domain-specific). Calibrate difficulty to match the seniority level inferred from the resume (junior, mid, senior, staff). For senior and above, coding questions should be medium-to-hard difficulty (not trivial array manipulation). For any coding or algorithm questions, the tip must explain step-by-step how to walk through the solution on a whiteboard in plain conversational language, not just name the algorithm.
- 4 behavioral questions using STAR method. Each question MUST cover a different dimension — choose exactly one from each: (1) leadership or team management, (2) conflict or disagreement resolution, (3) failure or mistake and recovery, (4) cross-functional collaboration or stakeholder management. Tips must guide HOW to tell the story naturally, not just what to mention.
- 1 culture fit question (why this company, values alignment, or motivation). Tip must encourage genuine, specific, and researched answers.

All content must be in English.`
}

function buildUserMessage(resume: string, targetCompany: string): string {
  if (targetCompany) {
    return `Please optimize my resume for ${targetCompany}.\n\nMy resume:\n${resume}`
  }
  return `Please optimize my resume for maximum impact.\n\nMy resume:\n${resume}`
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { resume: rawResume, deviceId, targetCompany: rawTarget } = body as Record<string, unknown>

  if (!isValidDeviceId(deviceId)) {
    return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 })
  }

  const resume = sanitizeText(rawResume, 8000)
  if (!resume || resume.length < 50) {
    return NextResponse.json(
      { error: 'Resume is too short. Please paste your full resume.' },
      { status: 400 }
    )
  }

  const targetCompany = sanitizeText(rawTarget, 100)

  let usage
  try {
    usage = await getUsage(deviceId as string)
  } catch (err) {
    console.error('[generate] getUsage failed:', err)
    return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 })
  }

  if (!canGenerate(usage)) {
    return NextResponse.json(
      {
        error: 'quota_exceeded',
        message: 'You have used all free generations. Please purchase credits to continue.',
        totalUsed: usage.total_used,
        credits: usage.credits,
      },
      { status: 402 }
    )
  }

  let aiContent: string
  try {
    const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: buildSystemPrompt(targetCompany) },
          { role: 'user',   content: buildUserMessage(resume, targetCompany) },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text()
      console.error('[generate] DeepSeek error:', deepseekRes.status, errText)
      return NextResponse.json({ error: 'AI service error, please try again.' }, { status: 502 })
    }

    const aiData = await deepseekRes.json()
    aiContent = aiData.choices?.[0]?.message?.content ?? ''

    if (!aiContent) {
      throw new Error('Empty AI response')
    }
  } catch (err) {
    console.error('[generate] DeepSeek call failed:', err)
    return NextResponse.json({ error: 'AI service error, please try again.' }, { status: 502 })
  }

  let result: Record<string, unknown>
  try {
    result = JSON.parse(aiContent)
  } catch {
    console.error('[generate] Failed to parse AI JSON:', aiContent)
    return NextResponse.json({ error: 'AI response parsing error, please try again.' }, { status: 502 })
  }

  try {
    await incrementUsage(deviceId as string)
  } catch (err) {
    console.error('[generate] incrementUsage failed:', err)
  }

  return NextResponse.json({
    ...result,
    aiGenerated: true,
    targetCompany: targetCompany || null,
  })
}