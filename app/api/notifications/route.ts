import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const { searchParams } = new URL(request.url)
    const userId = session?.userId || searchParams.get('userId') || 'farmer-demo'

    const rows = await query<any>(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
      [userId]
    )

    const notifications = rows.map((n) => ({
      ...n,
      read: n.read ? 1 : 0
    }))

    const unreadCount = notifications.filter((n) => n.read === 0).length

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const { searchParams } = new URL(request.url)
    const body = await request.json()
    const userId = session?.userId || searchParams.get('userId') || 'farmer-demo'
    const { notificationId, markAll = false } = body

    if (markAll) {
      await execute('UPDATE notifications SET read = true WHERE user_id = $1', [userId])
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    if (notificationId) {
      await execute('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [
        notificationId,
        userId
      ])
      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
