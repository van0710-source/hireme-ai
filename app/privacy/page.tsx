// app/privacy/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy · HireMe AI',
  description: 'How HireMe AI handles your data.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7]">
      <article className="mx-auto max-w-2xl px-4 py-16 prose prose-gray">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: June 2025</p>

        <h2>1. What we collect</h2>
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

        <h2>2. AI-generated content</h2>
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

        <h2>3. Payment information</h2>
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

        <h2>4. Cookies and tracking</h2>
        <p>
          We do not use tracking cookies or third-party analytics. The device ID described
          above is stored in <code>localStorage</code>, not cookies, and is never shared with
          third parties.
        </p>

        <h2>5. Your rights</h2>
        <p>
          Because we do not collect personally identifiable information, most GDPR/CCPA rights
          apply to the anonymous usage record tied to your device ID. To request deletion of
          your usage record, email{' '}
          <a href="mailto:contact@hireme-ai.com">contact@hireme-ai.com</a> with your device ID
          (visible in browser DevTools → localStorage → <code>hireme_device_id</code>).
        </p>

        <h2>6. Data retention</h2>
        <p>
          Anonymous usage records are retained indefinitely to prevent free-quota
          circumvention. Payment event records are retained for 7 years for accounting and
          fraud-prevention purposes.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions about this policy:{' '}
          <a href="mailto:contact@hireme-ai.com">contact@hireme-ai.com</a>
        </p>
      </article>
    </main>
  )
}