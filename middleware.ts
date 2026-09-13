import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE_NAME = 'farmos_session'

function getMiddlewareSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: Neither AUTH_SECRET nor JWT_SECRET environment variable is configured in production.')
    }
    return 'farmdirect-dev-only-local-secret-key-2026'
  }
  return secret
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return atob(base64)
}

async function verifyToken(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [payloadB64, sigB64] = parts

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(getMiddlewareSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const sigBinary = base64UrlDecode(sigB64)
    const sigBytes = new Uint8Array(sigBinary.length)
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i)
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(payloadB64)
    )

    if (!isValid) return null

    const payloadJson = base64UrlDecode(payloadB64)
    return JSON.parse(payloadJson)
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const session = await verifyToken(token)
    if (!session || session.role?.toLowerCase() !== 'admin') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'Admin privileges required')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
