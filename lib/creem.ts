import crypto from 'crypto';

export type CreemProductType = 'single' | 'credits_pack';

export interface CheckoutCreditExtract {
  checkoutId: string;
  productId: string;
  deviceId: string;
  productType: CreemProductType | null;
  transactionId: string | null;
  amountUsd: number | null;
}

export interface CheckoutCreditExtractFailure {
  missingFields: string[];
  partial: Record<string, unknown>;
}

export function isCreemTestMode(): boolean {
  if (process.env.CREEM_TEST_MODE === 'true') return true;
  if (process.env.CREEM_TEST_MODE === 'false') return false;
  return process.env.CREEM_API_KEY?.startsWith('creem_test') ?? false;
}

export function getCreemBaseUrl(): string {
  return isCreemTestMode() ? 'https://test-api.creem.io' : 'https://api.creem.io';
}

function creemApiUrl(path: string): string {
  return `${getCreemBaseUrl()}/v1${path}`;
}

export function getCreemProductId(productType: CreemProductType): string | null {
  if (productType === 'single') {
    return process.env.CREEM_PRODUCT_ID_SINGLE ?? null;
  }
  return process.env.CREEM_PRODUCT_ID_CREDITS ?? null;
}

export function resolveProductTypeFromId(productId: string): CreemProductType | null {
  if (productId === process.env.CREEM_PRODUCT_ID_SINGLE) return 'single';
  if (productId === process.env.CREEM_PRODUCT_ID_CREDITS) return 'credits_pack';
  return null;
}

function parseProductIdFromPayload(
  checkout: Record<string, unknown>,
  order: Record<string, unknown>
): string {
  const productField = checkout.product;

  if (typeof productField === 'string') return productField;
  if (productField && typeof productField === 'object') {
    const id = (productField as Record<string, unknown>).id;
    if (id) return String(id);
  }
  if (order.product) return String(order.product);
  if (checkout.product_id) return String(checkout.product_id);
  return '';
}

function parseProductTypeFromPayload(
  metadata: Record<string, unknown>,
  productId: string
): CreemProductType | null {
  const raw = metadata.productType;
  if (raw === 'single' || raw === 'credits_pack') return raw;
  if (productId) return resolveProductTypeFromId(productId);
  return null;
}

function resolveProductIdWithFallback(
  productId: string,
  productType: CreemProductType | null
): string {
  if (productId) return productId;
  if (productType) return getCreemProductId(productType) ?? '';
  return '';
}

export function extractCheckoutCreditInput(
  checkout: Record<string, unknown>
): CheckoutCreditExtract | CheckoutCreditExtractFailure | null {
  const checkoutId = String(checkout.id ?? '');
  const order = (checkout.order ?? {}) as Record<string, unknown>;
  const metadata = (checkout.metadata ?? {}) as Record<string, unknown>;

  const deviceId = String(metadata.deviceId ?? metadata.referenceId ?? '');
  const transactionId = order.transaction ? String(order.transaction) : null;

  let productId = parseProductIdFromPayload(checkout, order);
  const productType = parseProductTypeFromPayload(metadata, productId);
  productId = resolveProductIdWithFallback(productId, productType);

  const missingFields: string[] = [];
  if (!checkoutId) missingFields.push('checkout_id (id)');
  if (!deviceId) missingFields.push('device_id (metadata.deviceId)');
  if (!productId && !productType) {
    missingFields.push('product_id or product_type (metadata.productType)');
  }

  if (missingFields.length > 0) {
    return {
      missingFields,
      partial: {
        checkoutId: checkoutId || null,
        deviceId: deviceId || null,
        productType,
        productId: productId || null,
        transactionId,
        status: checkout.status ?? null,
      },
    };
  }

  const amountRaw = order.amount ?? checkout.amount;
  const amountUsd = typeof amountRaw === 'number' ? amountRaw / 100 : null;

  return {
    checkoutId,
    productId,
    deviceId,
    productType,
    transactionId,
    amountUsd,
  };
}

interface CreateCheckoutParams {
  productId: string;
  deviceId: string;
  productType: CreemProductType;
  successUrl: string;
}

export async function createCreemCheckout({
  productId,
  deviceId,
  productType,
  successUrl,
}: CreateCheckoutParams): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    throw new Error('CREEM_API_KEY is not configured');
  }

  const requestId = `checkout_${deviceId}_${Date.now()}`;

  const body: Record<string, unknown> = {
    product_id: productId,
    request_id: requestId,
    success_url: successUrl,
    metadata: {
      deviceId,
      productType,
      referenceId: deviceId,
    },
  };

  console.log('[creem] creating checkout:', {
    productId,
    deviceId,
    productType,
    successUrl,
  });

  const response = await fetch(creemApiUrl('/checkouts'), {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message ?? 'Failed to create checkout';
    console.error('[creem] checkout create failed:', { status: response.status, message, data });
    throw new Error(message);
  }

  const checkoutUrl = data.checkout_url ?? data.checkoutUrl;
  const checkoutId = data.id ?? data.checkout_id;

  if (!checkoutUrl || !checkoutId) {
    throw new Error('Invalid checkout response from Creem');
  }

  return { checkoutUrl, checkoutId };
}

export interface CreemCheckoutDetails {
  id: string;
  status: string;
  productId: string;
  deviceId: string | null;
  productType: string | null;
  transactionId: string | null;
  amountUsd: number | null;
}

export async function getCreemCheckout(checkoutId: string): Promise<CreemCheckoutDetails | null> {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return null;

  const headers = { 'x-api-key': apiKey };
  const urls = [
    creemApiUrl(`/checkouts/${checkoutId}`),
    creemApiUrl(`/checkouts?checkout_id=${encodeURIComponent(checkoutId)}`),
  ];

  let data: Record<string, unknown> | null = null;

  for (const url of urls) {
    const response = await fetch(url, { headers });
    if (response.ok) {
      data = (await response.json()) as Record<string, unknown>;
      break;
    }
  }

  if (!data) {
    console.error('[creem] get checkout failed:', checkoutId);
    return null;
  }

  const extracted = extractCheckoutCreditInput(data);
  if (!extracted || 'missingFields' in extracted) {
    console.error('[creem] get checkout parse failed:', extracted);
    return null;
  }

  return {
    id: extracted.checkoutId,
    status: String(data.status ?? 'unknown'),
    productId: extracted.productId,
    deviceId: extracted.deviceId,
    productType: extracted.productType,
    transactionId: extracted.transactionId,
    amountUsd: extracted.amountUsd,
  };
}

export function verifyCreemSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return computed === signature;
  }
}

export function parseWebhookEvent(rawBody: string): {
  eventType: string;
  checkout: Record<string, unknown> | null;
} {
  const event = JSON.parse(rawBody) as Record<string, unknown>;
  const eventType = String(
    event.eventType ?? event.type ?? event.event_type ?? ''
  );
  const checkout = (event.object ?? event.data ?? null) as Record<string, unknown> | null;
  return { eventType, checkout };
}

export function isCheckoutCreditExtract(
  result: CheckoutCreditExtract | CheckoutCreditExtractFailure | null
): result is CheckoutCreditExtract {
  return result !== null && !('missingFields' in result);
}
