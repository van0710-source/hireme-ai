'use client'

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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [deviceId, setDeviceId] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('hireme_device_id')
    if (stored) setDeviceId(stored)

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
    setShowMobileMenu(false)
    window.dispatchEvent(new Event('hireme:auth-change'))
  }

  function handleAuthSuccess(userData: { email: string; credits: number; totalUsed: number }) {
    setUser({
      ...userData,
      freeRemaining: Math.max(0, 3 - userData.totalUsed),
      paidUsesRemaining: Math.floor(userData.credits / 8),
      status: userData.totalUsed < 3 ? 'free' : userData.credits >= 8 ? 'credits' : 'blocked',
    })
    setShowAuth(false)
    window.dispatchEvent(new Event('hireme:auth-change'))
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-[#E5E0D8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">

          {/* Logo */}
          <a href="/" className="text-[15px] font-extrabold tracking-tight text-gray-900 shrink-0">
            hireme<span className="text-orange-500">.</span>ai
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            <a href="#how-it-works" className="text-[13px] text-gray-500 hover:text-gray-800 transition-colors">How it works</a>
            <a href="#what-you-get" className="text-[13px] text-gray-500 hover:text-gray-800 transition-colors">Features</a>
          </div>

          {/* Right: auth + hamburger */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(m => !m)}
                  className="flex items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-[12px] font-medium text-gray-700 max-w-[110px] truncate">{user.email}</span>
                  <svg className={`h-3 w-3 text-gray-400 transition-transform shrink-0 ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-20 w-56 rounded-xl border border-[#E5E0D8] bg-white shadow-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#E5E0D8]">
                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Signed in as</p>
                        <p className="text-[13px] font-semibold text-gray-900 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="px-4 py-3 border-b border-[#E5E0D8] space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500">Free uses</span>
                          <span className="font-semibold text-gray-700">{Math.min(user.totalUsed, 3)}/3 used</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500">Credits</span>
                          <span className="font-semibold text-orange-500">{user.credits}</span>
                        </div>
                        {user.paidUsesRemaining > 0 && (
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Paid uses left</span>
                            <span className="font-semibold text-blue-600">{user.paidUsesRemaining}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode('login'); setShowAuth(true) }}
                  className="hidden sm:block text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5"
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuth(true) }}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-orange-600 transition-colors"
                >
                  Get started free
                </button>
              </>
            )}

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-1"
              onClick={() => setShowMobileMenu(m => !m)}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-[#E5E0D8] bg-white px-6 py-4 space-y-1">
            <a href="#how-it-works" onClick={() => setShowMobileMenu(false)} className="block py-2.5 text-[14px] text-gray-700 font-medium">How it works</a>
            <a href="#what-you-get" onClick={() => setShowMobileMenu(false)} className="block py-2.5 text-[14px] text-gray-700 font-medium">Features</a>
            {!user && (
              <>
                <div className="h-px bg-[#E5E0D8] my-2" />
                <button
                  onClick={() => { setAuthMode('login'); setShowAuth(true); setShowMobileMenu(false) }}
                  className="block py-2.5 text-[14px] text-gray-700 font-medium w-full text-left"
                >
                  Sign in
                </button>
              </>
            )}
            {user && (
              <>
                <div className="h-px bg-[#E5E0D8] my-2" />
                <button
                  onClick={handleLogout}
                  className="block py-2.5 text-[14px] text-red-500 font-medium w-full text-left"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        )}
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
