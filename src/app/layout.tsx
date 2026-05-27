import type { Metadata } from 'next'
import { Montserrat, Lora, Space_Mono } from 'next/font/google'
import { AppBar } from '@/components/AppBar'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { Providers } from './providers'
import { ClientBootstrap } from './ClientBootstrap'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-sans' })
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' })
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Gabutin',
  description: 'Ubah gabut jadi sesuatu yang berguna',
  icons: {
    icon: '/images/logo.webp',
    apple: '/images/logo.webp',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`dark ${montserrat.variable} ${lora.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground">
        <Providers>
          <ClientBootstrap />
          <AppBar className="lg:hidden" />
          <div className="flex min-h-screen">
            <SideNav className="hidden lg:flex" />
            <main className="flex-1 pt-16 lg:pt-0 lg:pl-[25%] pb-16 lg:pb-0 min-h-screen">
              {children}
            </main>
          </div>
          <BottomNav className="lg:hidden" />
        </Providers>
      </body>
    </html>
  )
}
