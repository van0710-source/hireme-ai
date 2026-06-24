// app/layout.tsx
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import LanguageNav from '@/components/LanguageNav'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
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
  description: 'AI-powered resume optimisation and interview preparation.',
  url: 'https://hireme-ai.com',
  offers: [
    { '@type': 'Offer', name: 'Free tier', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Single use', price: '1.00', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Credits pack', price: '20.00', priceCurrency: 'USD' },
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
    <html lang="en" className={`${jakarta.variable}`}>
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
      <body className={`${jakarta.className} antialiased min-h-screen flex flex-col`}>

        {/* ── Nav ── */}
        <LanguageNav />

        {/* ── Page content ── */}
        <div className="flex-1">{children}</div>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} HireMe AI · AI-generated content is for reference only
            </p>
            <div className="flex gap-4 text-xs text-gray-400">
              <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-600 transition-colors">Terms</a>
              <a href="mailto:contact@hireme-ai.com" className="hover:text-gray-600 transition-colors">Contact</a>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}