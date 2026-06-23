// lib/sanitize.ts
// Server-side input sanitization — strip dangerous HTML/script content
// Applied to all user inputs before passing to DeepSeek API

/**
 * Strip HTML tags and truncate to max length.
 * Does NOT use DOMParser (not available in Edge runtime).
 */
export function sanitizeText(input: unknown, maxLength = 8000): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/javascript:/gi, '')      // strip JS URIs
    .replace(/on\w+\s*=/gi, '')       // strip event handlers
    .trim()
    .slice(0, maxLength)
}

/** Validate device ID format (alphanumeric + hyphens, 8–64 chars) */
export function isValidDeviceId(id: unknown): id is string {
  if (typeof id !== 'string') return false
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id)
}

/** Validate product type */
export function isValidProductType(t: unknown): t is 'single' | 'credits' {
  return t === 'single' || t === 'credits'
}