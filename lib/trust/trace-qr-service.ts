import QRCode from 'qrcode'
import { queryOne, query } from '@/lib/db'

export interface PublicTraceabilityData {
  lotId: string
  commodityName: string
  variety?: string
  harvestDate?: string
  originDistrict?: string
  originState?: string
  producer: {
    displayName: string
    verificationLevel: string
    trustScore: number
    verifiedSince?: string
  }
  quality: {
    grade: string
    inspectionSource: string
    moisturePercentage?: number
    defectPercentage?: number
    foreignMatterPercentage?: number
    sizeUniformity?: string
    shelfLifeDays?: number
    storageCondition?: string
    weighbridgeNetKg?: number
    weighbridgeStationName?: string
    weighedAt?: string
    verifiedAt: string
    inspectionImages: string[]
  }
  milestones: Array<{
    title: string
    date: string
    description: string
    verified: boolean
  }>
}

/**
 * Generates an SVG string representation of the QR code pointing to the public trace URL.
 */
export async function generateLotQrCodeSvg(lotId: string, baseUrl: string = 'https://farmdirect.app'): Promise<string> {
  const traceUrl = `${baseUrl.replace(/\/$/, '')}/trace/${encodeURIComponent(lotId)}`
  return await QRCode.toString(traceUrl, {
    type: 'svg',
    margin: 1,
    color: {
      dark: '#166534', // Forest green
      light: '#ffffff'
    }
  })
}

/**
 * Generates a base64 Data URL for image rendering.
 */
export async function generateLotQrCodeDataUrl(lotId: string, baseUrl: string = 'https://farmdirect.app'): Promise<string> {
  const traceUrl = `${baseUrl.replace(/\/$/, '')}/trace/${encodeURIComponent(lotId)}`
  return await QRCode.toDataURL(traceUrl, {
    width: 280,
    margin: 2,
    color: {
      dark: '#166534',
      light: '#ffffff'
    }
  })
}

/**
 * Fetches and strictly sanitizes/redacts data for the public provenance page.
 * Strictly guarantees that private financial information, phone numbers, and home addresses are never exposed.
 */
export async function getPublicTraceabilityPayload(lotId: string): Promise<PublicTraceabilityData | null> {
  // Query produce quality record and linked producer
  const record = await queryOne<any>(`
    SELECT 
      pqr.*,
      u.name as producer_name,
      u.verification_level as producer_vlevel,
      u.trust_score as producer_trust_score,
      u.created_at as producer_member_since,
      u.district as farm_district,
      u.state as farm_state,
      pqr.inspected_at as batch_harvest_date
    FROM produce_quality_records pqr
    LEFT JOIN produce_orders o ON pqr.order_id = o.id
    LEFT JOIN users u ON (o.farmer_id = u.id OR pqr.inspector_id = u.id)
    WHERE pqr.lot_id = $1
    ORDER BY pqr.inspected_at DESC
    LIMIT 1;
  `, [lotId])

  if (!record) return null

  // Sanitize producer display name
  const displayName = record.producer_name
    ? record.producer_name.split(' ')[0] + ' (FarmDirect Producer)'
    : 'Certified Regional Producer'

  const qa = typeof record.quality_attributes === 'object' ? record.quality_attributes : JSON.parse(record.quality_attributes || '{}')
  const wb = typeof record.weighbridge_data === 'object' ? record.weighbridge_data : JSON.parse(record.weighbridge_data || '{}')
  const images: string[] = Array.isArray(qa.inspection_images) ? qa.inspection_images : []

  const verifiedTimestamp = record.inspected_at || record.created_at

  const milestones = [
    {
      title: 'Batch Registered & Inspected',
      date: verifiedTimestamp,
      description: `Quality graded as ${record.grade} via ${record.inspection_source.replace(/_/g, ' ')}.`,
      verified: true
    }
  ]

  if (wb.weighing_timestamp && wb.net_weight) {
    milestones.push({
      title: 'Weighbridge Certified',
      date: wb.weighing_timestamp,
      description: `Net payload verified at ${wb.weighbridge_name || 'Station'}: ${wb.net_weight} kg.`,
      verified: true
    })
  }

  if (record.delivered_quantity) {
    milestones.push({
      title: 'Buyer Destination Verification',
      date: record.updated_at || record.created_at,
      description: `Delivered quantity confirmed: ${record.delivered_quantity} kg.`,
      verified: true
    })
  }

  return {
    lotId: record.lot_id,
    commodityName: record.commodity_name,
    variety: record.variety_name || undefined,
    harvestDate: record.batch_harvest_date || undefined,
    originDistrict: record.farm_district || 'Regional Mandi Cluster',
    originState: record.farm_state || 'Maharashtra',
    producer: {
      displayName,
      verificationLevel: record.producer_vlevel || 'UNVERIFIED',
      trustScore: record.producer_trust_score || 50,
      verifiedSince: record.producer_member_since
    },
    quality: {
      grade: record.grade,
      inspectionSource: record.inspection_source,
      moisturePercentage: record.moisture ? Number(record.moisture) : undefined,
      defectPercentage: qa.defect_percentage ? Number(qa.defect_percentage) : undefined,
      foreignMatterPercentage: qa.foreign_matter_percentage ? Number(qa.foreign_matter_percentage) : undefined,
      sizeUniformity: qa.size_uniformity || undefined,
      shelfLifeDays: qa.shelf_life_days ? Number(qa.shelf_life_days) : undefined,
      storageCondition: qa.storage_condition || undefined,
      weighbridgeNetKg: wb.net_weight ? Number(wb.net_weight) : undefined,
      weighbridgeStationName: wb.weighbridge_name || undefined,
      weighedAt: wb.weighing_timestamp || undefined,
      verifiedAt: verifiedTimestamp,
      inspectionImages: images
    },
    milestones
  }
}
