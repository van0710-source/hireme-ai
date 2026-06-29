// app/blog/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume & Interview Tips — HireMe-AI Resources',
  description:
    'Free guides on resume writing, ATS optimization, and interview preparation. Learn how to tailor your resume for any company and land more interviews.',
  alternates: { canonical: 'https://www.hireme-ai.com/blog' },
}

const ARTICLES = [
  {
    slug: 'how-ats-works',
    title: 'How Applicant Tracking Systems actually work',
    summary:
      'Most resumes are screened by software before a human ever reads them. Here\'s what ATS systems look for and how to beat them.',
    date: 'Coming soon',
  },
  {
    slug: 'resume-action-verbs',
    title: '50 powerful resume action verbs that get results',
    summary:
      'Replace weak phrases like "responsible for" with verbs that show impact and initiative.',
    date: 'Coming soon',
  },
  {
    slug: 'star-interview-method',
    title: 'The STAR method: answer any behavioral interview question',
    summary:
      'Situation, Task, Action, Result — the framework used by top candidates at Google, Amazon, and beyond.',
    date: 'Coming soon',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7]">
      <section className="mx-auto max-w-2xl px-4 pt-14 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <p className="mt-2 text-gray-500">
          Resume writing, ATS optimisation, and interview prep — practical guides for modern
          job seekers.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20 space-y-5">
        {ARTICLES.map(article => (
          <article
            key={article.slug}
            className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          >
            <p className="text-xs text-gray-400 mb-1">{article.date}</p>
            <h2 className="text-base font-semibold text-gray-900 mb-1">{article.title}</h2>
            <p className="text-sm text-gray-500">{article.summary}</p>
          </article>
        ))}
      </section>
    </main>
  )
}