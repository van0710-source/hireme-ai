import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'HireMe-AI — Tailor Your Resume for Any Company in Seconds'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #fff8f3 0%, #fff 60%, #fff7f0 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
          <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#E8590C" />
            <path d="M20 6 L32 15 L20 22 L8 15 Z" fill="white" opacity="0.9" />
            <path d="M20 22 L32 15 L20 34 Z" fill="white" opacity="0.5" />
            <path d="M20 22 L8 15 L20 34 Z" fill="white" opacity="0.3" />
          </svg>
          <span style={{ fontSize: '40px', fontWeight: 800, color: '#111', letterSpacing: '-1px' }}>
            HireMe<span style={{ color: '#f97316' }}>-</span>AI
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#111',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: '28px',
            maxWidth: '900px',
          }}
        >
          Tailor Your Resume for<br />
          <span style={{ color: '#f97316' }}>Any Company</span> in Seconds
        </div>

        {/* Subtext */}
        <div style={{ fontSize: '28px', color: '#666', fontWeight: 400 }}>
          AI resume tailoring · ATS optimization · Interview prep
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '64px',
            right: '80px',
            background: '#f97316',
            color: 'white',
            fontSize: '22px',
            fontWeight: 700,
            padding: '12px 28px',
            borderRadius: '100px',
          }}
        >
          Free to try →
        </div>
      </div>
    ),
    { ...size }
  )
}
