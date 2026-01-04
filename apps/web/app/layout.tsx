import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Universal App',
  description: 'A cross-platform full-stack application',
}

// Root layout - locale-specific layout is in app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
