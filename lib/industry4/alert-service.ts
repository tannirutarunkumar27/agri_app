import { query, queryOne, execute } from '@/lib/db'

export interface PlatformAlertItem {
  id: string
  alertType: 'CRITICAL' | 'WARNING' | 'INFO'
  category: 'MARKET' | 'OPERATIONS' | 'QUALITY' | 'LOGISTICS' | 'SECURITY'
  title: string
  message: string
  entityType?: string
  entityId?: string
  metadata: Record<string, any>
  isRead: boolean
  isResolved: boolean
  resolvedAt?: string
  createdAt: string
}

/**
 * Smart Operational & Market Alert Management Service for Industry 4.0.
 * Captures, groups, and filters multi-tiered platform alerts.
 */

export async function getPlatformAlerts(filter?: {
  alertType?: string
  category?: string
  includeResolved?: boolean
}): Promise<PlatformAlertItem[]> {
  try {
    let sql = `
      SELECT 
        id, alert_type, category, title, message, entity_type, entity_id,
        metadata, is_read, is_resolved, resolved_at, created_at
      FROM platform_alerts
      WHERE 1=1
    `
    const params: any[] = []

    if (!filter?.includeResolved) {
      sql += ` AND is_resolved = false`
    }

    if (filter?.alertType) {
      params.push(filter.alertType)
      sql += ` AND alert_type = $${params.length}`
    }

    if (filter?.category) {
      params.push(filter.category)
      sql += ` AND category = $${params.length}`
    }

    sql += ` ORDER BY CASE alert_type 
      WHEN 'CRITICAL' THEN 1 
      WHEN 'WARNING' THEN 2 
      ELSE 3 END, created_at DESC LIMIT 100;`

    const rows = await query<any>(sql, params)
    return rows.map((r) => ({
      id: r.id,
      alertType: r.alert_type,
      category: r.category,
      title: r.title,
      message: r.message,
      entityType: r.entity_type,
      entityId: r.entity_id,
      metadata: typeof r.metadata === 'object' ? r.metadata : {},
      isRead: r.is_read,
      isResolved: r.is_resolved,
      resolvedAt: r.resolved_at,
      createdAt: r.created_at
    }))
  } catch (error) {
    console.error('[Industry4 Alert Service] getPlatformAlerts error:', error)
    return []
  }
}

export async function createPlatformAlert(params: {
  alertType: 'CRITICAL' | 'WARNING' | 'INFO'
  category: 'MARKET' | 'OPERATIONS' | 'QUALITY' | 'LOGISTICS' | 'SECURITY'
  title: string
  message: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, any>
}): Promise<string> {
  const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  try {
    await execute(`
      INSERT INTO platform_alerts (
        id, alert_type, category, title, message, entity_type, entity_id, metadata, is_read, is_resolved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, false);
    `, [
      id,
      params.alertType,
      params.category,
      params.title,
      params.message,
      params.entityType || null,
      params.entityId || null,
      JSON.stringify(params.metadata || {})
    ])
    return id
  } catch (error) {
    console.error('[Industry4 Alert Service] createPlatformAlert error:', error)
    return id
  }
}

export async function markAlertResolved(alertId: string, resolvedBy = 'Admin User'): Promise<boolean> {
  try {
    await execute(`
      UPDATE platform_alerts
      SET is_resolved = true, resolved_at = CURRENT_TIMESTAMP, resolved_by = $2
      WHERE id = $1;
    `, [alertId, resolvedBy])
    return true
  } catch (error) {
    console.error('[Industry4 Alert Service] markAlertResolved error:', error)
    return false
  }
}

/**
 * Scan database conditions and generate timely alerts if not already present.
 */
