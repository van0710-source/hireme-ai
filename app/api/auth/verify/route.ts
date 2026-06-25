// app/api/auth/verify/route.ts
// POST /api/auth/verify
// Body: { email: string, code: string, password: string, deviceId?: string }
// Verifies code, creates user account, migrates device credits, sets session cookie

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { hashPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth'
import { sanitizeText } from '@/lib/sanitize'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email: rawEmail, code, password, deviceId } = body as Record<string, unknown>
  const email = sanitizeText(rawEmail, 254).toLowerCase().trim()

  if (!email || !code || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  // Verify code
  const { data: codeRecord } = await supabaseAdmin
    .from('verification_codes')
    .select('id, code, expires_at, used')
    .eq('email', email)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!codeRecord) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  if (codeRecord.code !== code) {
    return NextResponse.json({ error: 'Incorrect verification code' }, { status: 400 })
  }

  if (new Date(codeRecord.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 })
  }

  // Mark code as used
  await supabaseAdmin
    .from('verification_codes')
    .update({ used: true })
    .eq('id', codeRecord.id)

  // Get device credits to migrate
  let deviceCredits = 0
  let deviceTotalUsed = 0
  if (typeof deviceId === 'string' && deviceId.length > 0) {
    const { data: deviceData } = await supabaseAdmin
      .from('daily_usage')
      .select('credits, total_used')
      .eq('device_id', deviceId)
      .maybeSingle()
    if (deviceData) {
      deviceCredits = deviceData.credits ?? 0
      deviceTotalUsed = deviceData.total_used ?? 0
    }
  }

  // Create user account
  const passwordHash = hashPassword(password as string)
  const { data: user, error: createError } = await supabaseAdmin
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      credits: deviceCredits,
      total_used: deviceTotalUsed,
    })
    .select('id, email, credits, total_used')
    .single()

  if (createError) {
    console.error('[verify] create user error:', createError)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  // Clear device credits after migration
  if (typeof deviceId === 'string' && deviceId.length > 0) {
    await supabaseAdmin
      .from('daily_usage')
      .update({ credits: 0 })
      .eq('device_id', deviceId)
  }

  // Create session token
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