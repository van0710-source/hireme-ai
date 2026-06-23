import { NextResponse } from 'next/server';
import { getCreemCheckout } from '@/lib/creem';
import { applyCheckoutCredit } from '@/lib/payment';
import { isValidDeviceId } from '@/lib/validation';

const COMPLETED_STATUSES = new Set(['completed', 'paid', 'succeeded']);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const checkoutId = body.checkoutId as string;
    const deviceId = body.deviceId as string;

    if (!checkoutId || !deviceId || !isValidDeviceId(deviceId)) {
      return NextResponse.json({ error: 'checkoutId and deviceId required' }, { status: 400 });
    }

    const checkout = await getCreemCheckout(checkoutId);
    if (!checkout) {
      return NextResponse.json({ error: 'Checkout not found' }, { status: 404 });
    }

    if (checkout.deviceId && checkout.deviceId !== deviceId) {
      return NextResponse.json({ error: 'Device mismatch' }, { status: 403 });
    }

    if (!COMPLETED_STATUSES.has(checkout.status.toLowerCase())) {
      return NextResponse.json(
        { error: 'Payment not completed yet', status: checkout.status },
        { status: 409 }
      );
    }

    console.log('[payment/confirm] confirming:', {
      checkoutId: checkout.id,
      deviceId,
      productType: checkout.productType,
      transactionId: checkout.transactionId,
    });

    const result = await applyCheckoutCredit({
      checkoutId: checkout.id,
      productId: checkout.productId || undefined,
      deviceId,
      productType: checkout.productType,
      transactionId: checkout.transactionId,
      amountUsd: checkout.amountUsd,
    });

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      usesAdded: result.usesAdded ?? 0,
      creditsAdded: result.creditsAdded ?? 0,
    });
  } catch (error) {
    console.error('[payment/confirm] error:', error);
    const message = error instanceof Error ? error.message : 'Confirm failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
