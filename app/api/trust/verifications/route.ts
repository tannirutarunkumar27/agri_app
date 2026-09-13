import { NextResponse } from 'next/server'
import { submitVerification, getVerificationsByUser, getAllVerifications } from '@/lib/trust/verification-service'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to view verifications.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') as any

    if (session.role !== 'admin') {
      const records = await getVerificationsByUser(session.userId)
      return NextResponse.json({ success: true, records })
    }

    if (userId) {
      const records = await getVerificationsByUser(userId)
      return NextResponse.json({ success: true, records })
    }

    const records = await getAllVerifications(status ? { status } : {})
    return NextResponse.json({ success: true, records })
  } catch (error: any) {
    console.error('[API /api/trust/verifications GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to retrieve verifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to submit verification documents.' }, { status: 401 })
    }

    const body = await request.json()
    const { verificationType, submittedLevel, documentReference, documentMetadata, notes } = body

    const userId = session.role === 'admin' ? (body.userId || session.userId) : session.userId

    if (!userId || !verificationType || !submittedLevel) {
      return NextResponse.json(
        { success: false, error: 'Missing required verification fields: verificationType, submittedLevel' },
        { status: 400 }
      )
    }

    const record = await submitVerification({
      userId,
      verificationType,
      submittedLevel,
      documentReference,
      documentMetadata: documentMetadata || {},
      notes
    })

    return NextResponse.json({ success: true, record })
  } catch (error: any) {
    console.error('[API /api/trust/verifications POST] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit verification' }, { status: 500 })
  }
}
