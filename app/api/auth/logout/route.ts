// app/api/auth/logout/route.ts
// POST /api/auth/logout
// Clears session cookie

import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return res
}