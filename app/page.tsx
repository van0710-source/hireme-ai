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
  const [copied, setCopied] = useState(false)

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

  useEffect(() => {
    const id = getDeviceId()
    setDeviceId(id)
    fetchQuota(id)

    const onAuthChange = () => fetchQuota(id)
    window.addEventListener('hireme:auth-change', onAuthChange)
    return () => window.removeEventListener('hireme:auth-change', onAuthChange)
  }, [fetchQuota])

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
      <section className="border-b border-[#E5E0D8]">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-0 lg:pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left: headline + quota */}
            <div className="lg:pr-14 lg:border-r lg:border-[#E5E0D8] pb-10 lg:pb-16">
              <div className="inline-flex items-center gap-2 border border-[#FED7AA] bg-[#FFF3E6] rounded-[4px] px-3 py-1 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                <span className="text-[10px] font-bold tracking-widest text-orange-700 uppercase">AI-Powered Resume Tailoring</span>
              </div>

              <h1 className="text-[28px] sm:text-[38px] lg:text-[50px] font-extrabold leading-[1.06] tracking-tight text-gray-900 mb-5">
                Land the interview<br />
                at <span className="text-orange-500">any company.</span>
              </h1>

              <p className="text-[14px] text-gray-500 leading-relaxed mb-8 max-w-[340px]">
                Paste your resume. Tell us where you&rsquo;re applying.{' '}
                Get a perfectly tailored version — ATS-optimized and interview-ready — in seconds.
              </p>

              {quota && (
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-4 sm:max-w-sm">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#F0EBE0]">
                    <span className="text-[9px] font-bold tracking-[0.1em] text-gray-400 uppercase">Your Account</span>
                    {quota.status !== 'blocked' && (
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="text-[11px] text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                      >
                        Buy credits →
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500">Free uses</span>
                      <span className="text-[11px] font-bold text-gray-700">{Math.min(quota.totalUsed, 3)}/3 used</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500">Credits balance</span>
                      <span className="text-[11px] font-bold text-gray-700">{quota.credits} credits</span>
                    </div>
                    {quota.paidUsesRemaining > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500">Paid uses available</span>
                        <span className="text-[11px] font-bold text-blue-600">{quota.paidUsesRemaining}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#F0EBE0]">
                    {quota.status === 'free' && (
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] text-emerald-600 font-medium">
                          {quota.freeRemaining} free {quota.freeRemaining === 1 ? 'generation' : 'generations'} remaining
                        </span>
                      </div>
                    )}
                    {quota.status === 'credits' && (
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span className="text-[11px] text-blue-600 font-medium">
                          Active · {quota.paidUsesRemaining} paid {quota.paidUsesRemaining === 1 ? 'generation' : 'generations'} available
                        </span>
                      </div>
                    )}
                    {quota.status === 'blocked' && (
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="w-full rounded-lg bg-orange-500 py-2 text-[11px] font-bold text-white hover:bg-orange-600 transition-colors"
                      >
                        Add credits to continue →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: form */}
            <div className="lg:pl-14 pt-8 lg:pt-0 pb-10 lg:pb-16">
              <div className="space-y-4">
                <PdfUploader onExtracted={text => setResume(text)} />

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.08em] text-gray-400 uppercase mb-2">
                    Your resume
                  </label>
                  <textarea
                    value={resume}
                    onChange={e => setResume(e.target.value)}
                    placeholder="Paste your resume here — work experience, skills, education…"
                    maxLength={8000}
                    className="w-full resize-y rounded-xl border border-[#E5E0D8] bg-[#FAFAF8] px-4 py-3 text-[13px] text-gray-800 placeholder-gray-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors min-h-[140px] sm:min-h-[220px]"
                  />
                  <p className="mt-1 text-right text-[10px] text-gray-300">{resume.length}/8000</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.08em] text-gray-400 uppercase mb-2">
                    Target company or industry{' '}
                    <span className="font-normal normal-case text-gray-300">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={e => setTargetCompany(e.target.value)}
                    placeholder="e.g. Google, Stripe, McKinsey, Fintech startup…"
                    maxLength={100}
                    className="w-full rounded-xl border border-[#E5E0D8] bg-[#FAFAF8] px-4 py-3 text-[13px] text-gray-800 placeholder-gray-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
                  />
                  {targetCompany && (
                    <p className="mt-1.5 text-[11px] text-orange-600 flex items-center gap-1">
                      <span>✦</span> Tailoring specifically for {targetCompany}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-[12px] text-red-600">{error}</p>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading || !resume.trim()}
                  className="w-full rounded-xl bg-orange-500 py-4 text-[14px] font-extrabold text-white hover:bg-orange-600 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                <p className="text-center text-[10px] text-gray-300">Your resume is never stored on our servers.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="border-b border-[#E5E0D8] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4">
            {[
              'No account required',
              'Resume never stored',
              'ATS-optimized output',
              'Interview prep included',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-orange-400 text-[12px] font-bold shrink-0">✓</span>
                <span className="text-[12px] text-gray-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-white border-b border-[#E5E0D8]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-[9px] font-bold tracking-[0.14em] text-orange-500 uppercase mb-3">How it works</p>
          <h2 className="text-[24px] font-extrabold tracking-tight text-gray-900 mb-10">Three steps. Seconds.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
            {[
              { n: '01', title: 'Paste your resume', desc: 'Drop in your existing resume in any format — no account needed to get started.' },
              { n: '02', title: 'Name your target', desc: 'Tell us the company or industry. The more specific, the sharper the tailoring.' },
              { n: '03', title: 'Get your results', desc: 'Tailored resume, key improvements, ATS keywords, and interview questions — all at once.' },
            ].map((step, i) => (
              <div key={i} className={`${i > 0 ? 'sm:pl-10 sm:border-l sm:border-[#E5E0D8]' : ''}`}>
                <div className="text-[36px] font-extrabold text-[#F0EBE0] tracking-tight leading-none mb-3">{step.n}</div>
                <div className="text-[15px] font-bold text-gray-900 mb-2">{step.title}</div>
                <div className="text-[13px] text-gray-500 leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get (only before results) ── */}
      {!result && (
        <section id="what-you-get" className="border-b border-[#E5E0D8]">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <p className="text-[9px] font-bold tracking-[0.14em] text-orange-500 uppercase mb-3">What you get</p>
            <h2 className="text-[24px] font-extrabold tracking-tight text-gray-900 mb-10">Everything you need to get the interview.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PreviewCard title="Optimized Resume" accent="orange">
                <div className="space-y-2">
                  {[100, 78, 55, 100, 72, 88].map((w, i) => (
                    <div key={i} className="h-1.5 rounded-full bg-[#F0EBE0]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </PreviewCard>

              <PreviewCard title="Key Improvements" accent="green">
                <div className="space-y-2.5">
                  {['Quantified achievements added', 'Action verbs strengthened', 'ATS keywords injected', 'Tailored for target company'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold text-[11px] shrink-0">✓</span>
                      <span className="text-[12px] text-gray-500">{item}</span>
                    </div>
                  ))}
                </div>
              </PreviewCard>

              <PreviewCard title="ATS Keywords" accent="blue">
                <div className="flex flex-wrap gap-2">
                  {['Python', 'Product strategy', 'Cross-functional', 'SQL', 'A/B testing', 'GTM', 'Stakeholder mgmt'].map((kw, i) => (
                    <span key={i} className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">{kw}</span>
                  ))}
                </div>
              </PreviewCard>

              <PreviewCard title="Interview Questions" accent="purple">
                <div className="space-y-2.5">
                  {[
                    'Tell me about a time you led a cross-functional project.',
                    'How do you prioritize when deadlines compete?',
                  ].map((q, i) => (
                    <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <p className="text-[12px] font-medium text-gray-700">{i + 1}. {q}</p>
                    </div>
                  ))}
                </div>
              </PreviewCard>
            </div>
          </div>
        </section>
      )}

      {/* ── Results ── */}
      {result && (
        <section id="results" className="mx-auto max-w-6xl px-6 py-14 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold tracking-[0.14em] text-orange-500 uppercase mb-1">Your results</p>
              <h2 className="text-[22px] font-extrabold tracking-tight text-gray-900">Your tailored resume is ready.</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-orange-50 border border-orange-100 px-3 py-1 text-[11px] font-medium text-orange-700">
                AI-generated · For reference only
              </span>
              {result.targetCompany && (
                <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-medium text-blue-700">
                  Tailored for {result.targetCompany}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Optimized resume: full width */}
            <div className="lg:col-span-3">
              <ResultCard title="Optimized Resume" accent="orange">
                <div className="text-[13px] text-gray-700 leading-relaxed space-y-1">
                  {result.optimized_resume
                    .split('\n')
                    .reduce((acc: string[], line, i, arr) => {
                      if (line.trim() === '•' && arr[i + 1]) {
                        acc.push('• ' + arr[i + 1].trim())
                        arr[i + 1] = ''
                      } else if (line !== '') {
                        acc.push(line)
                      }
                      return acc
                    }, [])
                    .map((line, i) => (
                      <p
                        key={i}
                        className={
                          line.trim() === '' ? 'h-3' : line.startsWith('•') ? 'pl-3' : ''
                        }
                      >
                        {line || ' '}
                      </p>
                    ))}
                </div>
                <div className="mt-5 flex flex-col items-start gap-2">
                  <p className="text-[11px] text-gray-400">Paste directly into Word or Google Docs to use</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.optimized_resume)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                    className="rounded-lg border border-[#E5E0D8] px-4 py-1.5 text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy to clipboard'}
                  </button>
                </div>
              </ResultCard>
            </div>

            {/* Improvements + Keywords */}
            <div className="lg:col-span-2">
              <ResultCard title="Key Improvements" accent="emerald">
                <ul className="space-y-2">
                  {result.key_improvements.map((item, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-gray-700">
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
                    <span key={i} className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-medium text-blue-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </ResultCard>
            </div>

            {/* Interview questions: full width */}
            <div className="lg:col-span-3">
              <ResultCard title="Interview Questions to Prepare" accent="purple">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.interview_questions.map((item, i) => (
                    <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-[13px] font-semibold text-gray-900 mb-1.5">{i + 1}. {item.question}</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed">💡 {item.tip}</p>
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
              className="rounded-xl border border-[#E5E0D8] bg-white px-8 py-3 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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

function PreviewCard({
  title,
  children,
  accent = 'orange',
}: {
  title: string
  children: React.ReactNode
  accent?: 'orange' | 'green' | 'blue' | 'purple'
}) {
  const borderMap = {
    orange: 'border-l-orange-400',
    green: 'border-l-emerald-400',
    blue: 'border-l-blue-400',
    purple: 'border-l-purple-400',
  }
  return (
    <div className={`rounded-xl bg-white p-5 border border-[#E5E0D8] border-l-4 ${borderMap[accent]}`}>
      <h3 className="text-[9px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-4">{title}</h3>
      {children}
    </div>
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
    <div className={`rounded-xl bg-white p-6 border border-[#E5E0D8] border-l-4 ${borderMap[accent]} h-full`}>
      <h3 className="mb-4 text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em]">{title}</h3>
      {children}
    </div>
  )
}
