export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CA Firms Directory — Pakistan',
    template: '%s | CA Firms Directory',
  },
  description:
    'Community-driven directory of Chartered Accountant firms in Pakistan. Browse CA firms city-wise, search by firm name, MRS, or TO code.',
  keywords: ['CA firms', 'chartered accountant', 'Pakistan', 'ICAP', 'directory', 'Islamabad', 'Lahore'],
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: 'CA Firms Directory',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className="font-sans antialiased min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                classNames: {
                  toast: 'font-sans',
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
