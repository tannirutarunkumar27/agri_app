import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { normalizeAndValidatePhone, validatePinCode, sanitizeText } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const { searchParams } = new URL(request.url)
    const userId = session?.userId || searchParams.get('userId') || 'farmer-demo'

    const rows = await query<any>(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    )

    // Format for frontend (convert boolean is_default to 1/0 or boolean as expected)
    const addresses = rows.map((r) => ({
      ...r,
      isDefault: Boolean(r.is_default),
      is_default: r.is_default ? 1 : 0
    }))

    return NextResponse.json({ success: true, count: addresses.length, addresses })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const body = await request.json()
    const userId = session?.userId || body.userId || 'farmer-demo'

    const { fullName, phone, addressType, street, village, district, state, pincode, instructions, isDefault } = body

    if (!fullName || !phone || !street || !village || !pincode) {
      return NextResponse.json({ success: false, error: 'Missing required address fields' }, { status: 400 })
    }

    const phoneValidation = normalizeAndValidatePhone(phone)
    if (!phoneValidation.valid) {
      return NextResponse.json({ success: false, error: phoneValidation.error }, { status: 400 })
    }

    const pinValidation = validatePinCode(pincode)
    if (!pinValidation.valid) {
      return NextResponse.json({ success: false, error: pinValidation.error }, { status: 400 })
    }

    const addressId = `addr-${Date.now()}`

    if (isDefault) {
      await execute('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId])
    }

    await execute(
      `INSERT INTO addresses (
        id, user_id, full_name, phone, address_type, street, village, district, state, pincode, instructions, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        addressId,
        userId,
        sanitizeText(fullName),
        phoneValidation.normalized,
        sanitizeText(addressType || 'Farm Gate / Land'),
        sanitizeText(street),
        sanitizeText(village),
        sanitizeText(district || 'Pune'),
        sanitizeText(state || 'Maharashtra'),
        pinValidation.normalized,
        sanitizeText(instructions || ''),
        Boolean(isDefault)
      ]
    )

    return NextResponse.json({ success: true, message: 'Address saved successfully', addressId })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
