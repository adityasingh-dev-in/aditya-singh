import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getJwtSecret } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. If already authenticated and accessing login, redirect to /admin dashboard
  if (pathname === '/admin/login') {
    const token = req.cookies.get('admin_session')?.value
    if (token) {
      try {
        await jwtVerify(token, getJwtSecret())
        return NextResponse.redirect(new URL('/admin', req.url))
      } catch {
        const res = NextResponse.next()
        res.cookies.delete('admin_session')
        return res
      }
    }
    return NextResponse.next()
  }

  const isProtectedAdmin = pathname.startsWith('/admin')
  const isProtectedApi =
    pathname === '/api/posts' ||
    pathname.startsWith('/api/posts/') ||
    pathname === '/api/upload-url' ||
    pathname.startsWith('/api/upload-url/')

  if (!isProtectedAdmin && !isProtectedApi) {
    return NextResponse.next()
  }

  // 2. CSRF & Origin validation on mutating API requests
  if (isProtectedApi && req.method !== 'GET' && req.method !== 'HEAD') {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    if (origin && host) {
      try {
        const originHost = new URL(origin).host
        if (originHost !== host) {
          return NextResponse.json(
            { error: 'Forbidden: Cross-site request rejected' },
            { status: 403 },
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Forbidden: Malformed origin header' },
          { status: 403 },
        )
      }
    }
  }

  // 3. Verify session token
  const token = req.cookies.get('admin_session')?.value

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await jwtVerify(token, getJwtSecret())
    return NextResponse.next()
  } catch {
    // Token invalid or expired
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', req.url)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete('admin_session')
    return res
  }
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/posts',
    '/api/posts/:path*',
    '/api/upload-url',
    '/api/upload-url/:path*',
  ],
}

