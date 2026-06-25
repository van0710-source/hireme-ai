// lib/auth.ts
// Authentication utilities: password hashing, JWT session tokens

import crypto from 'crypto'

// ── Password hashing (SHA-256 + salt, no bcrypt dependency) ──────────────────

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const attempt = crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(attempt, 'hex')
  )
}

// ── Session token (signed JWT-like, no external library) ─────────────────────

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'hireme-ai-secret-change-in-prod'
const SESSION_COOKIE = 'hireme_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface SessionPayload {
  userId: string
  email: string
  iat: number
}

export function createSessionToken(payload: Omit<SessionPayload, 'iat'>): string {
  const data: SessionPayload = { ...payload, iat: Date.now() }
  const json = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(json)
    .digest('base64url')
  return `${json}.${sig}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [json, sig] = token.split('.')
    if (!json || !sig) return null
    const expected = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(json)
      .digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null
    const payload = JSON.parse(Buffer.from(json, 'base64url').toString()) as SessionPayload
    // Check token age
    if (Date.now() - payload.iat > SESSION_MAX_AGE * 1000) return null
    return payload
  } catch {
    return null
  }
}

export { SESSION_COOKIE, SESSION_MAX_AGE }

// ── Verification code ─────────────────────────────────────────────────────────

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}