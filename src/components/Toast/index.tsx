'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { TOAST_POSITION } from '@/lib/design-tokens'
import { useToastStore } from '@/store/toastStore'

const URL_TOAST_MESSAGES: Record<string, string> = {
  google: 'Gaskeun! Akun lo udah aktif',
  google_returning: 'Eh lo balik lagi! Selamat gabut',
}

function UrlToastTrigger() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const show = useToastStore((s) => s.show)

  useEffect(() => {
    const key = searchParams.get('toast')
    if (key && URL_TOAST_MESSAGES[key]) {
      show(URL_TOAST_MESSAGES[key])
      router.replace(pathname)
    }
  }, [searchParams, show, router, pathname])

  return null
}

export function Toast() {
  const message = useToastStore((s) => s.message)
  const dismiss = useToastStore((s) => s.dismiss)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(dismiss, 5000)
    return () => clearTimeout(timer)
  }, [message, dismiss])

  return (
    <>
      <Suspense>
        <UrlToastTrigger />
      </Suspense>
      {message && (
        <div
          onClick={dismiss}
          className={`${TOAST_POSITION} bg-card border-2 border-(--color-card-stroke) shadow-[4px_4px_0px_0px_var(--color-shadow)] p-4 flex items-center gap-3 cursor-pointer`}
        >
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />
          <p className="font-sans font-bold text-sm flex-1">{message}</p>
        </div>
      )}
    </>
  )
}
