// components/LanguageNav.tsx

export default function LanguageNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center px-6 py-3">
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
      </div>
    </nav>
  )
}