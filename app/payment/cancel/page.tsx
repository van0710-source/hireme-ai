// app/payment/cancel/page.tsx

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">↩️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment cancelled</h1>
        <p className="text-gray-600 mb-8">
          No charge was made. You can try again whenever you&apos;re ready.
        </p>
        <a href="/" className="inline-block rounded-xl bg-orange-500 px-8 py-3 text-base font-semibold text-white hover:bg-orange-600 transition-colors">
          Back to HireMe AI
        </a>
      </div>
    </main>
  )
}