import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登录',
  description: '登录快记 QuickNote，开始记录你的时间和思考',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