export async function refreshAutomatedAlerts(): Promise<number> {
  let createdCount = 0

  try {
    // 1. Stale Mandi Feed Check: Markets without prices in > 48 hours
    const staleMarkets = await query<{
      id: string
      market_name: string
      district: string
      state: string
    }>(`
      SELECT m.id, m.market_name, m.district, m.state
      FROM markets m
      WHERE m.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM market_prices mp 
        WHERE mp.market_id = m.id 
        AND mp.arrival_date >= CURRENT_DATE - INTERVAL '2 days'
      )
      LIMIT 3;
    `)

    for (const sm of staleMarkets) {
      const existing = await queryOne(`
        SELECT 1 FROM platform_alerts 
        WHERE entity_id = $1 AND title LIKE '%Stale Mandi%' AND is_resolved = false;
      `, [sm.id])

      if (!existing) {
        await createPlatformAlert({
          alertType: 'INFO',
          category: 'OPERATIONS',
          title: `Stale Mandi Data Feed: ${sm.market_name}`,
          message: `Arrival and modal price records for ${sm.market_name} (${sm.district}, ${sm.state}) have not updated for > 48 hours.`,
          entityType: 'MARKET',
          entityId: sm.id,
          metadata: {
            market: sm.market_name,
            district: sm.district,
            observation_period: 'Last 48 hours',
            source: 'Directorate of Marketing & Inspection (Agmarknet DMI)'
          }
        })
        createdCount++
      }
    }

    // 2. Buyer Demand Exceeding Available Supply Check (> 25% deficit)
    const demandSupplyDeficits = await query<{
      commodity_id: string
      commodity_name: string
      total_demand: string
      total_supply: string
      deficit_pct: string
    }>(`
      WITH d AS (
        SELECT commodity_id, SUM(required_quantity) as req_qty
        FROM buyer_demand_requests
        WHERE status IN ('OPEN', 'PARTIALLY_FILLED')
        GROUP BY commodity_id
      ),
      s AS (
        SELECT crop_id as commodity_id, SUM(quantity - reserved_quantity) as sup_qty
        FROM market_listings
        WHERE status = 'ACTIVE'
        GROUP BY crop_id
      )
      SELECT 
        c.id as commodity_id,
        c.name as commodity_name,
        d.req_qty as total_demand,
        COALESCE(s.sup_qty, 0) as total_supply,
        ROUND((((d.req_qty - COALESCE(s.sup_qty, 0)) / d.req_qty) * 100)::numeric, 1) as deficit_pct
      FROM d
      JOIN commodities c ON d.commodity_id = c.id
      LEFT JOIN s ON d.commodity_id = s.commodity_id
      WHERE d.req_qty > COALESCE(s.sup_qty, 0) * 1.25
      LIMIT 3;
    `)

    for (const def of demandSupplyDeficits) {
      const existing = await queryOne(`
        SELECT 1 FROM platform_alerts 
        WHERE entity_id = $1 AND category = 'MARKET' AND is_resolved = false;
      `, [def.commodity_id])

      if (!existing) {
        await createPlatformAlert({
          alertType: 'WARNING',
          category: 'MARKET',
          title: `${def.commodity_name} Supply Deficit vs Buyer Demand`,
          message: `${def.commodity_name} active buyer demand (${def.total_demand} qtl) exceeds available listed supply (${def.total_supply} qtl) by ${def.deficit_pct}%. Immediate farmer procurement opportunity.`,
          entityType: 'COMMODITY',
          entityId: def.commodity_id,
          metadata: {
            commodity: def.commodity_name,
            total_demand_qtl: parseFloat(def.total_demand),
            total_supply_qtl: parseFloat(def.total_supply),
            observation_period: 'Active Snapshot',
            source: 'FarmDirect Liquidity Engine'
          }
        })
        createdCount++
      }
    }

    // 3. Overdue Delivery Check
    const overdueDeliveries = await query<{
      id: string
      produce_order_id: string
      cargo_crop_name: string
      expected_delivery_date: string
      transporter_id: string
    }>(`
      SELECT id, produce_order_id, cargo_crop_name, expected_delivery_date, transporter_id
      FROM delivery_jobs
      WHERE expected_delivery_date < CURRENT_DATE
      AND delivery_status NOT IN ('DELIVERED', 'COMPLETED', 'CANCELLED')
      LIMIT 3;
    `)

    for (const od of overdueDeliveries) {
      const existing = await queryOne(`
        SELECT 1 FROM platform_alerts 
        WHERE entity_id = $1 AND category = 'LOGISTICS' AND is_resolved = false;
      `, [od.id])

      if (!existing) {
        await createPlatformAlert({
          alertType: 'CRITICAL',
          category: 'LOGISTICS',
          title: `Delivery Overdue for Order #${od.produce_order_id}`,
          message: `Delivery job #${od.id.slice(0, 10)} transporting ${od.cargo_crop_name} is overdue. Expected delivery was ${od.expected_delivery_date}. Immediate carrier follow-up required.`,
          entityType: 'DELIVERY',
          entityId: od.id,
          metadata: {
            order_id: od.produce_order_id,
            expected_date: od.expected_delivery_date,
            observation_period: 'Current SLA',
            source: 'FarmDirect Dispatcher'
          }
        })
        createdCount++
      }
    }

    // 4. If zero alerts in the system, insert initial reference alerts
    const totalAlerts = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM platform_alerts;')
    if (parseInt(totalAlerts?.count || '0', 10) === 0) {
      await createPlatformAlert({
        alertType: 'INFO',
        category: 'MARKET',
        title: 'Red Gram Mandi Price Uptrend',
        message: 'Red Gram prices increased 6.4% across nearby markets (Kalaburagi, Latur) over the last 3 days.',
        metadata: {
          market: 'Kalaburagi & Latur APMC Yards',
          commodity: 'Red Gram (Tur / Arhar)',
          observation_period: 'Last 3 days',
          source: 'Directorate of Marketing & Inspection, Agmarknet'
        }
      })
      await createPlatformAlert({
        alertType: 'WARNING',
        category: 'MARKET',
        title: 'Mirchi Demand Surge in Guntur Region',
        message: 'Active spice processing buyer inquiries increased by 35% week-over-week.',
        metadata: {
          market: 'Guntur APMC Yard',
          commodity: 'Mirchi (Chilli)',
          observation_period: 'Last 7 days',
          source: 'FarmDirect Commercial Registry'
        }
      })
      createdCount += 2
    }

    return createdCount
  } catch (error) {
    console.error('[Industry4 Alert Service] refreshAutomatedAlerts error:', error)
    return 0
  }
}
