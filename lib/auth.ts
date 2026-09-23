import { SignJWT, jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'

export function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: ADMIN_JWT_SECRET environment variable is required in production.',
      )
    }
    return new TextEncoder().encode('dev-secret-change-in-production')
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error(
      'FATAL: ADMIN_JWT_SECRET must be at least 32 characters long in production.',
    )
  }
  return new TextEncoder().encode(secret)
}

const COOKIE_NAME = 'admin_session'
const TOKEN_EXPIRY = '7d'

/**
 * Create a signed JWT for admin session and return a cookie string.
 * Called from the /admin/login API route after verifying ADMIN_PASSWORD.
 */
export async function createAdminSession(): Promise<string> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret())

  return token
}

/**
 * Verify the admin session JWT from the request cookie.
 * Returns the payload if valid, null if invalid or missing.
 * Uses jose (Edge-compatible) — no Node.js crypto.
 */
export async function verifyAuthSession(
  req: NextRequest,
): Promise<{ role: string } | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as { role: string }
  } catch {
    return null
  }
}

export { COOKIE_NAME }
