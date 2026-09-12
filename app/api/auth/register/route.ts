import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME, UserSession } from '@/lib/auth'
import { normalizeAndValidatePhone, validateEmail, sanitizeText } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, password, district, state, farmSizeAcres, primaryCrop } = body

    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, phone number, and password are required.' },
        { status: 400 }
      )
    }

    const cleanName = sanitizeText(name)
    if (cleanName.length < 2) {
      return NextResponse.json({ success: false, error: 'Please enter a valid full name.' }, { status: 400 })
    }

    const phoneValidation = normalizeAndValidatePhone(phone)
    if (!phoneValidation.valid) {
      return NextResponse.json({ success: false, error: phoneValidation.error }, { status: 400 })
    }

    if (email && !validateEmail(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    // Check existing phone
    const existingPhone = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE phone = $1',
      [phoneValidation.normalized]
    )
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: 'An account with this mobile number already exists. Please sign in.' },
        { status: 409 }
      )
    }

    if (email) {
      const existingEmail = await queryOne<{ id: string }>(
        'SELECT id FROM users WHERE email = $1',
        [email.trim().toLowerCase()]
      )
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists.' },
          { status: 409 }
        )
      }
    }

    const userId = `farmer-${Date.now()}`
    const { hash, salt } = hashPassword(password)
    const initialCoins = 250

    await execute(
      `INSERT INTO users (id, name, phone, email, password_hash, salt, district, state, farm_size_acres, primary_crop, kisan_coins)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId,
        cleanName,
        phoneValidation.normalized,
        email ? email.trim().toLowerCase() : null,
        hash,
        salt,
        sanitizeText(district || 'Pune'),
        sanitizeText(state || 'Maharashtra'),
        Number(farmSizeAcres) || 2.0,
        sanitizeText(primaryCrop || 'General Crops'),
        initialCoins
      ]
    )

    // Insert welcome notifications
    await execute(
      `INSERT INTO notifications (id, user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        `notif-${Date.now()}-1`,
        userId,
        'Welcome to FarmOS!',
        'Your account is activated with 250 Kisan Coins welcome bonus.',
        'coin',
        '/store'
      ]
    )

    const session: UserSession = {
      userId,
      name: cleanName,
      phone: phoneValidation.normalized,
      email: email ? email.trim().toLowerCase() : null,
      district: district || 'Pune',
      state: state || 'Maharashtra',
      kisanCoins: initialCoins,
      role: 'farmer'
    }

    const token = createSessionToken(session)
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully with 250 Kisan Coins welcome bonus.',
      user: session
    })

    // Set secure HTTP-only cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return response
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Registration failed' }, { status: 500 })
  }
}
