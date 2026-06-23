import { NextResponse } from 'next/server';
import {
  createCreemCheckout,
  extractCheckoutCreditInput,
  isCheckoutCreditExtract,
  parseWebhookEvent,
  verifyCreemSignature,
} from '@/lib/creem';
import { applyCheckoutCredit } from '@/lib/payment';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('creem-signature');

  console.log('[webhook] incoming request', {
    hasSignature: Boolean(signature),
    bodyLength: rawBody.length,
  });

  if (!verifyCreemSignature(rawBody, signature)) {
    console.warn('[webhook] invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let eventType: string;
  let checkout: Record<string, unknown> | null;

  try {
    const parsed = parseWebhookEvent(rawBody);
    eventType = parsed.eventType;
    checkout = parsed.checkout;
  } catch (error) {
    console.error('[webhook] invalid JSON payload:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  console.log('[webhook] event received:', eventType);

  try {
    if (eventType === 'checkout.completed' && checkout) {
      const extracted = extractCheckoutCreditInput(checkout);

      if (!isCheckoutCreditExtract(extracted)) {
        console.error('[webhook] field extraction failed:', {
          missingFields: extracted?.missingFields ?? ['checkout object null'],
          partial: extracted && 'partial' in extracted ? extracted.partial : null,
          rawId: checkout.id ?? null,
          rawMetadata: checkout.metadata ?? null,
          rawOrder: checkout.order ?? null,
        });
        return NextResponse.json(
          {
            error: 'Missing checkout metadata',
            missingFields: extracted && 'missingFields' in extracted ? extracted.missingFields : [],
          },
          { status: 422 }
        );
      }

      console.log('[webhook] parsed checkout fields:', {
        checkoutId: extracted.checkoutId,
        deviceId: extracted.deviceId,
        productType: extracted.productType,
        productId: extracted.productId,
        transactionId: extracted.transactionId,
        amountUsd: extracted.amountUsd,
      });

      const result = await applyCheckoutCredit({
        checkoutId: extracted.checkoutId,
        productId: extracted.productId,
        deviceId: extracted.deviceId,
        productType: extracted.productType,
        transactionId: extracted.transactionId,
        amountUsd: extracted.amountUsd,
      });

      console.log('[webhook] checkout.completed processed:', result);
    } else {
      console.log('[webhook] event ignored:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhook] processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
