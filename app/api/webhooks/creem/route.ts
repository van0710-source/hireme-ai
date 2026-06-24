// app/api/webhooks/creem/route.ts
// POST /api/webhooks/creem
// Receives payment success events from Creem, verifies signature, updates quota

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-server'
import { addPaymentCredits } from '@/lib/usage'
import { isValidDeviceId, isValidProductType } from '@/lib/sanitize'

export const runtime = 'nodejs'

function verifyCreemSignature(
  payload: string,
  header: string | null,
  secret: string
): boolean {
  if (!header) return false
  if (!secret) return false

  try {
    // Format 1: "t=<timestamp>,v1=<hmac_hex>"
    if (header.includes('v1=')) {
      const parts = Object.fromEntries(
        header.split(',').map(part => {
          const idx = part.indexOf('=')
          return [part.slice(0, idx), part.slice(idx + 1)]
        })
      )
      const timestamp = parts['t']
      const signature = parts['v1']
      if (timestamp && signature) {
        const tsDiff = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10))
        if (tsDiff > 300) return false
        const signedPayload = `${timestamp}.${payload}`
        const expected = crypto
          .createHmac('sha256', secret)
          .update(signedPayload)
          .digest('hex')
        try {
          if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
            return true
          }
        } catch { /* length mismatch, try next */ }
      }
    }

    // Format 2: plain HMAC hex
    const expectedHex = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    if (header === expectedHex) return true

    // Format 3: base64
    const expectedBase64 = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64')
    if (header === expectedBase64) return true

    return false
  } catch {
    return false
  }
}