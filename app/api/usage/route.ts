// app/api/usage/route.ts
// GET /api/usage?deviceId=xxx
// Returns current quota status — uses account quota if logged in, device quota otherwise

import { NextRequest, NextResponse } from 'next/server'
import { getUsage, getUserUsage, canGenerate, quotaStatus, FREE_USES, CREDITS_PER_USE } from '@/lib/usage'
import { isValidDeviceId } from '@/lib/sanitize'
import { getSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = getSession(req)

  try {
    let usage
    if (session) {
      usage = await getUserUsage(session.userId)
    } else {
      const deviceId = req.nextUrl.searchParams.get('deviceId')
      if (!isValidDeviceId(deviceId)) {
        return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 })
      }
      usage = await getUsage(deviceId)
    }

    const status = quotaStatus(usage)
    const freeRemaining = Math.max(0, FREE_USES - usage.total_used)
    const paidUsesRemaining = Math.floor(usage.credits / CREDITS_PER_USE)

    return NextResponse.json({
      status,
      canGenerate: canGenerate(usage),
      freeRemaining,
      credits: usage.credits,
      paidUsesRemaining,
      totalUsed: usage.total_used,
    })
  } catch (err) {
    console.error('[usage] error:', err)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}