'use client'

import { Card, Empty, Segmented, Spin, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { useLocale } from 'next-intl'
import { useEffect, useRef } from 'react'
import { type Activity, ActivityCalendar } from 'react-activity-calendar'

interface YearlyHeatmapProps {
  activities: Activity[]
  year: number
  totalActivities: number
  activeDays: number
  isLoading?: boolean
  onYearChange?: (year: number) => void
  /** 有数据的年份列表，用于控制年份切换器显示 */
  availableYears?: number[]
}

const LABELS_ZH = {
  months: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ],
  weekdays: ['日', '一', '二', '三', '四', '五', '六'],
  totalCount: '{{year}} 年共 {{count}} 次活动',
  legend: { less: ' ', more: ' ' },
}

const LABELS_EN = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  totalCount: '{{count}} activities in {{year}}',
  legend: { less: ' ', more: ' ' },
}

export function YearlyHeatmap({
  activities,
  year,
  totalActivities,
  activeDays,
  isLoading,
  onYearChange,
  availableYears,
}: YearlyHeatmapProps) {
  const locale = useLocale()
  const isZh = locale === 'zh-CN'
  const labels = isZh ? LABELS_ZH : LABELS_EN
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const currentYear = dayjs().year()

  // 计算应该显示的年份
  // 只有明确提供 availableYears 时才显示年份切换器
  // 否则依赖自动切换逻辑（当前年无数据时自动切换到上一年）
  let years: number[] = []
  if (availableYears && availableYears.length > 0) {
    years = availableYears
  }

  // 只有明确提供多个年份时才显示切换器
  const showYearSelector = years.length > 1 && onYearChange

  // Fill in missing dates with 0 count for a complete year view
  const filledActivities = fillYearActivities(activities, year)

  // Auto-scroll to current month (center it with ±1 month visible)
  useEffect(() => {
    if (year === currentYear && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollElement = container.querySelector(
        '.react-activity-calendar__scroll-container'
      ) as HTMLElement
      if (scrollElement) {
        // Calculate scroll position to center current month
        // Each month is roughly 1/12 of the total width
        const currentMonth = dayjs().month() // 0-11
        const totalWidth = scrollElement.scrollWidth
        // Scroll to position current month in the center (show month-1 to month+1)
        const monthWidth = totalWidth / 12
        const targetScroll = Math.max(0, (currentMonth - 1) * monthWidth)
        scrollElement.scrollLeft = targetScroll
      }
    }
  }, [year, currentYear])

  if (isLoading) {
    return (
      <Card className="glass !rounded-xl">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </Card>
    )
  }

  const statsText = isZh
    ? `${activeDays} 天 · ${totalActivities} 次回答`
    : `${activeDays} day${activeDays !== 1 ? 's' : ''} · ${totalActivities} answer${totalActivities !== 1 ? 's' : ''}`

  const emptyText = isZh ? '暂无活动记录' : 'No activity yet'
  const titleText = isZh ? '活动热力图' : 'Activity Heatmap'

  return (
    <Card
      className="glass !rounded-xl"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium">{titleText}</span>
            <span className="text-sm text-neutral-500">{statsText}</span>
          </div>
          {showYearSelector && (
            <Segmented
              size="small"
              value={year}
              onChange={(v) => onYearChange(v as number)}
              options={years.map((y) => ({ label: `${y}`, value: y }))}
            />
          )}
        </div>
      }
    >
      {activities.length === 0 ? (
        <Empty description={emptyText} />
      ) : (
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto pb-2 flex justify-center [&_.react-activity-calendar\_\_scroll-container]:mb-4"
        >
          <ActivityCalendar
            data={filledActivities}
            weekStart={1}
            showTotalCount={false}
            theme={{
              light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
              dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
            }}
            labels={labels}
            renderBlock={(block, activity) => {
              const date = dayjs(activity.date)
              const weekdayIndex = date.day()
              const weekday = isZh
                ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][weekdayIndex]
                : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weekdayIndex]
              const tooltipText = isZh
                ? `${activity.date} ${weekday} ${activity.count} 次回答`
                : `${activity.date} ${weekday} ${activity.count} answer${activity.count !== 1 ? 's' : ''}`

              return <Tooltip title={tooltipText}>{block}</Tooltip>
            }}
            renderColorLegend={(block, level) => {
              const levelText = isZh
                ? ['0 次', '1-2 次', '3-4 次', '5-6 次', '7+ 次'][level]
                : ['0', '1-2', '3-4', '5-6', '7+'][level]
              return <Tooltip title={levelText}>{block}</Tooltip>
            }}
          />
        </div>
      )}
    </Card>
  )
}

// Fill year with all dates, including days with 0 activity
// Always fill full year to enable scrolling
function fillYearActivities(activities: Activity[], year: number): Activity[] {
  const activityMap = new Map(activities.map((a) => [a.date, a]))
  const filled: Activity[] = []

  const startDate = dayjs(`${year}-01-01`)
  const endDate = dayjs(`${year}-12-31`)

  let current = startDate
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD')
    const existing = activityMap.get(dateStr)
    filled.push(
      existing || {
        date: dateStr,
        count: 0,
        level: 0,
      }
    )
    current = current.add(1, 'day')
  }

  return filled
}
