'use client'

import { motion } from 'framer-motion'

interface TagStat {
  tag: string
  count: number
  percentage: number
}

interface TagDistributionChartProps {
  data: TagStat[]
  isLoading?: boolean
}

// Category label and color mapping
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  reflection: { label: '反思', color: '#9333ea' },
  planning: { label: '规划', color: '#3b82f6' },
  gratitude: { label: '感恩', color: '#f59e0b' },
  growth: { label: '成长', color: '#22c55e' },
  relationships: { label: '人际', color: '#ec4899' },
  values: { label: '价值观', color: '#8b5cf6' },
  logic: { label: '逻辑', color: '#06b6d4' },
  philosophy: { label: '哲学', color: '#6366f1' },
  science: { label: '科技', color: '#14b8a6' },
  abstract: { label: '抽象', color: '#a855f7' },
  systems: { label: '系统', color: '#0ea5e9' },
  creativity: { label: '创意', color: '#f43f5e' },
  knowledge: { label: '知识', color: '#84cc16' },
  self: { label: '自我', color: '#d946ef' },
  future: { label: '未来', color: '#0891b2' },
  thought_experiment: { label: '思维实验', color: '#7c3aed' },
  decision: { label: '决策', color: '#059669' },
  curiosity: { label: '好奇', color: '#ea580c' },
  psychology: { label: '心理', color: '#db2777' },
  mathematics: { label: '数学', color: '#2563eb' },
  ethics: { label: '伦理', color: '#65a30d' },
  language: { label: '语言', color: '#c026d3' },
  consciousness: { label: '意识', color: '#7c3aed' },
  history: { label: '历史', color: '#b45309' },
  paradox: { label: '悖论', color: '#be123c' },
  metacognition: { label: '元认知', color: '#4f46e5' },
  problem_solving: { label: '问题解决', color: '#0d9488' },
  information: { label: '信息', color: '#0284c7' },
  complexity: { label: '复杂性', color: '#9333ea' },
  analogy: { label: '类比', color: '#c2410c' },
  existence: { label: '存在', color: '#6d28d9' },
  innovation: { label: '创新', color: '#15803d' },
  unknown: { label: '其他', color: '#6b7280' },
}

const getConfig = (tag: string) =>
  CATEGORY_CONFIG[tag] || { label: tag, color: '#6b7280' }

export function TagDistributionChart({ data, isLoading }: TagDistributionChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between mb-1">
              <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-4 w-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        暂无数据
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((item, index) => {
        const config = getConfig(item.tag)
        const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0

        return (
          <motion.div
            key={item.tag}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {config.label}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                className="h-full rounded-full"
                style={{ backgroundColor: config.color }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
