// app/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Resume & Interview Tips — HireMe-AI Resources',
  description:
    'Free guides on resume writing, ATS optimization, and interview preparation. Learn how to tailor your resume for any company and land more interviews.',
  alternates: { canonical: 'https://www.hireme-ai.com/blog' },
}

export const revalidate = 3600

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

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
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500 rounded-2xl bg-white border border-gray-100 p-6">
            New articles are on the way. Check back soon, or{' '}
            <Link href="/" className="text-orange-600 hover:underline">
              try HireMe-AI free
            </Link>{' '}
            while you wait.
          </p>
        ) : (
          posts.map(post => (
            <article
              key={post.slug}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:border-orange-200 transition-colors"
            >
              <p className="text-xs text-gray-400 mb-1">{formatDate(post.published_at)}</p>
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                <Link href={`/blog/${post.slug}`} className="hover:text-orange-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-gray-500">
                {post.meta_description ?? 'Read more about resume tailoring and interview prep.'}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-block mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Read article →
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  )
}
