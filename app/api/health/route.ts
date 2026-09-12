import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  let dbStatus = 'disconnected'

  try {
    const result = await queryOne<{ check: number }>('SELECT 1 as check;')
    if (result && Number(result.check) === 1) {
      dbStatus = 'connected'
    }
  } catch {
    // Suppress internal connection/SQL errors to prevent secret or credential leakage
    dbStatus = 'disconnected'
  }

  const isHealthy = dbStatus === 'connected'

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'degraded',
      application: 'farmdirect',
      database: dbStatus
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  )
}
