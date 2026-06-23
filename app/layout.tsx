import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hireme-ai.com';

export const metadata: Metadata = {
  title: 'HireMe AI — Paste your resume. Get the interview that fits.',
  description:
    'One resume. Any company. Tailored in seconds. ATS-optimized resume, interview questions, and 30-second pitch.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'HireMe AI',
    description: 'Paste your resume. Get the interview that fits.',
    url: siteUrl,
    siteName: 'HireMe AI',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'HireMe AI',
      url: siteUrl,
      logo: `${siteUrl}/favicon.ico`,
      description: 'AI-powered interview preparation for job seekers.',
    },
    {
      '@type': 'Product',
      name: 'HireMe AI Interview Pass',
      description:
        'Tailored ATS resume optimization, interview questions, and 30-second pitch.',
      brand: { '@type': 'Brand', name: 'HireMe AI' },
      offers: [
        {
          '@type': 'Offer',
          name: 'Single Generation',
          price: '1.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Credits Pack (200 credits)',
          price: '20.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
