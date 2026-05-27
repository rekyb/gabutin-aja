import { GoogleGenAI } from '@google/genai'
import { env } from '@/env'

export interface MCQResult {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const PROMPT_TEMPLATE = (theme: string, excerpt: string) => `\
Kamu adalah pembuat soal trivia edukasi untuk remaja Indonesia (Gen-Z, usia 16–25).

Berdasarkan teks Wikipedia berikut tentang tema "${theme}":
---
${excerpt}
---

Buat 1 soal pilihan ganda dalam Bahasa Indonesia yang natural dan tidak terlalu formal.
Format respons HARUS berupa JSON valid:
{
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correctIndex": 0,
  "explanation": "Penjelasan singkat 1-2 kalimat kenapa jawaban ini benar."
}

Aturan:
- Soal harus bisa dijawab dari teks di atas
- Opsi salah harus masuk akal, bukan asal-asalan
- Bahasa santai tapi tetap jelas
- Jangan gunakan kata "saya" atau "anda" — gunakan gaya naratif`

export async function generateMCQ(excerpt: string, theme: string): Promise<MCQResult> {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: PROMPT_TEMPLATE(theme, excerpt),
    config: { responseMimeType: 'application/json' },
  })

  const raw = response.text
  if (!raw) throw new Error('Gemini returned empty response')

  let parsed: MCQResult
  try {
    parsed = JSON.parse(raw) as MCQResult
  } catch {
    throw new Error(`Gemini response is not valid JSON: ${raw.slice(0, 100)}`)
  }

  if (!Array.isArray(parsed.options) || parsed.options.length !== 4)
    throw new Error('Gemini returned options array with length !== 4')
  if (parsed.correctIndex < 0 || parsed.correctIndex > 3)
    throw new Error(`Gemini returned invalid correctIndex: ${parsed.correctIndex}`)
  if (!parsed.explanation?.trim())
    throw new Error('Gemini returned empty explanation')

  return parsed
}
