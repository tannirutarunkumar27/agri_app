import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME, UserSession } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identifier, password } = body

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered mobile number or email, and password.' },
        { status: 400 }
      )
    }

    const cleanIdentifier = sanitizeText(identifier).trim()

    // Try finding by phone (digits only match) or by email
    const cleanPhone = cleanIdentifier.replace(/\D/g, '').slice(-10)
    let user: any = null

    if (cleanPhone.length === 10) {
      user = await queryOne('SELECT * FROM users WHERE phone = $1', [cleanPhone])
    }

    if (!user) {
      user = await queryOne('SELECT * FROM users WHERE LOWER(email) = $1', [cleanIdentifier.toLowerCase()])
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this mobile or email. Please check or register.' },
        { status: 401 }
      )
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again.' },
        { status: 401 }
      )
    }

    const session: UserSession = {
      userId: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      district: user.district,
      state: user.state,
      kisanCoins: user.kisan_coins,
      role: user.role
    }

    const token = createSessionToken(session)
    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: session
    })

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Login failed' }, { status: 500 })
  }
}
