'use client'
// components/PaywallModal.tsx

import { useState } from 'react'

interface Props {
  deviceId: string
  onClose?: () => void
}

type Plan = 'single' | 'credits'

export default function PaywallModal({ deviceId, onClose }: Props) {
  const [selected, setSelected] = useState<Plan>('credits')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, productType: selected }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? 'Checkout failed')
      }
      window.location.href = data.checkoutUrl
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="relative w-full max-w-md rounded-[20px] bg-white dark:bg-[#1c1a18] border border-[#f0ece6] dark:border-[#2e2b27] p-7 shadow-lg">

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-3.5 text-[#b0a99e] dark:text-[#6b6560] hover:text-[#6b6560] dark:hover:text-[#9e9890] transition-colors text-lg leading-none p-1"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-5">
          <p className="text-3xl mb-2">🎯</p>
          <h2 className="text-[17px] font-semibold text-[#1a1714] dark:text-[#f5f0e8] mb-1">
            You've used your 3 free tries
          </h2>
          <p className="text-[13px] text-[#9e9890]">
            Unlock more tailored resumes and interview prep
          </p>
        </div>

        {/* Plan cards */}
        <div className="space-y-2.5">

          {/* Single use */}
          <button
            onClick={() => setSelected('single')}
            className={`w-full rounded-[14px] border-[1.5px] p-4 text-left transition-all ${
              selected === 'single'
                ? 'border-orange-400 bg-orange-50 dark:bg-[#2a1f10] dark:border-orange-400'
                : 'border-[#e8e3dc] dark:border-[#3a3630] bg-[#faf8f5] dark:bg-[#252220] hover:border-[#d0c9c0] dark:hover:border-[#4a4640]'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Radio */}
              <div className={`h-[17px] w-[17px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selected === 'single' ? 'border-orange-500' : 'border-[#d0c9c0] dark:border-[#5a5550]'
              }`}>
                {selected === 'single' && (
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#1a1714] dark:text-[#f5f0e8]">Single use</p>
                <p className="text-[12px] text-[#9e9890] mt-0.5">1 resume + interview questions</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[19px] font-bold text-[#1a1714] dark:text-[#f5f0e8] leading-tight">$1</p>
                <p className="text-[11px] text-[#b0a99e] mt-0.5">$1.00 / use</p>
              </div>
            </div>
          </button>

          {/* Credits pack */}
          <div className="relative mt-4">
            {/* Best value badge */}
            <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 z-10">
              <span className="bg-orange-500 text-white text-[11px] font-semibold px-3 py-[3px] rounded-full whitespace-nowrap">
                Best value — save 92%
              </span>
            </div>
            <button
              onClick={() => setSelected('credits')}
              className={`w-full rounded-[14px] border-[1.5px] p-4 text-left transition-all ${
                selected === 'credits'
                  ? 'border-orange-400 bg-orange-50 dark:bg-[#2a1f10] dark:border-orange-400'
                  : 'border-[#e8e3dc] dark:border-[#3a3630] bg-[#faf8f5] dark:bg-[#252220] hover:border-[#d0c9c0] dark:hover:border-[#4a4640]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-[17px] w-[17px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected === 'credits' ? 'border-orange-500' : 'border-[#d0c9c0] dark:border-[#5a5550]'
                }`}>
                  {selected === 'credits' && (
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1a1714] dark:text-[#f5f0e8]">Credits pack</p>
                  <p className="text-[12px] text-[#9e9890] mt-0.5">200 credits · ~25 generations</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[19px] font-bold text-[#1a1714] dark:text-[#f5f0e8] leading-tight">$20</p>
                  <p className="text-[11px] text-[#b0a99e] mt-0.5">$0.08 / use</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#f0ece6] dark:border-[#2e2b27] my-4" />

        {/* Savings bar */}
        <div className="flex items-center gap-2 bg-green-50 dark:bg-[#1a2e1a] border border-green-200 dark:border-[#2d4a2d] rounded-[10px] px-3 py-2.5 mb-4">
          <span className="text-[13px]">💚</span>
          <p className="text-[12px] text-green-700 dark:text-green-400">
            Credits pack saves you{' '}
            <strong className="text-green-800 dark:text-green-300">$4.92</strong>{' '}
            vs buying 25 single uses
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 py-3.5 text-[15px] font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Redirecting to checkout…'
            : selected === 'credits'
            ? 'Get credits pack · $20'
            : 'Continue · $1'}
        </button>

        {/* Footer */}
        <p className="mt-3 text-center text-[11px] text-[#b0a99e] flex items-center justify-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Secure payment by Creem · No card data stored on this site
        </p>
      </div>
    </div>
  )
}