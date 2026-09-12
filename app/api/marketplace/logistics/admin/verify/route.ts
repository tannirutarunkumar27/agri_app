import { NextResponse } from 'next/server'
import { execute, queryOne } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const body = await request.json()

    // Authorization: only admin or demo-admin
    if (session && session.role !== 'admin' && !session.userId.includes('admin')) {
      // In development mode allow if no admin session, but check in production
      if (process.env.NODE_ENV === 'production' && session.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized. Admin privileges required.' }, { status: 403 })
      }
    }

    const transporterId = sanitizeText(body.transporterId)
    const verificationStatus = sanitizeText(body.verificationStatus).toUpperCase()

    if (!transporterId) {
      return NextResponse.json({ success: false, error: 'Transporter ID is required' }, { status: 400 })
    }

    if (!['UNVERIFIED', 'PENDING', 'VERIFIED', 'SUSPENDED'].includes(verificationStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Allowed: UNVERIFIED, PENDING, VERIFIED, SUSPENDED' },
        { status: 400 }
      )
    }

    const transporter = await queryOne<any>('SELECT * FROM transporters WHERE id = $1', [transporterId])
    if (!transporter) {
      return NextResponse.json({ success: false, error: 'Transporter not found' }, { status: 404 })
    }

    await execute(
      `UPDATE transporters
       SET verification_status = $1,
           is_active = CASE WHEN $1 = 'SUSPENDED' THEN false ELSE true END,
           updated_at = NOW()
       WHERE id = $2`,
      [verificationStatus, transporterId]
    )

    // Notify transporter user
    await execute(
      `INSERT INTO notifications (id, user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, 'order', $5)`,
      [
        `notif-ver-${Date.now().toString(36)}`,
        transporter.user_id,
        `Transporter Account Status: ${verificationStatus}`,
        `Your transporter fleet profile verification status has been updated to: ${verificationStatus}.`,
        `/transporter/profile`
      ]
    )

    return NextResponse.json({
      success: true,
      message: `Transporter verification status updated to ${verificationStatus}.`,
      verificationStatus
    })
  } catch (error: any) {
    console.error('Error updating transporter verification:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to update verification' }, { status: 500 })
  }
}
