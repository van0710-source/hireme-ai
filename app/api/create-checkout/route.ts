// app/api/create-checkout/route.ts
// POST /api/create-checkout
// Body: { deviceId: string, productType: 'single' | 'credits' }
// Creates a Creem hosted checkout session and returns the redirect URL

import { NextRequest, NextResponse } from 'next/server'
import { isValidDeviceId, isValidProductType } from '@/lib/sanitize'

export const runtime = 'nodejs'

const PRODUCT_MAP = {
  single:  process.env.CREEM_PRODUCT_SINGLE!,
  credits: process.env.CREEM_PRODUCT_CREDITS!,
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { deviceId, productType } = body as Record<string, unknown>

  if (!isValidDeviceId(deviceId)) {
    return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 })
  }
  if (!isValidProductType(productType)) {
    return NextResponse.json({ error: 'Invalid product type' }, { status: 400 })
  }

  const productId = PRODUCT_MAP[productType]
  if (!productId) {
    return NextResponse.json({ error: 'Product not configured' }, { status: 500 })
  }
console.log('[create-checkout] productType:', productType, 'productId:', PRODUCT_MAP[productType])
  console.log('[create-checkout] CREEM_API_KEY exists:', !!process.env.CREEM_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hireme-ai.com'

  try {
    const isTest = process.env.CREEM_API_KEY?.startsWith('creem_test')
const creemBaseUrl = isTest ? 'https://test-api.creem.io' : 'https://api.creem.io'
const creemRes = await fetch(`${creemBaseUrl}/v1/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CREEM_API_KEY!,
      },
      body: JSON.stringify({
        product_id:   productId,
        success_url:  `${appUrl}/payment/success?device=${deviceId}&type=${productType}`,
        cancel_url:   `${appUrl}/payment/cancel`,
        metadata: {
          device_id:    deviceId,
          product_type: productType,
        },
        request_id: `${deviceId}-${productType}-${Date.now()}`,
      }),
    })

    if (!creemRes.ok) {
      const errText = await creemRes.text()
      console.error('[create-checkout] Creem error:', creemRes.status, errText)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 502 }
      )
    }

    const session = await creemRes.json()
    const checkoutUrl: string = session.checkout_url ?? session.url

    if (!checkoutUrl) {
      console.error('[create-checkout] No checkout URL in response:', session)
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 502 })
    }

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error('[create-checkout] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}