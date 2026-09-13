import { query, queryOne, execute } from '@/lib/db'
import { createPlatformAlert } from './alert-service'

export interface AutomationRuleItem {
  id: string
  ruleName: string
  description: string
  triggerEvent: string
  triggerCondition: Record<string, any>
  actionType: string
  actionParams: Record<string, any>
  isActive: boolean
  triggerCount: number
  lastTriggeredAt: string | null
}

/**
 * Enterprise Digital Event Logging & Configurable Automation Engine for Industry 4.0.
 */

export async function logOperationalEvent(params: {
  entityType: string
  entityId: string
  eventType: string
  actorId?: string
  actorRole?: string
  metadata?: Record<string, any>
  source?: string
}): Promise<void> {
  try {
    await execute(`
      INSERT INTO operational_events (
        entity_type, entity_id, event_type, actor_id, actor_role, metadata, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [
      params.entityType,
      params.entityId,
      params.eventType,
      params.actorId || null,
      params.actorRole || 'system',
      JSON.stringify(params.metadata || {}),
      params.source || 'PLATFORM_CORE'
    ])
  } catch (error) {
    console.error('[Industry4 Event Engine] logOperationalEvent error:', error)
  }
}

export async function logLotTraceabilityEvent(params: {
  lotId: string
  eventType: string
  actorId?: string
  actorRole?: string
  location?: string
  latitude?: number
  longitude?: number
  metadata?: Record<string, any>
}): Promise<void> {
  try {
    await execute(`
      INSERT INTO lot_events (
        lot_id, event_type, actor_id, actor_role, location, latitude, longitude, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [
      params.lotId,
      params.eventType,
      params.actorId || null,
      params.actorRole || null,
      params.location || null,
      params.latitude || null,
      params.longitude || null,
      JSON.stringify(params.metadata || {})
    ])
  } catch (error) {
    console.error('[Industry4 Event Engine] logLotTraceabilityEvent error:', error)
  }
}

export async function getAutomationRules(): Promise<AutomationRuleItem[]> {
  try {
    const rows = await query<any>(`
      SELECT 
        id, rule_name, description, trigger_event, trigger_condition,
        action_type, action_params, is_active, trigger_count, last_triggered_at
      FROM automation_rules
      ORDER BY created_at ASC;
    `)

    return rows.map((r) => ({
      id: r.id,
      ruleName: r.rule_name,
      description: r.description,
      triggerEvent: r.trigger_event,
      triggerCondition: typeof r.trigger_condition === 'object' ? r.trigger_condition : {},
      actionType: r.action_type,
      actionParams: typeof r.action_params === 'object' ? r.action_params : {},
      isActive: r.is_active,
      triggerCount: r.trigger_count,
      lastTriggeredAt: r.last_triggered_at
    }))
  } catch (error) {
    console.error('[Industry4 Event Engine] getAutomationRules error:', error)
    return []
  }
}

export async function toggleRuleActive(ruleId: string, isActive: boolean): Promise<boolean> {
  try {
    await execute('UPDATE automation_rules SET is_active = $1 WHERE id = $2;', [isActive, ruleId])
    return true
  } catch (error) {
    console.error('[Industry4 Event Engine] toggleRuleActive error:', error)
    return false
  }
}

/**
 * Evaluates active automation rules and triggers designated actions.
 */
export async function evaluateAutomationEngine(): Promise<{
  rulesEvaluated: number
  actionsTriggered: number
  logs: string[]
}> {
  const rules = await getAutomationRules()
  let actionsTriggered = 0
  const logs: string[] = []

  for (const rule of rules) {
    if (!rule.isActive) continue

    try {
      if (rule.triggerEvent === 'MARKET_PRICE_VOLATILITY') {
        const threshold = rule.triggerCondition.threshold_percent || 5.0
        const highSwing = await queryOne<{ commodity: string; pct_diff: string }>(`
          WITH recent AS (
            SELECT 
              commodity_id, 
              (MAX(modal_price) - MIN(modal_price)) / NULLIF(MIN(modal_price), 0) * 100 as pct_diff
            FROM market_prices
            WHERE arrival_date >= CURRENT_DATE - INTERVAL '3 days'
            GROUP BY commodity_id
            HAVING (MAX(modal_price) - MIN(modal_price)) / NULLIF(MIN(modal_price), 0) * 100 > $1
            LIMIT 1
          )
          SELECT c.name as commodity, ROUND(r.pct_diff::numeric, 1) as pct_diff
          FROM recent r
          JOIN commodities c ON r.commodity_id = c.id;
        `, [threshold])

        if (highSwing) {
          await createPlatformAlert({
            alertType: rule.actionParams.alert_type || 'WARNING',
            category: 'MARKET',
            title: `Automated Trigger: ${highSwing.commodity} Price Volatility`,
            message: `${highSwing.commodity} experienced a ${highSwing.pct_diff}% price movement over 3 days (threshold > ${threshold}%).`,
            metadata: { rule_id: rule.id, detected_diff: highSwing.pct_diff }
          })
          await execute('UPDATE automation_rules SET trigger_count = trigger_count + 1, last_triggered_at = CURRENT_TIMESTAMP WHERE id = $1;', [rule.id])
          actionsTriggered++
          logs.push(`Fired ${rule.ruleName}: Price shift detected for ${highSwing.commodity}`)
        }
      } else if (rule.triggerEvent === 'DELIVERY_OVERDUE') {
        const overdueCount = await queryOne<{ count: string }>(`
          SELECT COUNT(*) as count
          FROM delivery_jobs
          WHERE expected_delivery_date < CURRENT_DATE
          AND delivery_status NOT IN ('DELIVERED', 'COMPLETED', 'CANCELLED');
        `)

        const count = parseInt(overdueCount?.count || '0', 10)
        if (count > 0) {
          await createPlatformAlert({
            alertType: rule.actionParams.alert_type || 'CRITICAL',
            category: 'LOGISTICS',
            title: `Automated Escalation: ${count} Deliveries Overdue`,
            message: `${count} in-transit produce delivery jobs have breached the expected delivery SLA date.`,
            metadata: { rule_id: rule.id, overdue_jobs_count: count }
          })
          await execute('UPDATE automation_rules SET trigger_count = trigger_count + 1, last_triggered_at = CURRENT_TIMESTAMP WHERE id = $1;', [rule.id])
          actionsTriggered++
          logs.push(`Fired ${rule.ruleName}: ${count} overdue jobs detected`)
        }
      } else if (rule.triggerEvent === 'DEMAND_DEFICIT') {
        const threshold = rule.triggerCondition.deficit_threshold_percent || 25.0
        const deficitRow = await queryOne<{ count: string }>(`
          SELECT COUNT(*) as count
          FROM buyer_demand_requests d
          WHERE d.status IN ('OPEN', 'PARTIALLY_FILLED')
          AND NOT EXISTS (
            SELECT 1 FROM market_listings l
            WHERE l.crop_id = d.commodity_id AND l.status = 'ACTIVE'
          );
        `)

        const count = parseInt(deficitRow?.count || '0', 10)
        if (count > 0) {
          await createPlatformAlert({
            alertType: rule.actionParams.alert_type || 'WARNING',
            category: 'MARKET',
            title: `Automated Alert: ${count} Unmet Buyer Demands`,
            message: `${count} active buyer procurement demands have zero matching producer inventory listed in their category.`,
            metadata: { rule_id: rule.id, unmet_demands: count }
          })
          await execute('UPDATE automation_rules SET trigger_count = trigger_count + 1, last_triggered_at = CURRENT_TIMESTAMP WHERE id = $1;', [rule.id])
          actionsTriggered++
          logs.push(`Fired ${rule.ruleName}: ${count} unmet demands flagged`)
        }
      }
    } catch (ruleErr) {
      console.error(`[Industry4 Event Engine] Error evaluating rule ${rule.id}:`, ruleErr)
    }
  }

  return {
    rulesEvaluated: rules.length,
    actionsTriggered,
    logs
  }
}
