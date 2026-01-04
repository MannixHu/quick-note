import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * Format date to string
 */
export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format)
}

/**
 * Format date to datetime string
 */
export function formatDateTime(date: Date | string | number) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date | string | number) {
  return dayjs(date).fromNow()
}

export { dayjs }
