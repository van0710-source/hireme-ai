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
    default: 'HireMe-AI — Tailor Your Resume for Any Company in Seconds',
    template: '%s · HireMe-AI',
  },
  description:
    'Paste your resume, name your target company. HireMe-AI generates a tailored resume, ATS keywords, and interview questions in seconds — free to try, no sign-up required.',
  keywords: [
    'AI resume tailor', 'resume tailoring', 'ATS resume optimizer',
    'tailor resume for job', 'AI resume builder', 'resume for specific company',
    'interview preparation AI', 'job application AI', 'resume optimization',
  ],
  metadataBase: new URL('https://www.hireme-ai.com'),
  alternates: { canonical: 'https://www.hireme-ai.com' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.hireme-ai.com',
    siteName: 'HireMe-AI',
    title: 'HireMe-AI — Tailor Your Resume for Any Company in Seconds',
    description:
      'Paste your resume, name your target company. Get a tailored resume, ATS keywords, and interview questions in seconds.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HireMe-AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HireMe-AI — Tailor Your Resume for Any Company in Seconds',
    description: 'AI-powered resume tailoring + ATS optimization + interview prep. Free to try.',
    images: ['/og-image.png'],
  },
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'HireMe-AI',
  url: 'https://www.hireme-ai.com',
  description: 'AI-powered resume tailoring and interview preparation. Paste your resume, name your target company — get a tailored resume, ATS keywords, and interview questions in seconds.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: [
    { '@type': 'Offer', name: 'Free tier', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Single use', price: '1.00', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Credits pack', price: '20.00', priceCurrency: 'USD' },
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HireMe-AI',
  url: 'https://www.hireme-ai.com',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
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
              <span className="flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-grad-footer" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FF8C42"/>
                      <stop offset="100%" stopColor="#E8590C"/>
                    </linearGradient>
                  </defs>
                  <rect width="40" height="40" rx="10" fill="url(#logo-grad-footer)"/>
                  <path d="M20 6 L32 15 L20 22 L8 15 Z" fill="white" opacity="0.9"/>
                  <path d="M20 22 L32 15 L20 34 Z" fill="white" opacity="0.5"/>
                  <path d="M20 22 L8 15 L20 34 Z" fill="white" opacity="0.3"/>
                </svg>
                <span className="text-[14px] font-extrabold tracking-tight text-gray-900">
                  HireMe<span className="text-orange-500">-</span>AI
                </span>
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