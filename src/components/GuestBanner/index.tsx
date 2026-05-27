'use client'
import { AlertTriangle } from 'lucide-react'

export const GuestBanner = () => (
  <div className="bg-secondary/20 border-b-2 border-secondary px-4 py-2 flex items-center gap-3">
    <AlertTriangle className="h-5 w-5 text-secondary shrink-0" />
    <p className="text-sm font-mono">
      Main sebagai tamu — progress bisa ilang kalau lo hapus cache
    </p>
  </div>
)
