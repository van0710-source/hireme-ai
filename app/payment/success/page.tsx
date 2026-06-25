'use client'
// app/payment/success/page.tsx

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SuccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const productType = params.get('type') ?? 'credits'
  const [count, setCount] = useState(4)

  const message =
    productType === 'single'
      ? 'Your single-use credit has been added.'
      : '200 credits have been added to your account.'

  useEffect(() => {
    // Replace current history entry to prevent back-button returning to Creem
    window.history.replaceState(null, '', '/payment/success')
  }, [])
      setCount(c => {
        if (c <= 1) {
          clearInterval(interval)
          router.push('/')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <main className="min-h-screen bg-[#FFFBF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-gray-600 mb-2">{message}</p>
        <p className="text-gray-600 mb-8">You can now generate tailored resumes and interview prep.</p>
        <p className="text-sm text-gray-400 mb-6">Redirecting in {count}s…</p>
        <a href="/" className="inline-block rounded-xl bg-orange-500 px-8 py-3 text-base font-semibold text-white hover:bg-orange-600 transition-colors">
          Start tailoring →
        </a>
        <p className="mt-6 text-xs text-gray-400">
          If your credits don&apos;t appear immediately, refresh the page.
        </p>
      </div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}