import { connectDB } from '@/db/connect'
import { Card, type ICard } from '@/db/models/Card'
import { fetchWikipediaArticle } from './wikipedia'
import { generateMCQ } from './gemini'

export async function generateCard(theme: string): Promise<ICard> {
  const { excerpt, sourceUrl, title } = await fetchWikipediaArticle(theme)
  const { question, options, correctIndex, explanation } = await generateMCQ(excerpt, theme)

  await connectDB()

  const card = await Card.create({
    theme,
    fact: `${title}: ${excerpt}`,
    sourceUrl,
    question,
    options,
    correctIndex,
    explanation,
    status: 'approved',
    generatedBy: 'ai',
  })

  return card
}
