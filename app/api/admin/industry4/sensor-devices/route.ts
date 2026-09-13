import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const devices = await query<any>(`
      SELECT 
        d.id, d.device_type, d.device_code, d.name, d.owner_type, d.location,
        d.status, d.battery_level_percent, d.firmware_version, d.last_seen_at, d.metadata,
        (
          SELECT json_agg(r ORDER BY r.timestamp DESC)
          FROM (
            SELECT timestamp, metric, value, unit, quality_status
            FROM sensor_readings
            WHERE device_id = d.id
            ORDER BY timestamp DESC
            LIMIT 5
          ) r
        ) as recent_readings
      FROM sensor_devices d
      ORDER BY d.created_at ASC;
    `)

    return NextResponse.json({
      success: true,
      data: devices.map((d) => ({
        id: d.id,
        deviceType: d.device_type,
        deviceCode: d.device_code,
        name: d.name,
        ownerType: d.owner_type,
        location: d.location,
        status: d.status,
        batteryLevel: d.battery_level_percent,
        firmwareVersion: d.firmware_version,
        lastSeenAt: d.last_seen_at,
        metadata: typeof d.metadata === 'object' ? d.metadata : {},
        recentReadings: d.recent_readings || []
      }))
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/sensor-devices GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.deviceType || !body.deviceCode || !body.name || !body.location) {
      return NextResponse.json(
        { success: false, error: 'deviceType, deviceCode, name, and location are required' },
        { status: 400 }
      )
    }

    const id = `dev-${Date.now()}`
    await execute(`
      INSERT INTO sensor_devices (
        id, device_type, device_code, name, owner_type, location, status, battery_level_percent, firmware_version, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
    `, [
      id,
      body.deviceType,
      body.deviceCode,
      body.name,
      body.ownerType || 'platform',
      body.location,
      body.status || 'ONLINE',
      body.batteryLevel || 100,
      body.firmwareVersion || 'v1.0.0',
      JSON.stringify(body.metadata || {})
    ])

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('[API /api/admin/industry4/sensor-devices POST] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
