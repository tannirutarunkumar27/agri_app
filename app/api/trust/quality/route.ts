import { NextResponse } from 'next/server'
import { 
  createProduceQualityRecord, 
  updateDeliveredQuantity, 
  getQualityRecordsByLot, 
  getQualityRecordsByOrder,
  QualityInspectionSource,
  QualityGrade
} from '@/lib/trust/quality-records-service'
import { evaluateQualityVarianceRisk } from '@/lib/trust/risk-rules'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lotId = searchParams.get('lotId')
    const orderId = searchParams.get('orderId')

    if (lotId) {
      const records = await getQualityRecordsByLot(lotId)
      return NextResponse.json({ success: true, records })
    }

    if (orderId) {
      const records = await getQualityRecordsByOrder(orderId)
      return NextResponse.json({ success: true, records })
    }

    return NextResponse.json(
      { success: false, error: 'Please specify lotId or orderId' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[API /api/trust/quality GET] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      lotId,
      orderId,
      listingId,
      inspectorId,
      inspectionSource,
      commodityName,
      variety,
      grade,
      moisturePercentage,
      foreignMatterPercentage,
      defectPercentage,
      sizeUniformity,
      shelfLifeDays,
      storageCondition,
      declaredQuantityKg,
      confirmedQuantityKg,
      deliveredQuantityKg,
      weighbridgeGrossKg,
      weighbridgeTareKg,
      weighbridgeNetKg,
      weighbridgeSlipNumber,
      weighbridgeStationName,
      weighedAt,
      labReportUrl,
      inspectionImages,
      notes
    } = body

    if (!lotId || !inspectionSource || !commodityName || !grade) {
      return NextResponse.json(
        { success: false, error: 'Missing required quality record fields: lotId, inspectionSource, commodityName, grade' },
        { status: 400 }
      )
    }

    const record = await createProduceQualityRecord({
      lotId,
      orderId,
      listingId,
      inspectorId,
      inspectionSource: inspectionSource as QualityInspectionSource,
      commodityName,
      variety,
      grade: grade as QualityGrade,
      moisturePercentage: moisturePercentage !== undefined ? Number(moisturePercentage) : undefined,
      foreignMatterPercentage: foreignMatterPercentage !== undefined ? Number(foreignMatterPercentage) : undefined,
      defectPercentage: defectPercentage !== undefined ? Number(defectPercentage) : undefined,
      sizeUniformity,
      shelfLifeDays: shelfLifeDays !== undefined ? Number(shelfLifeDays) : undefined,
      storageCondition,
      declaredQuantityKg: declaredQuantityKg !== undefined ? Number(declaredQuantityKg) : undefined,
      confirmedQuantityKg: confirmedQuantityKg !== undefined ? Number(confirmedQuantityKg) : undefined,
      deliveredQuantityKg: deliveredQuantityKg !== undefined ? Number(deliveredQuantityKg) : undefined,
      weighbridgeGrossKg: weighbridgeGrossKg !== undefined ? Number(weighbridgeGrossKg) : undefined,
      weighbridgeTareKg: weighbridgeTareKg !== undefined ? Number(weighbridgeTareKg) : undefined,
      weighbridgeNetKg: weighbridgeNetKg !== undefined ? Number(weighbridgeNetKg) : undefined,
      weighbridgeSlipNumber,
      weighbridgeStationName,
      weighedAt,
      labReportUrl,
      inspectionImages,
      notes
    })

    return NextResponse.json({ success: true, record })
  } catch (error: any) {
    console.error('[API /api/trust/quality POST] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { recordId, deliveredQuantityKg, inspectorId } = body

    if (!recordId || deliveredQuantityKg === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: recordId, deliveredQuantityKg' },
        { status: 400 }
      )
    }

    const updated = await updateDeliveredQuantity({
      recordId,
      deliveredQuantityKg: Number(deliveredQuantityKg),
      inspectorId
    })

    // Run automated risk evaluation on variance
    const riskFlag = await evaluateQualityVarianceRisk(recordId)

    return NextResponse.json({ success: true, record: updated, riskFlag })
  } catch (error: any) {
    console.error('[API /api/trust/quality PATCH] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
