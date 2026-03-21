import type { Metadata } from 'next'
import 'katex/dist/katex.min.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'mdshape Playground — Validate Markdown with Schemas',
  description: 'Interactive playground for mdshape. Write Markdown, define a schema, and validate in real time. Built for RAG pipelines, PDF-to-MD validation, and structured content.',
  metadataBase: new URL('https://playground.markschema.com'),
  openGraph: {
    type: 'website',
    title: 'mdshape Playground — Validate Markdown with Schemas',
    description: 'Interactive playground for mdshape. Write Markdown, define a schema, and validate in real time.',
    url: 'https://playground.markschema.com',
    siteName: 'markschema',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mdshape Playground — Validate Markdown with Schemas',
    description: 'Interactive playground for mdshape. Write Markdown, define a schema, and validate in real time.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://playground.markschema.com',
  },
  authors: [{ name: 'Refiski' }],
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'mdshape Playground',
  description: 'Interactive playground for mdshape. Write Markdown, define a schema, and validate in real time.',
  url: 'https://playground.markschema.com',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Organization', name: 'Refiski', url: 'https://refiski.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
