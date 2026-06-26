// lib/rate-limit.ts
// In-memory rate limiter for serverless (per warm instance).
// Provides burst protection; not a substitute for infrastructure-level WAF.

interface RateLimitRecord {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

// Prune expired entries to avoid unbounded memory growth
function prune() {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) store.delete(key)
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key     Unique identifier (e.g. IP, email)
 * @param limit   Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  if (store.size > 5000) prune()

  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) return false

  record.count++
  return true
}

/** Extract best-effort IP from Next.js request headers */
export function getClientIp(req: Request): string {
  const headers = new Headers((req as Request).headers)
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
