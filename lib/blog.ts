// lib/blog.ts — server-only blog queries (Supabase blog_posts)

import { getSupabaseAdmin } from './supabase-server'

export interface BlogFaqItem {
  q: string
  a: string
}

export interface BlogPostListItem {
  slug: string
  title: string
  meta_description: string | null
  published_at: string
  language: string
}

export interface BlogPost extends BlogPostListItem {
  content: string
  faq: BlogFaqItem[] | null
  keyword: string | null
}

const SITE = 'https://www.hireme-ai.com'

export async function getPublishedPosts(): Promise<BlogPostListItem[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('slug, title, meta_description, published_at, language')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('[blog] list error:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('[blog] list failed:', err)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('slug, title, meta_description, content, faq, language, keyword, published_at')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      console.error('[blog] get error:', error.message)
      return null
    }
    if (!data) return null

    return {
      ...data,
      faq: normalizeFaq(data.faq),
    }
  } catch (err) {
    console.error('[blog] get failed:', err)
    return null
  }
}

function normalizeFaq(faq: unknown): BlogFaqItem[] | null {
  if (!Array.isArray(faq)) return null
  const items = faq
    .filter((item): item is BlogFaqItem =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as BlogFaqItem).q === 'string' &&
      typeof (item as BlogFaqItem).a === 'string'
    )
  return items.length > 0 ? items : null
}

export function postUrl(slug: string): string {
  return `${SITE}/blog/${slug}`
}

export function articleJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description ?? undefined,
    datePublished: post.published_at,
    dateModified: post.published_at,
    inLanguage: post.language === 'es' ? 'es' : 'en',
    author: { '@type': 'Organization', name: 'HireMe-AI', url: SITE },
    publisher: {
      '@type': 'Organization',
      name: 'HireMe-AI',
      url: SITE,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl(post.slug) },
  }
}

export function faqJsonLd(faq: BlogFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export const HOMEPAGE_FAQ = [
  {
    q: 'Do I need to sign up to try HireMe-AI?',
    a: 'No. You get 3 free resume tailoring sessions without creating an account. Sign up only if you want to save credits across devices.',
  },
  {
    q: 'Is my resume stored on your servers?',
    a: 'No. Your resume is processed in real time for generation and is not stored. PDF parsing happens in your browser when you upload a file.',
  },
  {
    q: 'How much does HireMe-AI cost?',
    a: 'Free tier includes 3 uses. After that, pay $1 for a single session or $20 for a credits pack (about $0.08 per use). No subscription.',
  },
  {
    q: 'What do I get after pasting my resume?',
    a: 'A company-tailored resume rewrite, ATS keywords, key improvements, and 10 interview questions calibrated to your target role and company.',
  },
  {
    q: 'Can I use HireMe-AI for any company?',
    a: 'Yes. Enter any target company name and HireMe-AI tailors your resume and interview prep for that employer.',
  },
] as const

export function homepageFaqJsonLd() {
  return faqJsonLd([...HOMEPAGE_FAQ])
}
