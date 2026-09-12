import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const AUTH_SECRET = process.env.AUTH_SECRET || 'farmos-super-secret-production-salt-key-2026'
export const AUTH_COOKIE_NAME = 'farmos_session'

export interface UserSession {
  userId: string
  id?: string
  name: string
  phone: string
  email: string | null
  district?: string
  state?: string
  farmSizeAcres?: number
  primaryCrop?: string
  kisanCoins?: number
  role?: string
}

/**
 * Hash a password using scrypt with random salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { hash, salt }
}

/**
 * Verify a password against a hash and salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex')
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'))
  } catch {
    return false
  }
}

/**
 * Creates an HMAC-signed session token
 */
export function createSessionToken(session: UserSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

/**
 * Verifies and decodes a signed session token
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [payload, signature] = parts
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url')
    
    // Constant time comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    return decoded as UserSession
  } catch {
    return null
  }
}

/**
 * Read current session from Next.js server cookie store
 */
export async function getSessionFromCookies(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null
    return verifySessionToken(token)
  } catch {
    return null
  }
}
