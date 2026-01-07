import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '忘记密码',
  description: '重置你的快记 QuickNote 账号密码',
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
