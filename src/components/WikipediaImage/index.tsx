'use client'
import { useState, useEffect } from 'react'
import { ImageOff } from 'lucide-react'

interface WikipediaImageProps {
  sourceUrl: string
  className?: string
}

function extractWikiParams(url: string): { lang: string; title: string } | null {
  try {
    const u = new URL(url)
    const langMatch = u.hostname.match(/^([a-z]+)\.wikipedia\.org$/)
    const titleMatch = u.pathname.match(/^\/wiki\/(.+)$/)
    if (!langMatch || !titleMatch) return null
    return { lang: langMatch[1], title: titleMatch[1] }
  } catch {
    return null
  }
}

export function WikipediaImage({ sourceUrl, className = '' }: WikipediaImageProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    const params = extractWikiParams(sourceUrl)
    if (!params) { setStatus('error'); return }

    fetch(
      `https://${params.lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(params.title)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.thumbnail?.source) {
          setImgUrl(data.thumbnail.source)
          setStatus('loaded')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [sourceUrl])

  if (status === 'loading') {
    return <div className={`bg-muted animate-pulse ${className}`} />
  }

  if (status === 'error' || !imgUrl) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <ImageOff className="h-10 w-10 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imgUrl} alt="" className={`object-cover ${className}`} />
  )
}
