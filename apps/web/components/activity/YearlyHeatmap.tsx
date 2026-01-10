'use client'

import { Card, Empty, Segmented, Spin } from 'antd'
import dayjs from 'dayjs'
import ActivityCalendar, { type Activity } from 'react-activity-calendar'

interface YearlyHeatmapProps {
  activities: Activity[]
  year: number
  totalActivities: number
  activeDays: number
  isLoading?: boolean
  onYearChange?: (year: number) => void
}

export function YearlyHeatmap({
  activities,
  year,
  totalActivities,
  activeDays,
  isLoading,
  onYearChange,
}: YearlyHeatmapProps) {
  const currentYear = dayjs().year()
  const years = [currentYear - 1, currentYear]

  // Fill in missing dates with 0 count for a complete year view
  const filledActivities = fillYearActivities(activities, year)

  if (isLoading) {
    return (
      <Card className="glass !rounded-xl">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </Card>
    )
  }

  return (
    <Card
      className="glass !rounded-xl"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium">活动热力图</span>
            <span className="text-sm text-neutral-500">
              {activeDays} 天 · {totalActivities} 次回答
            </span>
          </div>
          {onYearChange && (
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
        <Empty description="暂无活动记录" />
      ) : (
        <div className="overflow-x-auto pb-2">
          <ActivityCalendar
            data={filledActivities}
            theme={{
              light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
              dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
            }}
            labels={{
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
              legend: {
                less: '较少',
                more: '较多',
              },
            }}
            showWeekdayLabels
            renderBlock={(block, activity) => (
              <g title={`${activity.date}: ${activity.count} 次回答`}>{block}</g>
            )}
          />
        </div>
      )}
    </Card>
  )
}

// Fill year with all dates, including days with 0 activity
function fillYearActivities(activities: Activity[], year: number): Activity[] {
  const activityMap = new Map(activities.map((a) => [a.date, a]))
  const filled: Activity[] = []

  const startDate = dayjs(`${year}-01-01`)
  const endDate = dayjs().year() === year ? dayjs() : dayjs(`${year}-12-31`)

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
