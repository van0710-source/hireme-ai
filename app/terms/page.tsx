// app/terms/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service · HireMe AI',
  description: 'Terms governing use of HireMe AI.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7]">
      <article className="mx-auto max-w-2xl px-4 py-16 prose prose-gray">
        <h1>Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: June 2025</p>

        <h2>1. Service description</h2>
        <p>
          HireMe AI provides an AI-assisted resume optimisation and interview preparation
          service. You paste your resume and optionally specify a target company or industry;
          our AI generates tailored suggestions. The service is provided &ldquo;as is.&rdquo;
        </p>

        <h2>2. AI-generated content disclaimer</h2>
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

        <h2>3. Payments and credits</h2>
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

        <h2>4. Refund policy</h2>
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

        <h2>5. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Abuse the free-quota system by generating multiple device IDs artificially.</li>
          <li>Submit content that is illegal, defamatory, or violates third-party rights.</li>
          <li>Attempt to reverse-engineer or scrape the AI output at scale.</li>
        </ul>

        <h2>6. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, HireMe AI&apos;s liability for any claim
          arising from use of the service is limited to the amount you paid in the 30 days
          preceding the claim.
        </p>

        <h2>7. Changes to these terms</h2>
        <p>
          We may update these terms. Continued use of the service after changes constitutes
          acceptance of the revised terms.
        </p>

        <h2>8. Contact</h2>
        <p>
          <a href="mailto:contact@hireme-ai.com">contact@hireme-ai.com</a>
        </p>
      </article>
    </main>
  )
}