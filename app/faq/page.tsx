// app/faq/page.tsx — GEO + SEO FAQ hub
import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQ_PAGE_ITEMS, faqPageJsonLd } from '@/lib/faq'

export const metadata: Metadata = {
  title: 'FAQ — Resume Tailoring, ATS & Interview Prep',
  description:
    'Answers to common questions about tailoring your resume for specific companies, ATS keywords, interview prep, pricing, and privacy. HireMe-AI — free to try, no subscription.',
  alternates: { canonical: 'https://www.hireme-ai.com/faq' },
}

export default function FaqPage() {
  const schema = faqPageJsonLd()

  return (
    <main className="min-h-screen bg-[#FFFBF7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="mx-auto max-w-2xl px-4 pt-14 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Frequently asked questions</h1>
        <p className="mt-2 text-gray-500">
          Straight answers on resume tailoring, ATS, interviews, and how HireMe-AI works.
          No signup required to try.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-10 space-y-4">
        {FAQ_PAGE_ITEMS.map((item, i) => (
          <article
            key={i}
            className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h2 className="text-base font-semibold text-gray-900 mb-2" itemProp="name">
              {item.q}
            </h2>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p className="text-sm text-gray-600 leading-relaxed" itemProp="text">
                {item.a}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20">
        <div className="rounded-2xl bg-orange-50 border border-orange-100 p-6 text-center">
          <p className="text-sm text-gray-700 mb-3">
            Ready to tailor your resume for a specific company?
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            Try free — 3 sessions, no signup
          </Link>
          <p className="mt-4 text-xs text-gray-400">
            More guides in{' '}
            <Link href="/blog" className="text-orange-600 hover:underline">
              Resources
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
