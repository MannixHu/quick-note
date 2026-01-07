import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | 快记 QuickNote',
    default: '快记 QuickNote - 快速记录，高效生活',
  },
  description: '时间块记录 + 每日问答，帮助你管理时间、深度思考、持续成长',
  keywords: ['时间管理', '时间块', '每日问答', '自我反思', '效率工具'],
  authors: [{ name: 'QuickNote Team' }],
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: '快记 QuickNote',
    description: '时间块记录 + 每日问答，帮助你管理时间、深度思考、持续成长',
    type: 'website',
    locale: 'zh_CN',
    siteName: '快记 QuickNote',
  },
  twitter: {
    card: 'summary_large_image',
    title: '快记 QuickNote',
    description: '时间块记录 + 每日问答，帮助你管理时间、深度思考、持续成长',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// Root layout - locale-specific layout is in app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
