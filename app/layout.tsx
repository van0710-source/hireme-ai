// app/layout.tsx

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'HireMe AI — Paste your resume. Get the interview that fits.',
    template: '%s · HireMe AI',
  },
  description:
    'One resume. Any company. Tailored in seconds. AI-powered resume optimisation and interview prep — no sign-up required.',
  metadataBase: new URL('https://hireme-ai.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hireme-ai.com',
    siteName: 'HireMe AI',
    title: 'HireMe AI — Paste your resume. Get the interview that fits.',
    description: 'One resume. Any company. Tailored in seconds.',
  },
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'HireMe AI',
  description:
    'AI-powered resume optimisation and interview preparation. Paste your resume and get a tailored version for any company or industry in seconds.',
  url: 'https://hireme-ai.com',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free tier',
      price: '0',
      priceCurrency: 'USD',
      description: '3 free AI-tailored resume generations',
    },
    {
      '@type': 'Offer',
      name: 'Single use',
      price: '1.00',
      priceCurrency: 'USD',
      description: 'One additional tailored resume generation',
    },
    {
      '@type': 'Offer',
      name: 'Credits pack',
      price: '20.00',
      priceCurrency: 'USD',
      description: '200 credits (~13 tailored resume generations)',
    },
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HireMe AI',
  url: 'https://hireme-ai.com',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@hireme-ai.com',
    contactType: 'customer support',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Navigation */}
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <a href="/" className="text-base font-bold text-gray-900 tracking-tight">
              HireMe AI
            </a>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="/blog" className="hover:text-gray-800 transition-colors">Resources</a>
              <a href="/privacy" className="hover:text-gray-800 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-800 transition-colors">Terms</a>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white mt-8">
          <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} HireMe AI · AI-generated content is for reference only
              </p>
              <div className="flex gap-4 text-sm text-gray-400">
                <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-gray-600 transition-colors">Terms</a>
                <a href="/blog" className="hover:text-gray-600 transition-colors">Resources</a>
                <a href="mailto:contact@hireme-ai.com" className="hover:text-gray-600 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}