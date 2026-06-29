import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'HireMe-AI — Tailor Your Resume for Any Company in Seconds'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#fff',
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
      <div style={{ fontSize: '48px', fontWeight: 800, color: '#111', marginBottom: '24px' }}>
        HireMe-AI
      </div>
      <div style={{ fontSize: '60px', fontWeight: 800, color: '#111', lineHeight: 1.1, marginBottom: '24px' }}>
        Tailor Your Resume for Any Company in Seconds
      </div>
      <div style={{ fontSize: '28px', color: '#888' }}>
        AI resume tailoring · ATS optimization · Interview prep
      </div>
    </div>,
    { ...size }
  )
}
