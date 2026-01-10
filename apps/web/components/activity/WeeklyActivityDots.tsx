'use client'

import { Tooltip } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { motion } from 'framer-motion'

dayjs.locale('zh-cn')

interface Activity {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface WeeklyActivityDotsProps {
  activities: Activity[]
  isLoading?: boolean
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

const LEVEL_COLORS = {
  0: 'bg-neutral-200 dark:bg-neutral-700',
  1: 'bg-green-200 dark:bg-green-900',
  2: 'bg-green-400 dark:bg-green-700',
  3: 'bg-green-500 dark:bg-green-500',
  4: 'bg-green-600 dark:bg-green-400',
}

export function WeeklyActivityDots({ activities, isLoading }: WeeklyActivityDotsProps) {
  // Get current week dates (Mon-Sun)
  const today = dayjs()
  const startOfWeek = today.startOf('week').add(1, 'day') // Monday

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = startOfWeek.add(i, 'day')
    return {
      date: date.format('YYYY-MM-DD'),
      dayOfWeek: i,
      isToday: date.isSame(today, 'day'),
      isFuture: date.isAfter(today, 'day'),
      formatted: date.format('YYYY年M月D日 周') + WEEKDAYS[i],
    }
  })

  // Map activities to week dates
  const activityMap = new Map(activities.map((a) => [a.date, a]))

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {weekDates.map((day, index) => {
        const activity = activityMap.get(day.date)
        const level = activity?.level ?? 0
        const count = activity?.count ?? 0

        return (
          <Tooltip
            key={day.date}
            title={
              <div className="text-center">
                <div className="text-xs">{day.formatted}</div>
                <div className="text-sm font-medium">
                  {day.isFuture ? '-' : count > 0 ? `${count} 次回答` : '无记录'}
                </div>
              </div>
            }
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
              className={`
                w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-125
                ${day.isFuture ? 'bg-neutral-100 dark:bg-neutral-800 opacity-50' : LEVEL_COLORS[level]}
                ${day.isToday ? 'ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-neutral-900' : ''}
              `}
            />
          </Tooltip>
        )
      })}
    </div>
  )
}
