import { query, queryOne, execute } from '@/lib/db'
import { logTrustAudit } from './verification-service'

export type QualityInspectionSource = 
  | 'SELF_DECLARED' 
  | 'BUYER_VERIFIED' 
  | 'PLATFORM_VERIFIED' 
  | 'THIRD_PARTY_VERIFIED'

export type QualityGrade = 'A' | 'B' | 'C' | 'REJECT'

export interface ProduceQualityRecord {
  id: string
  lotId: string
  orderId?: string
  listingId?: string
  inspectorId?: string
  inspectorName?: string
  inspectionSource: QualityInspectionSource
  commodityName: string
  variety?: string
  grade: QualityGrade
  moisturePercentage?: number
  foreignMatterPercentage?: number
  defectPercentage?: number
  sizeUniformity?: string
  shelfLifeDays?: number
  storageCondition?: string
  declaredQuantityKg?: number
  confirmedQuantityKg?: number
  deliveredQuantityKg?: number
  quantityVariancePercentage?: number
  weighbridgeGrossKg?: number
  weighbridgeTareKg?: number
  weighbridgeNetKg?: number
  weighbridgeSlipNumber?: string
  weighbridgeStationName?: string
  weighedAt?: string
  labReportUrl?: string
  inspectionImages: string[]
  notes?: string
  verifiedAt: string
  createdAt: string
}

/**
 * Creates or logs a produce quality inspection or self-declaration record.
 */
export async function createProduceQualityRecord(params: {
  lotId: string
  orderId?: string
  listingId?: string
  commodityId?: string
  inspectorId?: string
  inspectionSource: QualityInspectionSource
  commodityName: string
  variety?: string
  grade: QualityGrade
  moisturePercentage?: number
  foreignMatterPercentage?: number
  defectPercentage?: number
  sizeUniformity?: string
  shelfLifeDays?: number
  storageCondition?: string
  declaredQuantityKg?: number
  confirmedQuantityKg?: number
  deliveredQuantityKg?: number
  weighbridgeGrossKg?: number
  weighbridgeTareKg?: number
  weighbridgeNetKg?: number
  weighbridgeSlipNumber?: string
  weighbridgeStationName?: string
  weighedAt?: string
  labReportUrl?: string
  inspectionImages?: string[]
  notes?: string
}): Promise<ProduceQualityRecord> {
  const recordId = `PQR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`

  // Calculate net weight if gross and tare are supplied and net is omitted
  let netKg = params.weighbridgeNetKg
  if (!netKg && params.weighbridgeGrossKg && params.weighbridgeTareKg) {
    netKg = Number((params.weighbridgeGrossKg - params.weighbridgeTareKg).toFixed(2))
  }

  const declaredKg = params.declaredQuantityKg || 100
  const confirmedKg = params.confirmedQuantityKg || netKg || declaredKg

  const qualityAttrs = {
    defect_percentage: params.defectPercentage,
    foreign_matter_percentage: params.foreignMatterPercentage,
    size_uniformity: params.sizeUniformity,
    shelf_life_days: params.shelfLifeDays,
    storage_condition: params.storageCondition,
    inspection_images: params.inspectionImages || [],
    lab_report_url: params.labReportUrl
  }

  const weighbridgeJson = {
    gross_weight: params.weighbridgeGrossKg,
    tare_weight: params.weighbridgeTareKg,
    net_weight: netKg,
    receipt_number: params.weighbridgeSlipNumber,
    weighbridge_name: params.weighbridgeStationName,
    weighing_timestamp: params.weighedAt
  }

  await execute(`
    INSERT INTO produce_quality_records (
      id, lot_id, listing_id, order_id, commodity_id, commodity_name,
      variety_name, grade, moisture, declared_quantity, confirmed_quantity,
      delivered_quantity, quantity_unit, quality_attributes, inspection_status,
      inspection_source, inspected_at, inspector_id, notes, weighbridge_data,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'kg', $13,
      'VERIFIED', $14, NOW(), $15, $16, $17, NOW(), NOW()
    );
  `, [
    recordId,
    params.lotId,
    params.listingId || null,
    params.orderId || null,
    params.commodityId || null,
    params.commodityName,
    params.variety || null,
    params.grade,
    params.moisturePercentage !== undefined ? params.moisturePercentage : null,
    declaredKg,
    confirmedKg,
    params.deliveredQuantityKg || null,
    JSON.stringify(qualityAttrs),
    params.inspectionSource,
    params.inspectorId || null,
    params.notes || null,
    JSON.stringify(weighbridgeJson)
  ])

  if (params.inspectorId) {
    await logTrustAudit({
      actorId: params.inspectorId,
      actorRole: 'INSPECTOR',
      action: 'QUALITY_RECORD_CREATED',
      entity: 'QUALITY_RECORD',
      entityId: recordId,
      metadata: {
        lotId: params.lotId,
        commodity: params.commodityName,
        grade: params.grade,
        source: params.inspectionSource
      }
    })
  }

  const record = await getProduceQualityRecordById(recordId)
  if (!record) throw new Error('Failed to retrieve created quality record')
  return record
}

