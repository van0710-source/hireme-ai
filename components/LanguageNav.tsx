'use client'
// components/LanguageNav.tsx
// Top navigation: Logo + Auth (sign in / user menu)

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false })

interface UserInfo {
  email: string
  credits: number
  totalUsed: number
  freeRemaining: number
  paidUsesRemaining: number
  status: string
}

export default function LanguageNav() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [showMenu, setShowMenu] = useState(false)
  const [deviceId, setDeviceId] = useState('')

  useEffect(() => {
    // Get device ID
    const stored = localStorage.getItem('hireme_device_id')
    if (stored) setDeviceId(stored)

    // Check if already logged in
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setShowMenu(false)
  }

  function handleAuthSuccess(userData: { email: string; credits: number; totalUsed: number }) {
    setUser({
      ...userData,
      freeRemaining: Math.max(0, 3 - userData.totalUsed),
      paidUsesRemaining: Math.floor(userData.credits / 8),
      status: userData.totalUsed < 3 ? 'free' : userData.credits >= 8 ? 'credits' : 'blocked',
    })
    setShowAuth(false)
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#F97316"/>
              <path d="M8 22V10H11.5V14.8H16.5V10H20V22H16.5V17.6H11.5V22H8Z" fill="white"/>
              <path d="M22 10L25 10L22.5 16.5L25 22H22L19.5 16.5L22 10Z" fill="white" opacity="0.7"/>
            </svg>
            <span className="text-base font-bold text-gray-900 tracking-tight group-hover:text-orange-500 transition-colors">
              HireMe <span className="text-orange-500">AI</span>
            </span>
          </a>

          {/* Auth area */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(m => !m)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.credits} credits</p>
                </div>
                <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-20 w-56 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Free generations</span>
                        <span className="font-medium text-gray-700">{Math.min(user.totalUsed, 3)}/3 used</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Credits</span>
                        <span className="font-medium text-gray-700">{user.credits}</span>
                      </div>
                      {user.paidUsesRemaining > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Paid uses left</span>
                          <span className="font-medium text-blue-600">{user.paidUsesRemaining}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAuthMode('login'); setShowAuth(true) }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => { setAuthMode('register'); setShowAuth(true) }}
                className="rounded-xl bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Sign up
              </button>
            </div>
          )}

        </div>
      </nav>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
          deviceId={deviceId}
          initialMode={authMode}
        />
      )}
    </>
  )
}