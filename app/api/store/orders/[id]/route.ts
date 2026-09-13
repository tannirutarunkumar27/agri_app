import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to view order details.' }, { status: 401 })
    }

    const { id } = await params

    const order = await queryOne<any>('SELECT * FROM orders WHERE id = $1', [id])
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Ownership check: user_phone matches session user phone, or user is admin
    const userPhone = (session.phone || '').replace(/\D/g, '').slice(-10)
    const orderPhone = (order.user_phone || '').replace(/\D/g, '').slice(-10)

    if (session.role !== 'admin' && (!userPhone || !orderPhone || userPhone !== orderPhone)) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not have permission to view this order.' }, { status: 403 })
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
    console.error('Error fetching store order detail:', error)
    return NextResponse.json({ success: false, error: 'Failed to retrieve order details' }, { status: 500 })
  }
}
