import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await queryOne<any>('SELECT * FROM orders WHERE id = $1', [id])
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    const items = await query<any>('SELECT * FROM order_items WHERE order_id = $1', [id])
    const statusHistory = await query<any>(
      'SELECT * FROM order_status_log WHERE order_id = $1 ORDER BY updated_at ASC',
      [id]
    )

    let address = {}
    try {
      address =
        typeof order.address_json === 'string'
          ? JSON.parse(order.address_json)
          : order.address_json || {}
    } catch {
      address = {}
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        delivery_fee: Number(order.delivery_fee),
        discount: Number(order.discount),
        gst: Number(order.gst),
        final_total: Number(order.final_total),
        address,
        items: items.map((it) => ({
          ...it,
          unit_price: Number(it.unit_price),
          total_price: Number(it.total_price)
        })),
        statusHistory
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
