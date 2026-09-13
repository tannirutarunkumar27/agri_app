import { NextRequest, NextResponse } from 'next/server'
import {
  getPlatformAlerts,
  createPlatformAlert,
  markAlertResolved,
  refreshAutomatedAlerts
} from '@/lib/industry4/alert-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const alertType = searchParams.get('type') || undefined
    const category = searchParams.get('category') || undefined
    const includeResolved = searchParams.get('includeResolved') === 'true'

    const alerts = await getPlatformAlerts({ alertType, category, includeResolved })

    // If zero active alerts, trigger refresh
    if (alerts.length === 0 && !includeResolved) {
      await refreshAutomatedAlerts()
      const refreshed = await getPlatformAlerts({ alertType, category, includeResolved: false })
      return NextResponse.json({
        success: true,
        data: refreshed,
        count: refreshed.length
      })
    }

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/alerts GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.title || !body.message || !body.alertType || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required alert fields (title, message, alertType, category)' },
        { status: 400 }
      )
    }

    const id = await createPlatformAlert({
      alertType: body.alertType,
      category: body.category,
      title: body.title,
      message: body.message,
      entityType: body.entityType,
      entityId: body.entityId,
      metadata: body.metadata
    })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('[API /api/admin/industry4/alerts POST] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { alertId, resolvedBy } = body
    if (!alertId) {
      return NextResponse.json({ success: false, error: 'alertId is required' }, { status: 400 })
    }

    const ok = await markAlertResolved(alertId, resolvedBy)
    return NextResponse.json({ success: ok })
  } catch (error) {
    console.error('[API /api/admin/industry4/alerts PATCH] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
