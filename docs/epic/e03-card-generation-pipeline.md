# E03 — Card Generation Pipeline

**Status:** [x] Done — merged to main
**Wave:** 2 (start after E01, parallel with E02/E05)

---

## Goal

Build the lazy card generation pipeline: fetch a random article from id.wikipedia.org for a given theme, extract a ≤200-word intro excerpt, call Gemini to generate one MCQ in casual Bahasa Indonesia, and persist the approved card to MongoDB.

## Why

The feed has no content without cards. This pipeline is the only card source in v1.0. It runs lazily and in the background — triggered silently when a theme's card pool drops below 10 — so the user is never blocked waiting for generation.

---

## Functional Requirements

1. **Wikipedia fetch:** Given a theme name, select a search keyword, call `https://id.wikipedia.org/api/rest_v1/page/random/summary` or search for a relevant article, extract the `extract` field (intro paragraph). Truncate to ≤200 words.
2. **Theme → keyword mapping:** Each of the 8 themes maps to a list of Wikipedia search queries. Example: `sains` → `['fisika', 'kimia', 'biologi', 'astronomi']`. Pick one randomly.
3. **Gemini MCQ generation:** Send the excerpt + theme to Gemini. Return exactly: `question` (string), `options` (string[4]), `correctIndex` (0–3), `explanation` (1–2 sentences, Bahasa Indonesia, casual).
4. **Gemini prompt language:** All output must be in Bahasa Indonesia, casual register ("lo/gue"-style hints allowed, but question/options are neutral). No overly formal phrasing.
5. **Card persistence:** Save to `cards` collection with `status: 'approved'`, `generatedBy: 'ai'`.
6. **Single public function:** `generateCard(theme: string): Promise<ICard>` — orchestrates steps 1–5. Throws on any failure (caller handles).
7. **Background invocation:** The caller (E07) invokes `generateCard` as fire-and-forget (`generateCard(theme).catch(console.error)` — no await). This epic does not implement the background trigger.

---

## API Contracts

```ts
// src/lib/pipeline/wikipedia.ts
export async function fetchWikipediaArticle(theme: string): Promise<{
 excerpt: string  // ≤200 words
 sourceUrl: string // full Wikipedia article URL
 title: string
}>

// src/lib/pipeline/gemini.ts
export async function generateMCQ(
 excerpt: string,
 theme: string
): Promise<{
 question: string
 options: string[]   // exactly 4 elements
 correctIndex: number // 0–3
 explanation: string  // 1–2 sentences Bahasa Indonesia
}>

// src/lib/pipeline/generate-card.ts
export async function generateCard(theme: string): Promise<ICard>
```

### Gemini prompt template

```
Kamu adalah pembuat soal trivia edukasi untuk remaja Indonesia (Gen-Z, usia 16–25).

Berdasarkan teks Wikipedia berikut tentang tema "{theme}":
---
{excerpt}
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
- Jangan gunakan kata "saya" atau "anda" — gunakan gaya naratif
```

---

## Theme → Wikipedia Search Keyword Mapping

```ts
// src/lib/pipeline/theme-keywords.ts
export const THEME_KEYWORDS: Record<string, string[]> = {
 sejarah_indonesia: ['Sumpah Pemuda', 'Proklamasi kemerdekaan Indonesia', 'Majapahit', 'Soekarno', 'Borobudur'],
 sains:       ['Fotosintesis', 'Hukum Newton', 'DNA', 'Lubang hitam', 'Atom'],
 pop_culture:    ['K-pop', 'Anime', 'Studio Ghibli', 'BTS', 'One Piece'],
 geografi:     ['Amazon', 'Gunung Everest', 'Samudra Pasifik', 'Sahara', 'Antartika'],
 matematika:    ['Bilangan prima', 'Teori Pythagoras', 'Fibonacci', 'Pi', 'Statistik'],
 psikologi:     ['Efek Dunning-Kruger', 'Psikologi warna', 'Bias kognitif', 'Teori Maslow', 'Empati'],
 sejarah_dunia:   ['Perang Dunia II', 'Revolusi Perancis', 'Kekaisaran Romawi', 'Perang Dingin', 'Renaisans'],
 coding_tech:    ['Kecerdasan buatan', 'Internet', 'Blockchain', 'Algoritma', 'Open source'],
}
```

---

## Acceptance Criteria

