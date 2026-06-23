const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const HTML_TAG_REGEX = /<[^>]*>/g;

export const MAX_RESUME_LENGTH = 15_000;
export const MAX_TARGET_LENGTH = 200;

export function isValidDeviceId(deviceId: string): boolean {
  return UUID_REGEX.test(deviceId);
}

export function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== 'string') return '';
  return input.replace(HTML_TAG_REGEX, '').trim().slice(0, maxLength);
}

export function sanitizeOptionalTarget(input: unknown): string | undefined {
  const cleaned = sanitizeText(input, MAX_TARGET_LENGTH);
  return cleaned.length > 0 ? cleaned : undefined;
}
