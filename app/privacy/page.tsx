export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-orange-100 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Privacy Policy</h1>
        <div className="space-y-4 text-sm text-gray-600">
          <p><strong>Effective Date:</strong> June 22, 2026</p>

          <p><strong>1. Information We Collect</strong><br />
          When you use HireMe AI, we collect the resume text you paste or upload for processing.
          <strong> We do not store your resume text.</strong> It is temporarily processed to generate
          your results and then discarded. We collect an anonymous device identifier to manage usage
          quotas and credits. We may collect your email address if you choose to contact us or if
          you provide it during payment (processed by our payment provider).</p>

          <p><strong>2. How We Use Your Information</strong><br />
          We use your resume text solely to generate optimized resume versions, interview questions,
          and self-introductions. Target company or industry information (if provided) is used only
          to tailor AI output and is not stored. We do not sell, rent, or share your personal data
          with third parties for marketing purposes.</p>

          <p><strong>3. Data Retention</strong><br />
          Resume text is processed in real time and discarded immediately after generation. Generated
          results are displayed to you in your browser and are not stored on our servers. Anonymous
          device identifiers and payment transaction records are retained to manage quotas and
          prevent duplicate billing.</p>

          <p><strong>4. Third-Party Services</strong><br />
          We use the following third-party services:
          <br />— <strong>DeepSeek API</strong> to process your resume and generate AI content
          <br />— <strong>Creem</strong> to process payments (card details are handled entirely by Creem; we never see or store your payment card information)
          <br />— <strong>Supabase</strong> for anonymous usage tracking and payment records
          <br />These providers process data according to their own privacy policies.</p>

          <p><strong>5. Payment Information</strong><br />
          All payment processing is handled by Creem, our Merchant of Record. HireMe AI does not
          collect, store, or have access to your credit card or bank account details. Payment-related
          data (transaction ID, amount, product purchased) is stored to manage your credits and
          usage balance.</p>

          <p><strong>6. AI-Generated Content &amp; ATS Targeting</strong><br />
          Our service uses AI to generate resume optimizations, interview questions, and
          self-introductions. When you provide a target company or industry, the AI tailors output
          accordingly. All AI-generated content is for reference only and does not guarantee any
          interview, job offer, or ATS screening outcome.</p>

          <p><strong>7. Data Security</strong><br />
          We implement reasonable security measures including HTTPS encryption, input validation,
          and secure webhook signature verification. However, no internet transmission is 100% secure.</p>

          <p><strong>8. Your Privacy Rights (GDPR/CCPA)</strong><br />
          Depending on your location, you may have the right to: access, correct, or delete your
          personal data; withdraw consent at any time; lodge a complaint with a supervisory authority.
          To exercise these rights, contact us at{' '}
          <a href="mailto:privacy@hireme-ai.com" className="text-orange-600 hover:underline">privacy@hireme-ai.com</a>.</p>

          <p><strong>9. Changes to This Policy</strong><br />
          We may update this policy from time to time. Continued use of the service constitutes
          acceptance of any changes.</p>

          <p><strong>10. Contact Us</strong><br />
          Questions? Contact us at:{' '}
          <a href="mailto:privacy@hireme-ai.com" className="text-orange-600 hover:underline">privacy@hireme-ai.com</a></p>

          <div className="mt-6 flex gap-4 text-sm">
            <a href="/" className="text-orange-600 hover:underline">Home</a>
            <a href="/terms" className="text-orange-600 hover:underline">Terms of Service</a>
            <a href="/resources" className="text-orange-600 hover:underline">Resources</a>
          </div>
        </div>
      </div>
    </main>
  );
}
