import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { LoadingProvider } from "@/components/providers/loading-provider"
import { ApiProvider } from '@/components/providers/api-provider'
import { initializeApiFootball } from '@/lib/api-football/client'
import { ThemeProvider } from '@/components/ui/theme-provider'

const inter = Inter({ subsets: ['latin'] })

// Initialize API Football client if API key is available
if (process.env.API_FOOTBALL_KEY) {
  console.log('Initializing API Football client with key:', process.env.API_FOOTBALL_KEY.substring(0, 5) + '...')
  initializeApiFootball(process.env.API_FOOTBALL_KEY)
} else {
  console.error('API Football key not found in environment variables')
}

export const metadata: Metadata = {
  title: 'NaijaPlay Fantasy Football',
  description: 'Build and manage your dream team in the Nigerian Premier League',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LoadingProvider>
            <ApiProvider>
              {children}
            </ApiProvider>
            <Toaster />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

