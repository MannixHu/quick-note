'use client'

import { StarRating } from '@/components/star-rating'
import { useAuth } from '@/hooks'
import { trpc } from '@/lib/trpc/client'
import { App, Button, Input, Typography } from 'antd'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

const { Text, Paragraph } = Typography

export interface AnswerCardItem {
  id: string
  date: string | Date
  question: string
  questionId?: string
  answer: string
  rating?: number | null
  category?: string | null
}

export interface AnswerCardProps {
  item: AnswerCardItem
  index?: number
  /** 是否允许编辑回答 */
  editable?: boolean
  /** 是否允许交互式评分（有 questionId 时自动启用） */
  ratingEditable?: boolean
  /** 评分变更后的额外回调 */
  onRatingChange?: (item: AnswerCardItem, rating: number) => void
  /** 回答编辑保存回调 */
  onAnswerSave?: (item: AnswerCardItem, newAnswer: string) => void
  /** 卡片样式变体 */
  variant?: 'default' | 'bordered' | 'filled'
  /** 回答显示行数限制 */
  answerRows?: number
  /** 是否显示问题前缀 "Q:" */
  showQuestionPrefix?: boolean
  /** 动画延迟基数 */
  animationDelay?: number
}

/**
 * 共用的回答卡片组件
 * 用于历史回答、高分问题回顾、本周回答等场景
 * 内置评分功能，只要有 questionId 就可以评分
 */
export function AnswerCard({
  item,
  index = 0,
  editable = false,
  ratingEditable = true,
  onRatingChange,
  onAnswerSave,
  variant = 'default',
  answerRows = 2,
  showQuestionPrefix = false,
  animationDelay = 0.05,
}: AnswerCardProps) {
  const { message } = App.useApp()
  const { userId } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [localRating, setLocalRating] = useState<number | null | undefined>(item.rating)

  // 同步外部 rating 变化到本地状态
  useEffect(() => {
    setLocalRating(item.rating)
  }, [item.rating])

  // @ts-expect-error - tRPC v11 RC type compatibility
  const rateMutation = trpc.dailyQuestion.rateQuestion.useMutation()

  // 格式化日期（包含时分）
  const formattedDate =
    typeof item.date === 'string' ? item.date : dayjs(item.date).format('YYYY-MM-DD HH:mm')

  // 处理评分变更
  const handleRatingChange = useCallback(
    (rating: number) => {
      if (!userId || !item.questionId) return

      const previousRating = localRating
      setLocalRating(rating) // 乐观更新

      rateMutation.mutate(
        { userId, questionId: item.questionId, rating },
        {
          onSuccess: () => {
            message.success('评分已保存')
            onRatingChange?.(item, rating)
          },
          onError: (error: unknown) => {
            console.error('Rating failed:', error)
            message.error('评分失败')
            setLocalRating(previousRating) // 回滚
          },
        }
      )
    },
    [userId, item, localRating, rateMutation, message, onRatingChange]
  )

  // 开始编辑
  const handleStartEdit = useCallback(() => {
    if (!editable) return
    setEditValue(item.answer)
    setIsEditing(true)
  }, [editable, item.answer])

  // 保存编辑
  const handleSaveEdit = useCallback(() => {
    if (!editValue.trim()) return
    onAnswerSave?.(item, editValue.trim())
    setIsEditing(false)
    setEditValue('')
  }, [item, editValue, onAnswerSave])

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditValue('')
  }, [])

  // 样式变体
  const variantClasses = {
    default: 'border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0',
    bordered:
      'p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
    filled: 'p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg',
  }

  // 当前显示的评分（优先使用本地状态）
  const displayRating = localRating ?? item.rating ?? 0

  // 渲染评分
  const renderRating = () => {
    // 可编辑评分：有 questionId 且启用了 ratingEditable
    if (ratingEditable && item.questionId && userId) {
      return (
        <StarRating
          value={displayRating}
          onChange={handleRatingChange}
          size="small"
          disabled={rateMutation.isPending}
        />
      )
    }

    // 只读评分显示
    if (displayRating > 0) {
      return (
        <div className="flex items-center gap-0.5">
          {[...Array(displayRating)].map((_, i) => (
            <span key={`star-${item.id}-${i}`} className="text-orange-400 text-xs">
              ★
            </span>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: variant === 'filled' ? 0 : -10, y: variant === 'filled' ? 10 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, delay: index * animationDelay }}
      className={variantClasses[variant]}
    >
      {/* 日期和评分 */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <Text type="secondary" className="text-xs">
          {formattedDate}
        </Text>
        {renderRating()}
      </div>

      {/* 问题 */}
      <Text
        strong={!showQuestionPrefix}
        className={`text-sm block mb-1.5 ${
          showQuestionPrefix ? 'text-neutral-600 dark:text-neutral-400' : ''
        }`}
      >
        {showQuestionPrefix ? `Q: ${item.question}` : item.question}
      </Text>

      {/* 回答 - 编辑模式 */}
      {isEditing ? (
        <div className="space-y-2">
          <Input.TextArea
            rows={2}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="resize-none text-sm"
            autoFocus
            variant="borderless"
          />
          <div className="flex gap-2">
            <Button size="small" onClick={handleSaveEdit}>
              保存
            </Button>
            <Button size="small" type="text" onClick={handleCancelEdit}>
              取消
            </Button>
          </div>
        </div>
      ) : editable ? (
        /* 回答 - 可编辑（点击编辑） */
        <motion.button
          type="button"
          className="text-sm cursor-pointer text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left bg-transparent border-0 p-0 w-full"
          onClick={handleStartEdit}
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {item.answer}
        </motion.button>
      ) : (
        /* 回答 - 只读（可折叠） */
        <Paragraph className="!mb-0 text-sm" ellipsis={{ rows: answerRows, expandable: true }}>
          {item.answer}
        </Paragraph>
      )}
    </motion.div>
  )
}

export default AnswerCard
