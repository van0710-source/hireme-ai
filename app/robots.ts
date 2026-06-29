import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/payment/'],
    },
    sitemap: 'https://www.hireme-ai.com/sitemap.xml',
  }
}