- [ ] `generateCard('sains')` returns a saved `ICard` document without throwing
- [ ] Returned card has `status: 'approved'`, `generatedBy: 'ai'`, `theme: 'sains'`
- [ ] `excerpt` is ≤ 200 words (word count check)
- [ ] `options` array has exactly 4 elements
- [ ] `correctIndex` is 0, 1, 2, or 3
- [ ] `explanation` is non-empty and in Bahasa Indonesia
- [ ] `sourceUrl` is a valid `id.wikipedia.org` URL
- [ ] On Gemini API error, `generateCard` throws (does not swallow the error)
- [ ] On Wikipedia fetch error, `generateCard` throws
- [ ] Generated card is queryable from MongoDB: `Card.findOne({ theme: 'sains', status: 'approved' })` returns it

---

## In Scope

- `src/lib/pipeline/wikipedia.ts` — Wikipedia REST API client
- `src/lib/pipeline/gemini.ts` — Gemini AI SDK MCQ generator + prompt template
- `src/lib/pipeline/theme-keywords.ts` — Theme→keyword mapping
- `src/lib/pipeline/generate-card.ts` — Orchestrator
- Validation: assert `options.length === 4`, `correctIndex` in range, `explanation` non-empty before saving

---

## Tests

Target: ≥80% on `src/lib/pipeline/`. Mock `fetch` and the Gemini SDK — never call real APIs in tests.

### `src/lib/pipeline/wikipedia.test.ts`
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => { vi.resetAllMocks() })

describe('fetchWikipediaArticle', () => {
 it('truncates excerpt to 200 words', async () => {
  const longText = Array(300).fill('word').join(' ')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
   ok: true,
   json: async () => ({ extract: longText, content_urls: { desktop: { page: 'https://id.wikipedia.org/wiki/Test' } }, title: 'Test' }),
  }))

  const { fetchWikipediaArticle } = await import('@/lib/pipeline/wikipedia')
  const result = await fetchWikipediaArticle('sains')
  expect(result.excerpt.split(' ').length).toBeLessThanOrEqual(200)
 })

 it('throws when fetch fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
  const { fetchWikipediaArticle } = await import('@/lib/pipeline/wikipedia')
  await expect(fetchWikipediaArticle('sains')).rejects.toThrow()
 })
})
```

### `src/lib/pipeline/gemini.test.ts`
```ts
import { describe, it, expect, vi } from 'vitest'

describe('generateMCQ', () => {
 it('returns 4 options and a valid correctIndex', async () => {
  vi.doMock('@google/genai', () => ({
   GoogleGenAI: vi.fn().mockReturnValue({
    models: {
     generateContent: vi.fn().mockResolvedValue({
      text: JSON.stringify({
       question: 'Apa itu fotosintesis?',
       options: ['A', 'B', 'C', 'D'],
       correctIndex: 2,
       explanation: 'Karena...',
      }),
     }),
    },
   }),
  }))
  const { generateMCQ } = await import('@/lib/pipeline/gemini')
  const result = await generateMCQ('Fotosintesis adalah proses...', 'sains')
  expect(result.options).toHaveLength(4)
  expect(result.correctIndex).toBeGreaterThanOrEqual(0)
  expect(result.correctIndex).toBeLessThanOrEqual(3)
  expect(result.explanation).toBeTruthy()
 })
})
```

Run: `rtk vitest run src/lib/pipeline/`

---

## Out of Scope / Guardrails

- No retry logic (throw on failure; E07's fire-and-forget handles it silently)
- No content moderation or safety filtering beyond what Gemini provides by default
- No user-submitted cards (v1.x)
- `status` is always `'approved'` in v1.0 — do not add a moderation gate
- Do not cache Wikipedia responses — each call fetches fresh content
- Do not implement the background trigger (fire-and-forget call) — E07 does that

---

## Dependencies

- **E01** — `Card` Mongoose model, `src/env.ts` (GEMINI_API_KEY), MongoDB connection

---

## References

- [implementation-overview.md](../implementation-overview.md) — shared types, file tree
- [product-design.md §6](../product-design.md) — Card Generation Pipeline
- [product-design.md §7](../product-design.md) — `cards` schema
- [product-design.md §5](../product-design.md) — Theme Categories (IDs + labels)
- Gemini AI SDK: `@google/genai` — use `generateContent` with `responseMimeType: 'application/json'`
- Wikipedia REST API: `https://id.wikipedia.org/api/rest_v1/page/summary/{title}`
