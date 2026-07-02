import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.hireme-ai.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${base}/faq`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  let posts: MetadataRoute.Sitemap = []
  try {
    const published = await getPublishedPosts()
    posts = published.map(post => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // build-time: no env vars yet — static pages only
  }

  return [...staticPages, ...posts]
}
