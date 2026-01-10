'use client'

import {
  CalendarOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

interface StatsOverviewProps {
  totalAnswers: number
  answeredDays: number
  currentStreak: number
  avgAnswersPerDay: number
  isLoading?: boolean
}

const StatCard = ({
  icon,
  label,
  value,
  suffix,
  color,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  suffix?: string
  color: string
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="glass rounded-xl p-4"
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          {value}
          {suffix && <span className="text-sm font-normal text-neutral-500 ml-1">{suffix}</span>}
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
      </div>
    </div>
  </motion.div>
)

export function StatsOverview({
  totalAnswers,
  answeredDays,
  currentStreak,
  avgAnswersPerDay,
  isLoading,
}: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
          <div key={`skeleton-${i}`} className="glass rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex-1">
                <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded mb-1" />
                <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<FileTextOutlined className="text-white text-lg" />}
        label="总回答数"
        value={totalAnswers}
        color="bg-gradient-to-br from-primary-500 to-primary-600"
        delay={0.1}
      />
      <StatCard
        icon={<CalendarOutlined className="text-white text-lg" />}
        label="回答天数"
        value={answeredDays}
        suffix="天"
        color="bg-gradient-to-br from-green-500 to-green-600"
        delay={0.15}
      />
      <StatCard
        icon={<FireOutlined className="text-white text-lg" />}
        label="连续打卡"
        value={currentStreak}
        suffix="天"
        color="bg-gradient-to-br from-orange-500 to-orange-600"
        delay={0.2}
      />
      <StatCard
        icon={<FieldTimeOutlined className="text-white text-lg" />}
        label="日均回答"
        value={avgAnswersPerDay}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
        delay={0.25}
      />
    </div>
  )
}
