import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '时间块记录',
  description: '快速记录每天的时间分配，生成可视化的时间块报告',
}

export default function TimeBlocksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
