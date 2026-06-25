// lib/session.ts
// Read session from request cookies and return current user

import { NextRequest } from 'next/server'
import { verifySessionToken, SESSION_COOKIE, SessionPayload } from './auth'

export function getSession(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}