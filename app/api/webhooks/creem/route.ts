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

  const parts = Object.fromEntries(
    header.split(',').map(part => {
      const [k, v] = part.split('=')
      return [k, v]
    })
  )

  const timestamp = parts['t']
  const signature = parts['v1']

  if (!timestamp || !signature) return false

  const tsDiff = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10))
  if (tsDiff > 300) return false

  const signedPayload = `${timestamp}.${payload}`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  )
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sigHeader = req.headers.get('creem-signature')
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET ?? ''

  if (!verifyCreemSignature(rawBody, sigHeader, webhookSecret)) {
    console.warn('[webhook/creem] signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = event.type as string
  if (eventType !== 'payment.succeeded' && eventType !== 'checkout.completed') {
    return NextResponse.json({ received: true })
  }

  const data = (event.data ?? event.object ?? {}) as Record<string, unknown>
  const metadata = (data.metadata ?? {}) as Record<string, unknown>

  const paymentId   = (data.id ?? data.payment_id ?? data.checkout_id ?? data.order_id) as string
  const deviceId    = (metadata.device_id ?? metadata.deviceId) as string
  const productType = (metadata.product_type ?? metadata.productType) as string
  const amountCents = (data.amount ?? data.total ?? 0) as number

  if (!paymentId || !isValidDeviceId(deviceId) || !isValidProductType(productType)) {
    console.error('[webhook/creem] missing or invalid fields', { paymentId, deviceId, productType })
    return NextResponse.json({ error: 'Invalid payload fields', received: true })
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from('creem_events')
    .select('id')
    .eq('payment_id', paymentId)
    .maybeSingle()

  if (checkError) {
    console.error('[webhook/creem] idempotency check failed:', checkError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (existing) {
    console.info('[webhook/creem] duplicate event ignored:', paymentId)
    return NextResponse.json({ received: true, duplicate: true })
  }

  const { error: insertError } = await supabaseAdmin
    .from('creem_events')
    .insert({
      payment_id:   paymentId,
      product_type: productType,
      device_id:    deviceId,
      amount_cents: amountCents,
    })

  if (insertError) {
    if (insertError.code === '23505') {
      console.info('[webhook/creem] race-condition duplicate:', paymentId)
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error('[webhook/creem] insert event failed:', insertError)
    return NextResponse.json({ error: 'DB insert error' }, { status: 500 })
  }

  try {
    await addPaymentCredits(deviceId, productType)
    console.info('[webhook/creem] credited device:', deviceId, productType)
  } catch (err) {
    console.error('[webhook/creem] addPaymentCredits failed:', err)
    return NextResponse.json({ error: 'Credit update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}