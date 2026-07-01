// app/api/auth/login/route.ts
// POST /api/auth/login
// Body: { email: string, password: string, deviceId?: string }
// Verifies credentials, migrates device credits, sets session cookie

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verifyPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth'
import { sanitizeText } from '@/lib/sanitize'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    )
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email: rawEmail, password, deviceId } = body as Record<string, unknown>
  const email = sanitizeText(rawEmail, 254).toLowerCase().trim()

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
  }

  // Find user
  const { data: user } = await getSupabaseAdmin()
    .from('users')
    .select('id, email, password_hash, credits, total_used')
    .eq('email', email)
    .maybeSingle()

  if (!user) {
    return NextResponse.json(
      { error: 'No account found with this email' },
      { status: 401 }
    )
  }

  // Verify password
  if (!verifyPassword(password as string, user.password_hash)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  // Migrate device credits if any
  if (typeof deviceId === 'string' && deviceId.length > 0) {
    const { data: deviceData } = await getSupabaseAdmin()
      .from('daily_usage')
      .select('credits')
      .eq('device_id', deviceId)
      .maybeSingle()

    if (deviceData && deviceData.credits > 0) {
      await getSupabaseAdmin()
        .from('users')
        .update({ credits: user.credits + deviceData.credits })
        .eq('id', user.id)

      await getSupabaseAdmin()
        .from('daily_usage')
        .update({ credits: 0 })
        .eq('device_id', deviceId)
    }
  }

  // Create session
  const token = createSessionToken({ userId: user.id, email: user.email })

  const res = NextResponse.json({
    success: true,
    user: { email: user.email, credits: user.credits, totalUsed: user.total_used },
  })

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return res
}