// app/api/auth/me/route.ts
// GET /api/auth/me
// Returns current user info from session cookie

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = getSession(req)

  if (!session) {
    return NextResponse.json({ user: null })
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, credits, total_used')
    .eq('id', session.userId)
    .maybeSingle()

  if (!user) {
    return NextResponse.json({ user: null })
  }

  const paidUsesRemaining = Math.floor(user.credits / 8)
  const freeRemaining = Math.max(0, 3 - user.total_used)
  const status = user.total_used < 3 ? 'free' : user.credits >= 8 ? 'credits' : 'blocked'

  return NextResponse.json({
    user: {
      email: user.email,
      credits: user.credits,
      totalUsed: user.total_used,
      freeRemaining,
      paidUsesRemaining,
      status,
      canGenerate: status !== 'blocked',
    },
  })
}