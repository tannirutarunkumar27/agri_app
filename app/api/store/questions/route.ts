import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { sanitizeText } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const searchQuery = (searchParams.get('q') || '').trim().toLowerCase()

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId is required.' }, { status: 400 })
    }

    let sql = 'SELECT * FROM product_questions WHERE product_id = $1'
    const params: any[] = [productId]

    if (searchQuery) {
      sql += ' AND (question ILIKE $2 OR answer ILIKE $2)'
      params.push(`%${searchQuery}%`)
    }

    sql += ' ORDER BY created_at DESC'

    const questions = await query<any>(sql, params)
    return NextResponse.json({ success: true, count: questions.length, questions })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to process question request' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, question, askedBy } = body

    if (!productId || !question || !askedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required question fields.' },
        { status: 400 }
      )
    }

    const cleanQuestion = sanitizeText(question)
    const cleanAskedBy = sanitizeText(askedBy)

    if (cleanQuestion.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Question must be at least 5 characters long.' },
        { status: 400 }
      )
    }

    const questionId = `q-${Date.now()}`

    // Instant Agri-Doctor AI answer for realistic Amazon/Flipkart Q&A experience
    let expertAnswer: string | null = null
    const qLower = cleanQuestion.toLowerCase()

    if (qLower.includes('spray') || qLower.includes('dose') || qLower.includes('acre')) {
      expertAnswer =
        'Official Agri Guidance: Always follow package label. Standard foliar application is 2 to 3 grams/ml per Litre of clean water. Avoid spraying in direct hot midday sun.'
    } else if (qLower.includes('fungicide') || qLower.includes('mix') || qLower.includes('compatible')) {
      expertAnswer =
        'Compatibility Note: Compatible with most neutral fungicides (like Mancozeb). Do not mix with alkaline solutions or Bordeaux mixture.'
    } else {
      expertAnswer =
        'Our agronomist has noted your question: Suitable for standard application across approved Kharif and Rabi crops. Check with your local KVK officer for soil specific dosage.'
    }

    await execute(
      `INSERT INTO product_questions (id, product_id, question, asked_by, answer, answered_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        questionId,
        productId,
        cleanQuestion,
        cleanAskedBy,
        expertAnswer,
        'Dr. Sharma (FarmDirect Senior Agri-Consultant)'
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Question posted and answered by Agri Consultant.',
      questionId
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to process question request' }, { status: 500 })
  }
}
