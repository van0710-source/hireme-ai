// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  articleJsonLd,
  faqJsonLd,
  getPostBySlug,
  getPublishedPosts,
  postUrl,
} from '@/lib/blog'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.meta_description ?? undefined,
    alternates: { canonical: postUrl(slug) },
    openGraph: {
      type: 'article',
      url: postUrl(slug),
      title: post.title,
      description: post.meta_description ?? undefined,
      publishedTime: post.published_at,
    },
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const schemas: Record<string, unknown>[] = [articleJsonLd(post)]
  if (post.faq?.length) schemas.push(faqJsonLd(post.faq))

  return (
    <main className="min-h-screen bg-[#FFFBF7]">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="mx-auto max-w-2xl px-4 pt-14 pb-10">
        <Link href="/blog" className="text-sm text-orange-600 hover:underline">
          ← All resources
        </Link>
        <p className="mt-6 text-xs text-gray-400">{formatDate(post.published_at)}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>

        <div
          className="prose prose-gray mt-8 max-w-none text-[15px] leading-relaxed
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
            [&_p]:mb-4 [&_p]:text-gray-700
            [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:list-disc
            [&_li]:mb-1 [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.faq && post.faq.length > 0 && (
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">FAQ</h2>
            <dl className="space-y-4">
              {post.faq.map((item, i) => (
                <div key={i}>
                  <dt className="font-semibold text-gray-900 text-sm">{item.q}</dt>
                  <dd className="mt-1 text-sm text-gray-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </article>

      <section className="mx-auto max-w-2xl px-4 pb-20">
        <div className="rounded-2xl bg-orange-50 border border-orange-100 p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900">Ready to tailor your resume?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Paste your resume, name your target company, and get a tailored rewrite in seconds.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            Try HireMe-AI free →
          </Link>
        </div>
      </section>
    </main>
  )
}
