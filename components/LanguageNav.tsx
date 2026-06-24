'use client'
// components/LanguageNav.tsx
// Top navigation: Logo + Language selector
// Auto-detects user language by IP on first visit, user can override

import { useState, useEffect } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇭🇰' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
]

// IP → language code mapping (common regions)
const IP_LANG_MAP: Record<string, string> = {
  CN: 'zh-CN',
  TW: 'zh-TW',
  HK: 'zh-TW',
  MO: 'zh-TW',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  FR: 'fr',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  JP: 'ja',
  KR: 'ko',
}

const STORAGE_KEY = 'hireme_lang'

export default function LanguageNav() {
  const [lang, setLang] = useState('en')
  const [open, setOpen] = useState(false)
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    // Check saved preference first
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setLang(saved)
      setDetected(true)
      return
    }

    // Auto-detect by IP
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const countryCode = data.country_code as string
        const detected = IP_LANG_MAP[countryCode] ?? 'en'
        setLang(detected)
        localStorage.setItem(STORAGE_KEY, detected)
        setDetected(true)
      })
      .catch(() => {
        setLang('en')
        setDetected(true)
      })
  }, [])

  function selectLang(code: string) {
    setLang(code)
    localStorage.setItem(STORAGE_KEY, code)
    setOpen(false)
    // Future: trigger i18n context update here
  }

  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0]

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          {/* SVG Logo mark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#F97316"/>
            <path d="M8 22V10H11.5V14.8H16.5V10H20V22H16.5V17.6H11.5V22H8Z" fill="white"/>
            <path d="M22 10L25 10L22.5 16.5L25 22H22L19.5 16.5L22 10Z" fill="white" opacity="0.7"/>
          </svg>
          <span className="text-base font-bold text-gray-900 tracking-tight group-hover:text-orange-500 transition-colors">
            HireMe <span className="text-orange-500">AI</span>
          </span>
        </a>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <span>{detected ? current.flag : '🌐'}</span>
            <span className="hidden sm:inline font-medium">{detected ? current.label : 'Language'}</span>
            <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 z-20 w-44 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => selectLang(l.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      lang === l.code
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && <span className="ml-auto text-orange-500">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}