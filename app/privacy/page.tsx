import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy · HireMe-AI',
  description: 'How HireMe-AI collects, uses, and protects your data. We never sell your resume or personal information.',
  alternates: { canonical: 'https://www.hireme-ai.com/privacy' },
}

const sections = [
  { number: '1', title: 'What we collect' },
  { number: '2', title: 'AI-generated content' },
  { number: '3', title: 'Payment information' },
  { number: '4', title: 'Cookies and tracking' },
  { number: '5', title: 'Your rights' },
  { number: '6', title: 'Data retention' },
  { number: '7', title: 'Contact' },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDFAF6]">

      {/* Header */}
      <div className="border-b border-[#E5E0D8] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
          <div className="inline-flex items-center gap-2 border border-[#FED7AA] bg-[#FFF3E6] rounded-[4px] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
            <span className="text-[10px] font-bold tracking-widest text-orange-700 uppercase">Legal</span>
          </div>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight text-gray-900">Privacy Policy</h1>
          <p className="text-[13px] text-gray-400 mt-2">Last updated: June 2025</p>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-20">
              <p className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-3">Contents</p>
              <nav className="space-y-1">
                {sections.map(s => (
                  <a
                    key={s.number}
                    href={`#section-${s.number}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-gray-500 hover:bg-white hover:text-gray-900 hover:border hover:border-[#E5E0D8] transition-all"
                  >
                    <span className="text-orange-400 font-bold text-[10px] shrink-0">{s.number.padStart(2, '0')}</span>
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Sections */}
          <div className="flex-1 space-y-4">

            <LegalSection id="section-1" number="1" title="What we collect">
              <p>HireMe AI collects only what is necessary to provide the service:</p>
              <ul>
                <li>
                  <strong>Anonymous device identifier</strong> — a randomly generated ID stored in
                  your browser (localStorage) to track your usage quota. No account or email required.
                </li>
                <li>
                  <strong>Usage count</strong> — how many times you have used the generation feature,
                  to enforce the free quota and deduct paid credits.
                </li>
                <li>
                  <strong>Resume content</strong> — processed in real time to generate results and
                  immediately discarded. We do <em>not</em> store your resume on our servers.
                </li>
              </ul>
            </LegalSection>

            <LegalSection id="section-2" number="2" title="AI-generated content">
              <p>
                HireMe AI uses the DeepSeek API to generate tailored resume suggestions and interview
                questions. Your resume text is sent to DeepSeek for processing. Please review
                DeepSeek&apos;s privacy policy at{' '}
                <a href="https://www.deepseek.com" target="_blank" rel="noopener noreferrer">
                  deepseek.com
                </a>{' '}
                for details on how they handle data.
              </p>
              <p>
                All AI-generated content is labelled <em>&ldquo;AI-generated suggestion&rdquo;</em> and
                is provided for reference only. We do not guarantee that it will result in an interview
                or job offer.
              </p>
            </LegalSection>

            <LegalSection id="section-3" number="3" title="Payment information">
              <p>
                Payments are processed by <strong>Creem</strong>, our third-party payment provider.
                HireMe AI never receives, processes, or stores your credit card number or other payment
                card details. All card data is handled directly by Creem&apos;s PCI-compliant
                infrastructure.
              </p>
              <p>
                When you complete a payment, Creem notifies us via a signed webhook so we can add
                credits to your device. We record only: the payment ID (for duplicate-prevention),
                the product type purchased, your anonymous device ID, and the timestamp.
              </p>
            </LegalSection>

            <LegalSection id="section-4" number="4" title="Cookies and tracking">
              <p>
                We do not use tracking cookies or third-party analytics. The device ID described
                above is stored in <code>localStorage</code>, not cookies, and is never shared with
                third parties.
              </p>
            </LegalSection>

            <LegalSection id="section-5" number="5" title="Your rights">
              <p>
                Because we do not collect personally identifiable information, most GDPR/CCPA rights
                apply to the anonymous usage record tied to your device ID. To request deletion of
                your usage record, email{' '}
                <a href="mailto:contact@hireme-ai.com">contact@hireme-ai.com</a> with your device ID
                (visible in browser DevTools → localStorage → <code>hireme_device_id</code>).
              </p>
            </LegalSection>

            <LegalSection id="section-6" number="6" title="Data retention">
              <p>
                Anonymous usage records are retained indefinitely to prevent free-quota
                circumvention. Payment event records are retained for 7 years for accounting and
                fraud-prevention purposes.
              </p>
            </LegalSection>

            <LegalSection id="section-7" number="7" title="Contact">
              <p>
                Questions about this policy:{' '}
                <a href="mailto:contact@hireme-ai.com">contact@hireme-ai.com</a>
              </p>
            </LegalSection>

          </div>
        </div>
      </div>
    </main>
  )
}

function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div id={id} className="rounded-xl bg-white border border-[#E5E0D8] border-l-4 border-l-orange-400 p-6 scroll-mt-24">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[11px] font-bold text-orange-400 tracking-wider shrink-0">{number.padStart(2, '0')}</span>
        <h2 className="text-[17px] font-extrabold tracking-tight text-gray-900">{title}</h2>
      </div>
      <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_a]:text-orange-500 [&_a:hover]:text-orange-600 [&_strong]:text-gray-800 [&_em]:text-gray-700 [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_code]:text-gray-700">
        {children}
      </div>
    </div>
  )
}
