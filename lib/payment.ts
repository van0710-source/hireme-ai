import {
  getCreemProductId,
  resolveProductTypeFromId,
  type CreemProductType,
} from '@/lib/creem';
import { createAdminClient } from '@/lib/supabase-admin';
import { CREDITS_PACK_AMOUNT } from '@/lib/quota';
import { isValidDeviceId } from '@/lib/validation';

export interface CheckoutCreditInput {
  checkoutId: string;
  productId?: string;
  deviceId: string;
  productType?: CreemProductType | string | null;
  transactionId?: string | null;
  amountUsd?: number | null;
}

export interface ApplyCreditResult {
  duplicate: boolean;
  usesAdded?: number;
  creditsAdded?: number;
  deviceId?: string;
}

export async function applyCheckoutCredit(
  input: CheckoutCreditInput
): Promise<ApplyCreditResult> {
  const { checkoutId, deviceId } = input;

  if (!checkoutId || !deviceId || !isValidDeviceId(deviceId)) {
    throw new Error('Missing checkout metadata: checkoutId or deviceId');
  }

  const productType: CreemProductType | null =
    input.productType === 'single' || input.productType === 'credits_pack'
      ? input.productType
      : input.productId
        ? resolveProductTypeFromId(input.productId)
        : null;

  let productId = input.productId ?? '';
  if (!productId && productType) {
    productId = getCreemProductId(productType) ?? '';
  }

  if (!productType || !productId) {
    throw new Error(
      `Unknown product (productId=${input.productId ?? 'none'}, productType=${input.productType ?? 'none'})`
    );
  }

  console.log('[payment] applying credit:', {
    checkoutId,
    deviceId,
    productId,
    productType,
    transactionId: input.transactionId ?? null,
  });

  const supabase = createAdminClient();

  const { data: existingTx } = await supabase
    .from('payment_transactions')
    .select('id')
    .eq('creem_checkout_id', checkoutId)
    .maybeSingle();

  if (existingTx) {
    console.log('[payment] duplicate checkout skipped:', checkoutId);
    return { duplicate: true, deviceId };
  }

  const usesAdded = productType === 'single' ? 1 : 0;
  const creditsAdded = productType === 'credits_pack' ? CREDITS_PACK_AMOUNT : 0;

  const { error: txError } = await supabase.from('payment_transactions').insert({
    creem_checkout_id: checkoutId,
    device_id: deviceId,
    product_id: productId,
    product_type: productType,
    amount_usd: input.amountUsd ?? null,
    credits_added: creditsAdded,
    uses_added: usesAdded,
    status: 'completed',
  });

  if (txError) {
    if (txError.code === '23505') {
      console.log('[payment] duplicate insert blocked:', checkoutId);
      return { duplicate: true, deviceId };
    }
    throw txError;
  }

  const { data: device } = await supabase
    .from('anonymous_devices')
    .select('paid_uses, credits')
    .eq('device_id', deviceId)
    .maybeSingle();

  const currentPaidUses = device?.paid_uses ?? 0;
  const currentCredits = device?.credits ?? 0;

  await supabase.from('anonymous_devices').upsert(
    {
      device_id: deviceId,
      last_seen_at: new Date().toISOString(),
      paid_uses: currentPaidUses + usesAdded,
      credits: currentCredits + creditsAdded,
    },
    { onConflict: 'device_id' }
  );

  console.log('[payment] credits applied:', {
    checkoutId,
    deviceId,
    productType,
    usesAdded,
    creditsAdded,
    transactionId: input.transactionId ?? null,
  });

  return { duplicate: false, usesAdded, creditsAdded, deviceId };
}
