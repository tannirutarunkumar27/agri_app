import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET() {
  try {
    const coupons = await query<any>(
      'SELECT code, discount_percent, max_discount, min_order_amount, description FROM coupons WHERE active = true'
    )
    const formatted = coupons.map((c) => ({
      code: c.code,
      discount_percent: Number(c.discount_percent),
      max_discount: Number(c.max_discount),
      min_order_amount: Number(c.min_order_amount),
      description: c.description
    }))
    return NextResponse.json({ success: true, count: formatted.length, coupons: formatted })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to process coupon request' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code, orderAmount = 0 } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 })
    }

    const coupon = await queryOne<any>(
      'SELECT * FROM coupons WHERE UPPER(code) = $1 AND active = true',
      [code.trim().toUpperCase()]
    )

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: `Coupon "${code.toUpperCase()}" is invalid or expired.` },
        { status: 404 }
      )
    }

    const minAmount = Number(coupon.min_order_amount)
    if (orderAmount < minAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Coupon "${coupon.code}" requires minimum order of ₹${minAmount.toLocaleString('en-IN')}.`
        },
        { status: 400 }
      )
    }

    // Calculate discount
    const rawDiscount = Math.round((orderAmount * Number(coupon.discount_percent)) / 100)
    const finalDiscount = Math.min(rawDiscount, Number(coupon.max_discount))

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercent: Number(coupon.discount_percent),
        maxDiscount: Number(coupon.max_discount),
        description: coupon.description,
        appliedDiscount: finalDiscount
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to process coupon request' }, { status: 500 })
  }
}
