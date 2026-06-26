// app/api/auth/register/route.ts
// POST /api/auth/register
// Body: { email: string }
// Sends a 6-digit verification code to the email address

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generateVerificationCode } from '@/lib/auth'
import { sanitizeText } from '@/lib/sanitize'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export async function POST(req: NextRequest) {
  // IP-level: max 5 registration attempts per 10 minutes
  const ip = getClientIp(req)
  if (!checkRateLimit(`register:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email: rawEmail } = body as Record<string, unknown>
  const email = sanitizeText(rawEmail, 254).toLowerCase().trim()

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Email-level: max 3 verification emails per 10 minutes (uses existing table)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count: recentCount } = await supabaseAdmin
    .from('verification_codes')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', tenMinutesAgo)

  if ((recentCount ?? 0) >= 3) {
    return NextResponse.json(
      { error: 'Too many verification emails sent. Please wait 10 minutes before trying again.' },
      { status: 429 }
    )
  }

  // Check if email already registered
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'This email is already registered. Please sign in instead.' },
      { status: 409 }
    )
  }

  // Generate and store verification code (expires in 10 minutes)
  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error: insertError } = await supabaseAdmin
    .from('verification_codes')
    .insert({ email, code, expires_at: expiresAt })

  if (insertError) {
    console.error('[register] insert code error:', insertError)
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
  }

  // Send email via Resend
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'HireMe AI <noreply@hireme-ai.com>',
      to: email,
      subject: 'Your HireMe AI verification code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#F97316">HireMe AI</h2>
          <p>Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111;margin:24px 0">
            ${code}
          </div>
          <p style="color:#666;font-size:14px">This code expires in 10 minutes.</p>
          <p style="color:#666;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  })

  if (!resendRes.ok) {
    const err = await resendRes.text()
    console.error('[register] resend error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
  }

  return NextResponse.json({ sent: true })
}