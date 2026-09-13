import { NextResponse } from 'next/server'
import { addDisputeEvidence } from '@/lib/trust/dispute-service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { uploadedBy, evidenceType, fileUrl, fileName, notes, metadata } = body

    if (!uploadedBy || !evidenceType || !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required evidence fields: uploadedBy, evidenceType, fileUrl' },
        { status: 400 }
      )
    }

    const evidence = await addDisputeEvidence({
      disputeId: id,
      uploadedBy,
      evidenceType,
      fileUrl,
      fileName,
      notes,
      metadata
    })

    return NextResponse.json({ success: true, evidence })
  } catch (error: any) {
    console.error('[API /api/trust/disputes/[id]/evidence POST] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
