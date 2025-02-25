import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { LoadingProvider } from "@/components/providers/loading-provider"
import { ApiProvider } from '@/components/providers/api-provider'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <body className={inter.className}>
        <LoadingProvider>
          <ApiProvider>
            {children}
          </ApiProvider>
          <Toaster />
        </LoadingProvider>
      </body>
    </html>
  )
}

