import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service · HireMe-AI',
  description: 'Terms of service for HireMe-AI. Understand your rights and responsibilities when using our AI resume tailoring service.',
  alternates: { canonical: 'https://www.hireme-ai.com/terms' },
}

const sections = [
  { number: '1', title: 'Service description' },
  { number: '2', title: 'AI-generated content disclaimer' },
  { number: '3', title: 'Payments and credits' },
  { number: '4', title: 'Refund policy' },
  { number: '5', title: 'Acceptable use' },
  { number: '6', title: 'Limitation of liability' },
  { number: '7', title: 'Changes to these terms' },
  { number: '8', title: 'Contact' },
]

export default function TermsPage() {
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
          <h1 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight text-gray-900">Terms of Service</h1>
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

            <LegalSection id="section-1" number="1" title="Service description">
              <p>
                HireMe AI provides an AI-assisted resume optimisation and interview preparation
                service. You paste your resume and optionally specify a target company or industry;
                our AI generates tailored suggestions. The service is provided &ldquo;as is.&rdquo;
              </p>
            </LegalSection>

            <LegalSection id="section-2" number="2" title="AI-generated content disclaimer">
              <p>
                All content produced by HireMe AI is labelled{' '}
                <em>&ldquo;AI-generated suggestion · For reference only.&rdquo;</em>
              </p>
              <ul>
                <li>
                  We make <strong>no guarantee</strong> that using our suggestions will result in an
                  interview, a job offer, or passing any applicant tracking system (ATS).
                </li>
                <li>
                  AI output may contain inaccuracies. Always review and edit content before
                  submitting it to employers.
                </li>
                <li>
                  The ATS matching feature tailors content based on stated company or industry
                  preferences; it does not reflect the internal systems of any specific employer.
                </li>
              </ul>
            </LegalSection>

            <LegalSection id="section-3" number="3" title="Payments and credits">
              <p>Each new device receives 3 free generations. After that, you may purchase:</p>
              <ul>
                <li>
                  <strong>Single use ($1)</strong> — 1 additional generation, credited immediately
                  after payment.
                </li>
                <li>
                  <strong>Credits pack ($20)</strong> — 200 credits; each generation costs 8 credits (~25 generations total).
                </li>
              </ul>
              <p>
                Payments are processed by Creem. By completing a purchase you agree to Creem&apos;s
                terms of service.
              </p>
            </LegalSection>

            <LegalSection id="section-4" number="4" title="Refund policy">
              <p>
                HireMe AI provides instant digital content. All payments are therefore considered
                delivered upon completion and are <strong>non-refundable in principle</strong>.
              </p>
              <p>
                As a limited exception, you may request a <strong>full refund</strong> if{' '}
                <em>both</em> of the following conditions are met:
              </p>
              <ol>
                <li>You request the refund within <strong>2 hours</strong> of payment, and</li>
                <li>
                  You have <strong>not yet used</strong> the purchased credit or credits (i.e., you
                  have not clicked the &ldquo;Generate&rdquo; button since the purchase).
                </li>
              </ol>
              <p>
                Once you generate AI content with a purchased credit, the service is considered
                delivered and no refund will be issued.
              </p>
              <p>The following situations are reviewed case by case:</p>
              <ol>
                <li>
                  <strong>Technical failure</strong> — our platform was completely unavailable due
                  to a server-side issue.
                </li>
                <li>
                  <strong>Duplicate charge</strong> — a system error caused the same order to be
                  billed more than once.
                </li>
                <li>
                  <strong>Fraudulent transaction</strong> — a verified unauthorised charge.
                </li>
              </ol>
              <p>
                All refund requests must be submitted to{' '}
                <a href="mailto:contact@hireme-ai.com">contact@hireme-ai.com</a>. We reserve the
                right to make the final determination on all refund requests.
              </p>
            </LegalSection>

            <LegalSection id="section-5" number="5" title="Acceptable use">
              <p>You agree not to:</p>
              <ul>
                <li>Abuse the free-quota system by generating multiple device IDs artificially.</li>
                <li>Submit content that is illegal, defamatory, or violates third-party rights.</li>
                <li>Attempt to reverse-engineer or scrape the AI output at scale.</li>
              </ul>
            </LegalSection>

            <LegalSection id="section-6" number="6" title="Limitation of liability">
              <p>
                To the maximum extent permitted by law, HireMe AI&apos;s liability for any claim
                arising from use of the service is limited to the amount you paid in the 30 days
                preceding the claim.
              </p>
            </LegalSection>

            <LegalSection id="section-7" number="7" title="Changes to these terms">
              <p>
                We may update these terms. Continued use of the service after changes constitutes
                acceptance of the revised terms.
              </p>
            </LegalSection>

            <LegalSection id="section-8" number="8" title="Contact">
              <p>
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
