import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '每日问答',
  description: '每天一个深度思考问题，帮助你反思成长、发现自我',
}

export default function DailyQuestionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
