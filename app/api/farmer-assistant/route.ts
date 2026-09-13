import { generateText } from 'ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 1200) : ''
    const language = typeof body.language === 'string' ? body.language : 'English'
    const location = typeof body.location === 'string' ? body.location : 'India'

    if (!question) return Response.json({ error: 'Please ask a farming question.' }, { status: 400 })

    const result = await generateText({
      model: 'google/gemini-2.5-flash-lite',
      system: `You are FarmDirect Saarthi, a careful agricultural extension assistant for Indian farmers. Answer in ${language}. The farmer is in ${location}. Give practical, low-cost steps, explain uncertainty, mention when to contact a KVK/agriculture officer, and never prescribe pesticide dosage without the product label. Keep answers concise with headings and bullets. For schemes, direct farmers to official government portals.`,
      prompt: question,
      maxOutputTokens: 500,
    })

    return Response.json({ answer: result.text, language, location })
  } catch (error) {
    console.error('[v0] Farmer assistant error:', error)
    return Response.json({ error: 'The assistant is busy. Please try again.' }, { status: 500 })
  }
}
