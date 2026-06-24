'use client'
// components/LanguageNav.tsx

import { usePathname } from 'next/navigation'

export default function LanguageNav() {
  const pathname = usePathname()

  function handleTranslate() {
    const currentUrl = encodeURIComponent(window.location.href)
    window.open(
      `https://translate.google.com/translate?sl=en&tl=auto&u=${currentUrl}`,
      '_blank'
    )
  }

  return (
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

        {/* Translate button */}
        <button
          onClick={handleTranslate}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
          </svg>
          <span className="font-medium">Translate</span>
        </button>

      </div>
    </nav>
  )
}