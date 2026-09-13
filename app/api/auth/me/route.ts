import { NextResponse } from 'next/server'
import { getSessionFromCookies, AUTH_COOKIE_NAME } from '@/lib/auth'
import { queryOne } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 200 })
    }

    const freshUser = await queryOne<any>(
      'SELECT id, name, phone, email, district, state, farm_size_acres, primary_crop, kisan_coins, role, verification_level, trust_score FROM users WHERE id = $1',
      [session.userId]
    )

    if (!freshUser) {
      return NextResponse.json({ success: false, user: null }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: freshUser.id,
        name: freshUser.name,
        phone: freshUser.phone,
        email: freshUser.email,
        district: freshUser.district,
        state: freshUser.state,
        farmSizeAcres: Number(freshUser.farm_size_acres),
        primaryCrop: freshUser.primary_crop,
        kisanCoins: freshUser.kisan_coins,
        role: freshUser.role,
        verificationLevel: freshUser.verification_level || 'UNVERIFIED',
        trustScore: freshUser.trust_score || 50
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
  return response
}
