'use client'
// components/PaywallModal.tsx

import { useState } from 'react'

interface Props {
  deviceId: string
  onClose?: () => void
}

type Plan = 'single' | 'credits'

interface PlanOption {
  id: Plan
  label: string
  price: string
  description: string
  badge?: string
}

const PLANS: PlanOption[] = [
  {
    id: 'single',
    label: 'Single use',
    price: '$1',
    description: '1 tailored resume + interview questions',
  },
  {
    id: 'credits',
    label: 'Credits pack',
    price: '$20',
    description: '200 credits · ~13 generations',
    badge: 'Best value',
  },
]

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        <div className="mb-6 text-center">
          <p className="text-3xl mb-2">🎯</p>
          <h2 className="text-xl font-semibold text-gray-900">You've used your 3 free tries</h2>
          <p className="mt-1 text-sm text-gray-500">
            Unlock more tailored resumes and interview prep
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`w-full flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                selected === plan.id
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selected === plan.id ? 'border-orange-500' : 'border-gray-300'
                  }`}
                >
                  {selected === plan.id && (
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-900">{plan.label}</span>
                  {plan.badge && (
                    <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                      {plan.badge}
                    </span>
                  )}
                  <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">{plan.price}</span>
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Redirecting to checkout…' : `Continue with ${selected === 'single' ? '$1' : '$20'}`}
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          Secure payment by Creem · No card data stored on this site
        </p>
      </div>
    </div>
  )
}