/**
 * Updates delivery quantity and variance calculation when produce reaches buyer.
 */
export async function updateDeliveredQuantity(params: {
  recordId: string
  deliveredQuantityKg: number
  inspectorId?: string
}): Promise<ProduceQualityRecord> {
  await execute(`
    UPDATE produce_quality_records
    SET delivered_quantity = $1, updated_at = NOW()
    WHERE id = $2;
  `, [params.deliveredQuantityKg, params.recordId])

  const updated = await getProduceQualityRecordById(params.recordId)
  if (!updated) throw new Error('Produce quality record not found')

  if (params.inspectorId) {
    await logTrustAudit({
      actorId: params.inspectorId,
      actorRole: 'USER',
      action: 'DELIVERY_QUANTITY_CONFIRMED',
      entity: 'QUALITY_RECORD',
      entityId: params.recordId,
      metadata: {
        deliveredQuantityKg: params.deliveredQuantityKg,
        variancePercentage: updated.quantityVariancePercentage
      }
    })
  }

  return updated
}

export async function getProduceQualityRecordById(id: string): Promise<ProduceQualityRecord | null> {
  const row = await queryOne<any>(`
    SELECT 
      pqr.*,
      u.name as inspector_name
    FROM produce_quality_records pqr
    LEFT JOIN users u ON pqr.inspector_id = u.id
    WHERE pqr.id = $1;
  `, [id])

  if (!row) return null
  return mapQualityRow(row)
}

export async function getQualityRecordsByLot(lotId: string): Promise<ProduceQualityRecord[]> {
  const rows = await query<any>(`
    SELECT 
      pqr.*,
      u.name as inspector_name
    FROM produce_quality_records pqr
    LEFT JOIN users u ON pqr.inspector_id = u.id
    WHERE pqr.lot_id = $1
    ORDER BY pqr.inspected_at DESC;
  `, [lotId])

  return rows.map(mapQualityRow)
}

export async function getQualityRecordsByOrder(orderId: string): Promise<ProduceQualityRecord[]> {
  const rows = await query<any>(`
    SELECT 
      pqr.*,
      u.name as inspector_name
    FROM produce_quality_records pqr
    LEFT JOIN users u ON pqr.inspector_id = u.id
    WHERE pqr.order_id = $1
    ORDER BY pqr.inspected_at DESC;
  `, [orderId])

  return rows.map(mapQualityRow)
}

function mapQualityRow(row: any): ProduceQualityRecord {
  const declared = row.declared_quantity ? Number(row.declared_quantity) : undefined
  const delivered = row.delivered_quantity ? Number(row.delivered_quantity) : undefined
  let variancePct: number | undefined
  if (declared && delivered && declared > 0) {
    variancePct = Number((((delivered - declared) / declared) * 100).toFixed(2))
  }

  const qa = typeof row.quality_attributes === 'object' ? row.quality_attributes : JSON.parse(row.quality_attributes || '{}')
  const wb = typeof row.weighbridge_data === 'object' ? row.weighbridge_data : JSON.parse(row.weighbridge_data || '{}')

  return {
    id: row.id,
    lotId: row.lot_id,
    orderId: row.order_id,
    listingId: row.listing_id,
    inspectorId: row.inspector_id,
    inspectorName: row.inspector_name,
    inspectionSource: row.inspection_source,
    commodityName: row.commodity_name,
    variety: row.variety_name,
    grade: row.grade,
    moisturePercentage: row.moisture ? Number(row.moisture) : undefined,
    foreignMatterPercentage: qa.foreign_matter_percentage ? Number(qa.foreign_matter_percentage) : undefined,
    defectPercentage: qa.defect_percentage ? Number(qa.defect_percentage) : undefined,
    sizeUniformity: qa.size_uniformity,
    shelfLifeDays: qa.shelf_life_days ? Number(qa.shelf_life_days) : undefined,
    storageCondition: qa.storage_condition,
    declaredQuantityKg: declared,
    confirmedQuantityKg: row.confirmed_quantity ? Number(row.confirmed_quantity) : undefined,
    deliveredQuantityKg: delivered,
    quantityVariancePercentage: variancePct,
    weighbridgeGrossKg: wb.gross_weight ? Number(wb.gross_weight) : undefined,
    weighbridgeTareKg: wb.tare_weight ? Number(wb.tare_weight) : undefined,
    weighbridgeNetKg: wb.net_weight ? Number(wb.net_weight) : undefined,
    weighbridgeSlipNumber: wb.receipt_number,
    weighbridgeStationName: wb.weighbridge_name,
    weighedAt: wb.weighing_timestamp,
    labReportUrl: qa.lab_report_url,
    inspectionImages: Array.isArray(qa.inspection_images) ? qa.inspection_images : [],
    notes: row.notes,
    verifiedAt: row.inspected_at || row.created_at,
    createdAt: row.created_at
  }
}
