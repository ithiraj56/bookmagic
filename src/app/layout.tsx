import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/mock-auth'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BookMagic - Professional Book Formatting',
  description: 'Convert manuscripts to beautiful EPUBs and print-ready PDFs in minutes',
  keywords: ['book formatting', 'epub', 'pdf', 'manuscript', 'publishing'],
  authors: [{ name: 'BookMagic Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white border-t">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-center text-gray-600">
                  © 2024 BookMagic. Professional book formatting made simple.
                </p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
