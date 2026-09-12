import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, props: Params) {
  try {
    const params = await props.params
    const jobId = params.id
    const session = await getSessionFromCookies()

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 })
    }

    const job = await queryOne<any>('SELECT * FROM delivery_jobs WHERE id = $1', [jobId])
    if (!job) {
      return NextResponse.json({ success: false, error: 'Delivery job not found' }, { status: 404 })
    }

    let proofUrl = ''
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ success: false, error: 'No proof file provided in upload' }, { status: 400 })
      }

      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'Proof file exceeds 5MB size limit' }, { status: 400 })
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ success: false, error: 'Only JPEG, PNG, WEBP, or PDF proof files are supported' }, { status: 400 })
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() || 'jpg'
      const filePath = `pod-${jobId}-${Date.now()}.${ext}`

      try {
        const supabase = await getSupabaseServerClient()
        // Ensure bucket exists or upload directly
        const { data, error } = await supabase.storage
          .from('delivery-proof')
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: true
          })

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('delivery-proof')
            .getPublicUrl(filePath)
          proofUrl = publicUrlData.publicUrl
        } else {
          // In development or if bucket not yet created, fallback to data URI
          proofUrl = `data:${file.type};base64,${fileBuffer.toString('base64')}`
        }
      } catch (storageErr) {
        console.warn('Storage upload fallback:', storageErr)
        proofUrl = `data:${file.type};base64,${fileBuffer.toString('base64')}`
      }
    } else {
      const body = await request.json()
      proofUrl = sanitizeText(body.proofUrl || '')
    }

    if (!proofUrl) {
      return NextResponse.json({ success: false, error: 'Valid proof URL or file is required' }, { status: 400 })
    }

    // Save proof to delivery job
    await execute(
      `UPDATE delivery_jobs
       SET proof_of_delivery_url = $1,
           proof_uploaded_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [proofUrl, jobId]
    )

    // Log status update
    await execute(
      `INSERT INTO delivery_status_log (
        delivery_job_id, previous_status, new_status, changed_by, reason, created_at
      ) VALUES ($1, $2, $2, $3, 'Proof of delivery uploaded by transporter.', NOW())`,
      [jobId, job.delivery_status, session?.userId || 'transporter']
    )

    return NextResponse.json({
      success: true,
      message: 'Proof of delivery recorded successfully.',
      proofUrl
    })
  } catch (error: any) {
    console.error('Error uploading proof of delivery:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to upload proof' }, { status: 500 })
  }
}
