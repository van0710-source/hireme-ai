'use client'
// app/page.tsx

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import PdfUploader from '@/components/PdfUploader'
import { getDeviceId } from '@/lib/device-id'

const PaywallModal = dynamic(() => import('@/components/PaywallModal'), { ssr: false })

interface InterviewQuestion {
  question: string
  tip: string
}

interface GenerateResult {
  optimized_resume: string
  key_improvements: string[]
  interview_questions: InterviewQuestion[]
  ats_keywords: string[]
  targetCompany: string | null
  aiGenerated: boolean
}

interface QuotaInfo {
  canGenerate: boolean
  freeRemaining: number
  credits: number
  paidUsesRemaining: number
  status: 'free' | 'credits' | 'blocked'
}

export default function HomePage() {
  const [resume, setResume] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    const id = getDeviceId()
    setDeviceId(id)
    fetchQuota(id)
  }, [])

  const fetchQuota = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/usage?deviceId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setQuota(data)
      }
    } catch {
      // non-fatal
    }
  }, [])

  async function handleGenerate() {
    if (!resume.trim() || resume.trim().length < 50) {
      setError('Please paste your resume (at least a few sentences).')
      return
    }

    if (quota && !quota.canGenerate) {
      setShowPaywall(true)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resume.trim(),
          deviceId,
          targetCompany: targetCompany.trim(),
        }),
      })

      const data = await res.json()

      if (res.status === 402 || data.error === 'quota_exceeded') {
        setShowPaywall(true)
        return
      }

      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }

      setResult(data)
      await fetchQuota(deviceId)
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFBF7]">
      {/* Hero */}
      <section className="mx-auto max-w-2xl px-4 pt-16 pb-10 text-center">
        <div className="mb-4 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
          AI-powered · No sign-up required
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Paste your resume.<br />
          <span className="text-orange-500">Get the interview that fits.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 sm:text-xl">
          One resume. Any company. Tailored in seconds.
        </p>

        {quota && (
          <div className="mt-4 text-sm text-gray-400">
            {quota.status === 'free' && (
              <span>{quota.freeRemaining} free {quota.freeRemaining === 1 ? 'try' : 'tries'} remaining</span>
            )}
            {quota.status === 'credits' && (
              <span>{quota.paidUsesRemaining} {quota.paidUsesRemaining === 1 ? 'generation' : 'generations'} remaining from credits</span>
            )}
            {quota.status === 'blocked' && (
              <button
                onClick={() => setShowPaywall(true)}
                className="text-orange-500 underline hover:text-orange-600"
              >
                Add credits to continue
              </button>
            )}
          </div>
        )}
      </section>

      {/* Input form */}
      <section className="mx-auto max-w-2xl px-4 pb-16">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <PdfUploader onExtracted={text => setResume(text)} />

          <div className="mb-4">
            <label htmlFor="resume" className="mb-1.5 block text-sm font-medium text-gray-700">
              Your resume
            </label>
            <textarea
              id="resume"
              value={resume}
              onChange={e => setResume(e.target.value)}
              placeholder="Paste your resume here — work experience, skills, education…"
              rows={10}
              maxLength={8000}
              className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{resume.length}/8000</p>
          </div>

          <div className="mb-5">
            <label htmlFor="target" className="mb-1.5 block text-sm font-medium text-gray-700">
              Target company or industry{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="target"
              type="text"
              value={targetCompany}
              onChange={e => setTargetCompany(e.target.value)}
              placeholder="e.g., Google, Fintech, SaaS Sales, Healthcare startup"
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
            />
            {targetCompany && (
              <p className="mt-1 text-xs text-orange-600">
                ✦ Your resume will be specifically tailored for {targetCompany}
              </p>
            )}
          </div>

          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !resume.trim()}
            className="w-full rounded-xl bg-orange-500 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Tailoring your resume…
              </span>
            ) : (
              'Generate tailored resume →'
            )}
          </button>

          <p className="mt-3 text-center text-xs text-gray-400">
            Your resume is processed in real time and never stored on our servers.
          </p>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section id="results" className="mx-auto max-w-2xl px-4 pb-20 space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
              AI-generated suggestion · For reference only
            </span>
            {result.targetCompany && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Tailored for {result.targetCompany}
              </span>
            )}
          </div>

          <ResultCard title="Optimized Resume">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
              {result.optimized_resume}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(result.optimized_resume)}
              className="mt-4 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Copy to clipboard
            </button>
          </ResultCard>

          <ResultCard title="Key Improvements Made">
            <ul className="space-y-2">
              {result.key_improvements.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 text-orange-400 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </ResultCard>

          <ResultCard title="ATS Keywords to Include">
            <div className="flex flex-wrap gap-2">
              {result.ats_keywords.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          </ResultCard>

          <ResultCard title="Interview Questions to Prepare">
            <div className="space-y-4">
              {result.interview_questions.map((item, i) => (
                <div key={i} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">{i + 1}. {item.question}</p>
                  <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                    💡 {item.tip}
                  </p>
                </div>
              ))}
            </div>
          </ResultCard>

          <div className="text-center">
            <button
              onClick={() => {
                setResult(null)
                setResume('')
                setTargetCompany('')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Try with another resume
            </button>
          </div>
        </section>
      )}

      {showPaywall && (
        <PaywallModal
          deviceId={deviceId}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </main>
  )
}

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="mb-4 text-base font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  )
}