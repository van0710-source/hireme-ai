import { NextResponse } from 'next/server';
import {
  createCreemCheckout,
  getCreemProductId,
  type CreemProductType,
} from '@/lib/creem';
import { isValidDeviceId } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deviceId = body.deviceId as string;
    const productType = body.productType as CreemProductType;
    const locale = typeof body.locale === 'string' ? body.locale : 'en';

    if (!deviceId || !isValidDeviceId(deviceId)) {
      return NextResponse.json({ error: 'Valid deviceId required' }, { status: 400 });
    }

    if (productType !== 'single' && productType !== 'credits_pack') {
      return NextResponse.json({ error: 'Invalid productType' }, { status: 400 });
    }

    const productId = getCreemProductId(productType);
    if (!productId) {
      return NextResponse.json(
        { error: 'Product is not configured yet. Please try again later.' },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const { checkoutUrl, checkoutId } = await createCreemCheckout({
      productId,
      deviceId,
      productType,
      locale,
      successUrl: `${appUrl}/payment/success?deviceId=${encodeURIComponent(deviceId)}`,
      cancelUrl: `${appUrl}/payment/cancel`,
    });

    console.log('[checkout] created:', { checkoutId, deviceId, productType });

    // Keep snake_case — frontend reads checkout_url
    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (error) {
    console.error('[checkout] error:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
