import type { Metadata } from 'next'
import 'katex/dist/katex.min.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'mdshape Playground',
  description: 'Schema-aware markdown workspace for mdshape validation and feature exploration.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
