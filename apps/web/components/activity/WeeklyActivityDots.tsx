'use client'

import { Tooltip } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import isoWeek from 'dayjs/plugin/isoWeek'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

dayjs.extend(isoWeek)

interface Activity {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface WeeklyActivityDotsProps {
  activities: Activity[]
  isLoading?: boolean
  showLabels?: boolean
}

const WEEKDAYS_ZH = ['一', '二', '三', '四', '五', '六', '日']
const WEEKDAYS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Match YearlyHeatmap colors
// light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
// dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
const LEVEL_COLORS = {
  0: 'bg-[#ebedf0] dark:bg-[#161b22]',
  1: 'bg-[#9be9a8] dark:bg-[#0e4429]',
  2: 'bg-[#40c463] dark:bg-[#006d32]',
  3: 'bg-[#30a14e] dark:bg-[#26a641]',
  4: 'bg-[#216e39] dark:bg-[#39d353]',
}

export function WeeklyActivityDots({
  activities,
  isLoading,
  showLabels = true,
}: WeeklyActivityDotsProps) {
  const locale = useLocale()
  const isZh = locale === 'zh-CN'
  const WEEKDAYS = isZh ? WEEKDAYS_ZH : WEEKDAYS_EN

  // Set dayjs locale
  dayjs.locale(isZh ? 'zh-cn' : 'en')

  // Get current week dates (Mon-Sun) using ISO week (always starts on Monday)
  const today = dayjs()
  const startOfWeek = today.startOf('isoWeek') // Monday

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = startOfWeek.add(i, 'day')
    return {
      date: date.format('YYYY-MM-DD'),
      dayOfWeek: i,
      isToday: date.isSame(today, 'day'),
      isFuture: date.isAfter(today, 'day'),
      formatted: isZh
        ? date.format('YYYY年M月D日 周') + WEEKDAYS_ZH[i]
        : date.format('dddd, MMMM D, YYYY'),
    }
  })

  // Map activities to week dates
  const activityMap = new Map(activities.map((a) => [a.date, a]))

  const getTooltipContent = (day: (typeof weekDates)[0], count: number) => {
    if (day.isFuture) return '-'
    if (count > 0) return isZh ? `${count} 次回答` : `${count} answer${count > 1 ? 's' : ''}`
    return isZh ? '无记录' : 'No activity'
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        {[...Array(7)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton items
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            {showLabels && (
              <div className="w-3 h-2 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded" />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
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
                <div className="text-sm font-medium">{getTooltipContent(day, count)}</div>
              </div>
            }
          >
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
                className={`
                  w-5 h-5 rounded-md cursor-pointer transition-all hover:scale-110 hover:shadow-md
                  ${day.isFuture ? 'bg-neutral-100 dark:bg-neutral-800/50' : LEVEL_COLORS[level]}
                  ${day.isToday ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-neutral-900' : ''}
                `}
              />
              {showLabels && (
                <span
                  className={`text-[10px] font-medium ${day.isToday ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'}`}
                >
                  {WEEKDAYS[index]}
                </span>
              )}
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}
