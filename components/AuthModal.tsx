'use client'
// components/AuthModal.tsx
// Registration and login modal with email verification flow

import { useState } from 'react'

interface Props {
  onClose: () => void
  onSuccess: (user: { email: string; credits: number; totalUsed: number }) => void
  deviceId: string
  initialMode?: 'login' | 'register'
}

type Mode = 'login' | 'register' | 'verify'

export default function AuthModal({ onClose, onSuccess, deviceId, initialMode = 'register' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleRegister() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send code')
      setInfo(`Verification code sent to ${email}`)
      setMode('verify')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password, deviceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Verification failed')
      onSuccess(data.user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Login failed')
      onSuccess(data.user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-2xl mb-1">
            {mode === 'login' ? '👋' : mode === 'verify' ? '📧' : '🚀'}
          </p>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'login' ? 'Sign in' : mode === 'verify' ? 'Check your email' : 'Create account'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'login'
              ? 'Your credits are tied to your account'
              : mode === 'verify'
              ? info
              : 'Save your credits across devices'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3">
          {mode !== 'verify' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-center text-xl tracking-widest font-mono focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>
          )}

          {(mode === 'verify' || mode === 'login') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'verify' ? 'Set a password' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'verify' ? 'At least 8 characters' : '••••••••'}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">
            {error}
          </p>
        )}

        {/* CTA button */}
        <button
          onClick={
            mode === 'login'
              ? handleLogin
              : mode === 'verify'
              ? handleVerify
              : handleRegister
          }
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-orange-500 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Please wait…'
            : mode === 'login'
            ? 'Sign in'
            : mode === 'verify'
            ? 'Create account'
            : 'Send verification code'}
        </button>

        {/* Toggle mode */}
        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button
                onClick={() => { setMode('register'); setError('') }}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError('') }}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Privacy note */}
        <p className="mt-3 text-center text-xs text-gray-400">
          Your email is only used for account access. We never share it.
        </p>
      </div>
    </div>
  )
}