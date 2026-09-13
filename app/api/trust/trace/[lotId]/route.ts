import { NextResponse } from 'next/server'
import { getPublicTraceabilityPayload, generateLotQrCodeDataUrl, generateLotQrCodeSvg } from '@/lib/trust/trace-qr-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lotId: string }> }
) {
  try {
    const { lotId } = await params
    const format = new URL(request.url).searchParams.get('format')

    if (format === 'svg') {
      const svg = await generateLotQrCodeSvg(lotId)
      return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
      })
    }

    const payload = await getPublicTraceabilityPayload(lotId)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Traceability record not found for this Lot ID' }, { status: 404 })
    }

    const qrDataUrl = await generateLotQrCodeDataUrl(lotId)

    return NextResponse.json({
      success: true,
      lotId,
      provenance: payload,
      qrCodeDataUrl: qrDataUrl
    })
  } catch (error: any) {
    console.error('[API /api/trust/trace/[lotId] GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch digital traceability record' }, { status: 500 })
  }
}
