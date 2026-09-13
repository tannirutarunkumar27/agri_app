import { NextResponse } from 'next/server'
import { submitVerification, getVerificationsByUser, getAllVerifications } from '@/lib/trust/verification-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') as any

    if (userId) {
      const records = await getVerificationsByUser(userId)
      return NextResponse.json({ success: true, records })
    }

    const records = await getAllVerifications(status ? { status } : {})
    return NextResponse.json({ success: true, records })
  } catch (error: any) {
    console.error('[API /api/trust/verifications GET] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, verificationType, submittedLevel, documentReference, documentMetadata, notes } = body

    if (!userId || !verificationType || !submittedLevel) {
      return NextResponse.json(
        { success: false, error: 'Missing required verification fields: userId, verificationType, submittedLevel' },
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
