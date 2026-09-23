import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { createAdminSession, COOKIE_NAME } from '@/lib/auth'

export const runtime = 'nodejs'

// --- In-Memory Rate Limiter ---
interface AttemptRecord {
  count: number
  resetTime: number
}

const MAX_ATTEMPTS = 5
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const loginAttempts = new Map<string, AttemptRecord>()

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip') ?? '127.0.0.1'
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record) {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (now > record.resetTime) {
    loginAttempts.delete(ip)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfterSeconds }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + LOCKOUT_WINDOW_MS })
  } else {
    record.count += 1
  }

  // Periodic pruning if map gets large
  if (loginAttempts.size > 1000) {
    for (const [key, val] of loginAttempts.entries()) {
      if (now > val.resetTime) loginAttempts.delete(key)
    }
  }
}

function recordSuccessfulLogin(ip: string): void {
  loginAttempts.delete(ip)
}

function verifyPasswordConstantTime(
  input: unknown,
  expected: string | undefined,
): boolean {
  if (typeof input !== 'string' || !expected) {
    return false
  }
  // Enforce reasonable max length to prevent CPU exhaustion on huge payloads
  if (input.length > 512) {
    return false
  }

  const inputHash = createHash('sha256').update(input).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  return timingSafeEqual(inputHash, expectedHash)
}

export async function POST(req: NextRequest) {
  // 1. Origin verification to prevent CSRF login abuse
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json(
          { error: 'Forbidden: Invalid origin' },
          { status: 403 },
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Forbidden: Malformed origin' },
        { status: 403 },
      )
    }
  }

  // 2. Rate limit check
  const ip = getClientIp(req)
  const { allowed, retryAfterSeconds } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      {
        error: `Too many failed login attempts. Please wait ${retryAfterSeconds} seconds before trying again.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      },
    )
  }

  // 3. Parse JSON safely
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Malformed JSON payload' },
      { status: 400 },
    )
  }

  const { password } = (body as { password?: unknown }) ?? {}

  // 4. Timing-safe password verification
  const isValid = verifyPasswordConstantTime(
    password,
    process.env.ADMIN_PASSWORD,
  )

  if (!isValid) {
    recordFailedAttempt(ip)
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  recordSuccessfulLogin(ip)

  // 5. Generate session token and set secure strict cookie
  const token = await createAdminSession()

  const res = NextResponse.json({ success: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return res
}

