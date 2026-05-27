import { pickKeyword } from './theme-keywords'

export interface WikipediaResult {
  excerpt: string
  sourceUrl: string
  title: string
}

function truncateTo200Words(text: string): string {
  const words = text.trim().split(/\s+/)
  return words.length <= 200 ? text : words.slice(0, 200).join(' ')
}

export async function fetchWikipediaArticle(theme: string): Promise<WikipediaResult> {
  const keyword = pickKeyword(theme)
  const encoded = encodeURIComponent(keyword)
  const url = `https://id.wikipedia.org/api/rest_v1/page/summary/${encoded}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Gabutin/1.0 (educational app; contact@gabutin.app)' },
  })

  if (!res.ok) throw new Error(`Wikipedia fetch failed: ${res.status} for "${keyword}"`)

  const data = await res.json() as {
    extract?: string
    content_urls?: { desktop?: { page?: string } }
    title?: string
  }

  if (!data.extract) throw new Error(`No extract found for "${keyword}"`)

  return {
    excerpt: truncateTo200Words(data.extract),
    sourceUrl: data.content_urls?.desktop?.page ?? url,
    title: data.title ?? keyword,
  }
}
