import { NextResponse } from 'next/server'
import { getAllVerifications, reviewVerification, ReviewAction } from '@/lib/trust/verification-service'
import { query } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin privileges required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50

    const records = await getAllVerifications(status ? { status, limit } : { limit })

    // Summary stats
    const stats = await query<any>(`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM user_verifications 
      GROUP BY status;
    `)

    return NextResponse.json({ success: true, records, stats })
  } catch (error: any) {
    console.error('[API /api/admin/verification GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process verification request' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin privileges required.' }, { status: 403 })
    }

    const body = await request.json()
    const { verificationId, action, adminId = session.userId || 'admin-system', rejectionReason, notes } = body

    if (!verificationId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: verificationId, action' },
        { status: 400 }
      )
    }

    const updated = await reviewVerification({
      verificationId,
      action: action as ReviewAction,
      adminId,
      rejectionReason,
      notes
    })

    return NextResponse.json({ success: true, record: updated })
  } catch (error: any) {
    console.error('[API /api/admin/verification POST] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process verification request' }, { status: 500 })
  }
}
