import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '注册',
  description: '注册快记 QuickNote 账号，开启高效生活',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
