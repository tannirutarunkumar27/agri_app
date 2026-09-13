import { NextResponse } from 'next/server'
import { addDisputeEvidence, getDisputeById } from '@/lib/trust/dispute-service'
import { getSessionFromCookies } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to submit evidence.' }, { status: 401 })
    }

    const { id } = await params
    const dispute = await getDisputeById(id)
    if (!dispute) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 })
    }

    if (session.role !== 'admin' && dispute.raisedBy !== session.userId && dispute.raisedAgainst !== session.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden: You are not authorized to add evidence to this dispute.' }, { status: 403 })
    }

    const body = await request.json()
    const { evidenceType, fileUrl, fileName, notes, metadata } = body

    if (!evidenceType || !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required evidence fields: evidenceType, fileUrl' },
        { status: 400 }
      )
    }

    const uploadedBy = session.userId
    const uploaderRole = session.role === 'admin' ? 'admin' : (session.userId === dispute.raisedBy ? 'buyer' : 'farmer')

    const evidence = await addDisputeEvidence({
      disputeId: id,
      uploadedBy,
      uploaderRole,
      evidenceType,
      fileUrl,
      fileName,
      notes,
      metadata
    })

    return NextResponse.json({ success: true, evidence })
  } catch (error: any) {
    console.error('[API /api/trust/disputes/[id]/evidence POST] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit evidence' }, { status: 500 })
  }
}
