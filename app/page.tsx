'use client'

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
  totalUsed: number
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
    <main className="min-h-screen bg-[#FDFAF6]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-100/60 blur-3xl" />
          <div className="absolute top-32 -left-16 w-64 h-64 rounded-full bg-amber-50/80 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-100 px-4 py-1.5 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-xs font-medium text-orange-600">AI-powered · No sign-up required</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                Paste your<br />
                resume.<br />
                <span className="text-orange-500">Get the interview</span><br />
                <span className="text-orange-500">that fits.</span>
              </h1>

              <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-sm">
                One resume. Any company.<br />Tailored in seconds.
              </p>

               {/* Quota card */}
              {quota && (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm p-4 max-w-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Account</span>
                    {quota.status !== 'blocked' && (
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                      >
                        Buy more →
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Free quota */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Free generations</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {Math.min(quota.totalUsed, 3)}/3 used
                      </span>
                    </div>

                    {/* Credits */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Credits balance</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {quota.credits} credits
                      </span>
                    </div>

                    {/* Paid generations */}
                    {quota.paidUsesRemaining > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Paid generations left</span>
                        <span className="text-xs font-semibold text-blue-600">
                          {quota.paidUsesRemaining} remaining
                        </span>
                      </div>
                    )}

                    {/* Status */}
                    <div className="pt-2 border-t border-gray-100">
                      {quota.status === 'free' && (
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-xs text-emerald-600 font-medium">
                            {quota.freeRemaining} free {quota.freeRemaining === 1 ? 'generation' : 'generations'} remaining
                          </span>
                        </div>
                      )}
                      {quota.status === 'credits' && (
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          <span className="text-xs text-blue-600 font-medium">
                            Active · {quota.paidUsesRemaining} generations from credits
                          </span>
                        </div>
                      )}
                      {quota.status === 'blocked' && (
                        <button
                          onClick={() => setShowPaywall(true)}
                          className="w-full rounded-xl bg-orange-500 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
                        >
                          Add credits to continue →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
         )}
            </div>

            {/* Right: decorative card */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-xl p-6 rotate-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs text-gray-400">resume_optimized.txt</span>
                  </div>
                  <div className="space-y-2">
                    {['✦ Quantified achievements added', '✦ ATS keywords injected', '✦ Action verbs strengthened', '✦ Tailored for Google SWE'].map((line, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                        <p className="text-xs text-gray-600">{line}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg bg-orange-50 px-3 py-2">
                    <p className="text-xs font-medium text-orange-700">Interview match score: 94%</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-lg p-4 -rotate-2">
                  <p className="text-xs font-medium text-emerald-700">🎉 Interview secured at Google</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Input form ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Main form: 3 cols */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <PdfUploader onExtracted={text => setResume(text)} />

              <div className="mb-4">
                <label htmlFor="resume" className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Your resume
                </label>
                <textarea
                  id="resume"
                  value={resume}
                  onChange={e => setResume(e.target.value)}
                  placeholder="Paste your resume here — work experience, skills, education…"
                  rows={12}
                  maxLength={8000}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
                />
                <p className="mt-1 text-right text-xs text-gray-400">{resume.length}/8000</p>
              </div>

              <div className="mb-5">
                <label htmlFor="target" className="mb-1.5 block text-sm font-semibold text-gray-700">
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
                  <p className="mt-1.5 text-xs text-orange-600 flex items-center gap-1">
                    <span>✦</span> Tailoring specifically for {targetCompany}
                  </p>
                )}
              </div>

              {error && (
                <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 border border-red-100">{error}</p>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !resume.trim()}
                className="w-full rounded-xl bg-orange-500 py-4 text-base font-bold text-white shadow-md hover:bg-orange-600 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                Your resume is never stored on our servers.
              </p>
            </div>
          </div>

          {/* Sidebar: 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">How it works</h3>
              <div className="space-y-3">
                {[
                  { n: '01', title: 'Paste or upload', desc: 'Drop your existing resume in any format' },
                  { n: '02', title: 'Set your target', desc: 'Name a company or industry (optional)' },
                  { n: '03', title: 'Get results', desc: 'Tailored resume + interview questions in seconds' },
                ].map(step => (
                  <div key={step.n} className="flex gap-3">
                    <span className="text-xs font-bold text-orange-400 mt-0.5 shrink-0">{step.n}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{step.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5">
              <p className="text-sm font-semibold text-orange-900 mb-2">Why HireMe AI?</p>
              <div className="space-y-2">
                {[
                  'No account needed',
                  'Resume never stored',
                  'ATS-optimized output',
                  'Interview prep included',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-orange-400 text-xs">✓</span>
                    <span className="text-xs text-orange-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Results ── */}
      {result && (
        <section id="results" className="mx-auto max-w-5xl px-6 pb-24 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-900">Your tailored results</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                AI-generated · For reference only
              </span>
              {result.targetCompany && (
                <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  Tailored for {result.targetCompany}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resume: full width */}
            <div className="lg:col-span-3">
              <ResultCard title="Optimized Resume" accent="orange">
                <div className="text-sm text-gray-700 leading-relaxed font-sans space-y-3">
                  {result.optimized_resume
                    .split('\n')
                    .map((line, i) => (
                      <p key={i} className={line.trim() === '' ? 'mt-2' : ''}>
                        {line || '\u00A0'}
                      </p>
                    ))}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(result.optimized_resume)}
                  className="mt-4 rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Copy to clipboard
                </button>
              </ResultCard>
            </div>

            {/* Improvements + Keywords: side by side */}
            <div className="lg:col-span-2">
              <ResultCard title="Key Improvements" accent="emerald">
                <ul className="space-y-2">
                  {result.key_improvements.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="mt-0.5 text-emerald-500 shrink-0 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </ResultCard>
            </div>

            <div className="lg:col-span-1">
              <ResultCard title="ATS Keywords" accent="blue">
                <div className="flex flex-wrap gap-2">
                  {result.ats_keywords.map((kw, i) => (
                    <span key={i} className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </ResultCard>
            </div>

            {/* Interview questions: full width */}
            <div className="lg:col-span-3">
              <ResultCard title="Interview Questions to Prepare" accent="purple">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {result.interview_questions.map((item, i) => (
                    <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1.5">{i + 1}. {item.question}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">💡 {item.tip}</p>
                    </div>
                  ))}
                </div>
              </ResultCard>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => {
                setResult(null)
                setResume('')
                setTargetCompany('')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              ← Try with another resume
            </button>
          </div>
        </section>
      )}

      {showPaywall && (
        <PaywallModal deviceId={deviceId} onClose={() => setShowPaywall(false)} />
      )}
    </main>
  )
}

function ResultCard({
  title,
  children,
  accent = 'orange',
}: {
  title: string
  children: React.ReactNode
  accent?: 'orange' | 'emerald' | 'blue' | 'purple'
}) {
  const borderMap = {
    orange: 'border-l-orange-400',
    emerald: 'border-l-emerald-400',
    blue: 'border-l-blue-400',
    purple: 'border-l-purple-400',
  }
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm border border-gray-100 border-l-4 ${borderMap[accent]} h-full`}>
      <h3 className="mb-4 text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}