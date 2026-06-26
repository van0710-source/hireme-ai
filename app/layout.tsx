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
        <footer className="border-t border-[#E5E0D8] bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-[14px] font-extrabold tracking-tight text-gray-900">
                hireme<span className="text-orange-500">.</span>ai
              </span>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                © {new Date().getFullYear()} HireMe AI · AI-generated content is for reference only
              </p>
            </div>
            <div className="flex gap-5">
              <a href="/privacy" className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors">Privacy</a>
              <a href="/terms" className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors">Terms</a>
              <a href="mailto:contact@hireme-ai.com" className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors">Contact</a>
            </div>
            <p className="text-[11px] text-gray-400 sm:hidden text-center">
              © {new Date().getFullYear()} HireMe AI
            </p>
          </div>
        </footer>

      </body>
    </html>
  )
}