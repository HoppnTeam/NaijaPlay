import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { LoadingProvider } from "@/components/providers/loading-provider"

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
          {children}
          <Toaster />
        </LoadingProvider>
      </body>
    </html>
  )
}

