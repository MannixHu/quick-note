'use client'

import { CalendarOutlined, FireOutlined, RightOutlined, TagOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface DashboardPanelProps {
  weeklyProgress: {
    answered: number
    total: number
  }
  currentStreak: number
  topTags: Array<{ tag: string; count: number }>
  todayAnswered: boolean
  isLoading?: boolean
}

// Category label mapping
const CATEGORY_LABELS: Record<string, string> = {
  reflection: '反思',
  planning: '规划',
  gratitude: '感恩',
  growth: '成长',
  relationships: '人际',
  values: '价值观',
  logic: '逻辑',
  philosophy: '哲学',
  science: '科技',
  abstract: '抽象',
  systems: '系统',
  creativity: '创意',
  knowledge: '知识',
  self: '自我',
  future: '未来',
  thought_experiment: '思维实验',
  decision: '决策',
  curiosity: '好奇',
  psychology: '心理',
  mathematics: '数学',
  ethics: '伦理',
  language: '语言',
  consciousness: '意识',
  history: '历史',
  paradox: '悖论',
  metacognition: '元认知',
  problem_solving: '问题解决',
  information: '信息',
  complexity: '复杂性',
  analogy: '类比',
  existence: '存在',
  innovation: '创新',
  unknown: '其他',
}

export function DashboardPanel({
  weeklyProgress,
  currentStreak,
  topTags,
  todayAnswered,
  isLoading,
}: DashboardPanelProps) {
  const params = useParams()
  const locale = params?.locale || 'zh'

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-4 mb-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
          <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    )
  }

  const progressPercent = Math.round((weeklyProgress.answered / weeklyProgress.total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-xl p-4 mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Weekly Progress */}
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-primary-500 text-lg" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">本周</span>
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {weeklyProgress.answered}/{weeklyProgress.total}
                </span>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2">
            <FireOutlined
              className={`text-lg ${currentStreak > 0 ? 'text-orange-500' : 'text-neutral-400'}`}
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {currentStreak > 0 ? (
                <>
                  <span className="font-semibold text-orange-500">{currentStreak}</span> 天连续
                </>
              ) : (
                '开始打卡'
              )}
            </span>
          </div>

          {/* Today Status */}
          {todayAnswered && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs text-green-700 dark:text-green-400">今日已完成</span>
            </div>
          )}

          {/* Top Tags */}
          {topTags.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <TagOutlined className="text-neutral-400 text-sm" />
              <div className="flex items-center gap-1.5">
                {topTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.tag}
                    className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  >
                    {CATEGORY_LABELS[tag.tag] || tag.tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Review Link */}
        <Link
          href={`/${locale}/daily_question/review`}
          className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 transition-colors group"
        >
          <span>查看回顾</span>
          <RightOutlined className="text-xs group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}
