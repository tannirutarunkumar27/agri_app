import { NextRequest, NextResponse } from 'next/server'
import {
  getAutomationRules,
  toggleRuleActive,
  evaluateAutomationEngine
} from '@/lib/industry4/automation-engine'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rules = await getAutomationRules()
    return NextResponse.json({
      success: true,
      data: rules,
      count: rules.length
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/automation GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const result = await evaluateAutomationEngine()
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/automation POST] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { ruleId, isActive } = body
    if (!ruleId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'ruleId and isActive boolean are required' },
        { status: 400 }
      )
    }

    const ok = await toggleRuleActive(ruleId, isActive)
    return NextResponse.json({ success: ok })
  } catch (error) {
    console.error('[API /api/admin/industry4/automation PATCH] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
