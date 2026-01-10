'use client'

import { CalendarOutlined, SwapOutlined } from '@ant-design/icons'
import { Collapse, Empty, Typography } from 'antd'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

const { Text, Paragraph } = Typography

interface Answer {
  question?: string
  answer?: string
  date?: Date
}

interface Comparison {
  category: string
  totalAnswers: number
  firstAnswer: Answer
  latestAnswer: Answer
  allAnswers: Answer[]
}

interface GrowthComparisonProps {
  comparisons: Comparison[]
  isLoading?: boolean
}

// Category label mapping
const CATEGORY_LABELS_ZH: Record<string, string> = {
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

const CATEGORY_LABELS_EN: Record<string, string> = {
  reflection: 'Reflection',
  planning: 'Planning',
  gratitude: 'Gratitude',
  growth: 'Growth',
  relationships: 'Relationships',
  values: 'Values',
  logic: 'Logic',
  philosophy: 'Philosophy',
  science: 'Science',
  abstract: 'Abstract',
  systems: 'Systems',
  creativity: 'Creativity',
  knowledge: 'Knowledge',
  self: 'Self',
  future: 'Future',
  thought_experiment: 'Thought Exp.',
  decision: 'Decision',
  curiosity: 'Curiosity',
  psychology: 'Psychology',
  mathematics: 'Mathematics',
  ethics: 'Ethics',
  language: 'Language',
  consciousness: 'Consciousness',
  history: 'History',
  paradox: 'Paradox',
  metacognition: 'Metacognition',
  problem_solving: 'Problem Solving',
  information: 'Information',
  complexity: 'Complexity',
  analogy: 'Analogy',
  existence: 'Existence',
  innovation: 'Innovation',
  unknown: 'Other',
}

interface AnswerCardProps {
  answer: Answer
  label: string
  unknownDateText: string
  unknownQuestionText: string
  noAnswerText: string
  expandText: string
}

const AnswerCard = ({
  answer,
  label,
  unknownDateText,
  unknownQuestionText,
  noAnswerText,
  expandText,
}: AnswerCardProps) => (
  <div className="flex-1 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <CalendarOutlined className="text-neutral-400 text-xs" />
      <Text type="secondary" className="text-xs">
        {label} · {answer.date ? dayjs(answer.date).format('YYYY-MM-DD') : unknownDateText}
      </Text>
    </div>
    <Text className="text-sm text-neutral-600 dark:text-neutral-400 block mb-2 line-clamp-2">
      Q: {answer.question || unknownQuestionText}
    </Text>
    <Paragraph
      className="!mb-0 text-sm"
      ellipsis={{ rows: 3, expandable: true, symbol: expandText }}
    >
      {answer.answer || noAnswerText}
    </Paragraph>
  </div>
)

export function GrowthComparison({ comparisons, isLoading }: GrowthComparisonProps) {
  const locale = useLocale()
  const isZh = locale === 'zh-CN'
  const CATEGORY_LABELS = isZh ? CATEGORY_LABELS_ZH : CATEGORY_LABELS_EN

  // i18n texts
  const texts = {
    unknownDate: isZh ? '未知' : 'Unknown',
    unknownQuestion: isZh ? '未知问题' : 'Unknown question',
    noAnswer: isZh ? '无回答' : 'No answer',
    expand: isZh ? '展开' : 'More',
    firstAnswer: isZh ? '最早回答' : 'First answer',
    latestAnswer: isZh ? '最近回答' : 'Latest answer',
    answersCount: (count: number) =>
      isZh ? `${count} 次回答` : `${count} answer${count !== 1 ? 's' : ''}`,
    allAnswers: (count: number) => (isZh ? `全部 ${count} 次回答` : `All ${count} answers`),
    emptyDescription: isZh
      ? '需要在同一类别有多次回答才能进行对比'
      : 'Need multiple answers in the same category to compare',
  }
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
          <div key={`skeleton-${i}`} className="animate-pulse">
            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
            <div className="flex gap-4">
              <div className="flex-1 h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
              <div className="flex-1 h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!comparisons || comparisons.length === 0) {
    return <Empty description={texts.emptyDescription} />
  }

  const items = comparisons.map((comparison) => ({
    key: comparison.category,
    label: (
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {CATEGORY_LABELS[comparison.category] || comparison.category}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {texts.answersCount(comparison.totalAnswers)}
        </span>
      </div>
    ),
    children: (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* First vs Latest Comparison */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <AnswerCard
            answer={comparison.firstAnswer}
            label={texts.firstAnswer}
            unknownDateText={texts.unknownDate}
            unknownQuestionText={texts.unknownQuestion}
            noAnswerText={texts.noAnswer}
            expandText={texts.expand}
          />
          <div className="hidden md:flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <SwapOutlined className="text-primary-500" />
            </div>
          </div>
          <AnswerCard
            answer={comparison.latestAnswer}
            label={texts.latestAnswer}
            unknownDateText={texts.unknownDate}
            unknownQuestionText={texts.unknownQuestion}
            noAnswerText={texts.noAnswer}
            expandText={texts.expand}
          />
        </div>

        {/* Timeline of all answers (if more than 2) */}
        {comparison.allAnswers.length > 2 && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Text type="secondary" className="text-xs mb-2 block">
              {texts.allAnswers(comparison.allAnswers.length)}
            </Text>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comparison.allAnswers.map((ans, i) => (
                <div
                  key={`answer-${i}`}
                  className="flex items-start gap-2 text-sm py-1 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                >
                  <Text type="secondary" className="text-xs whitespace-nowrap">
                    {ans.date ? dayjs(ans.date).format('MM-DD') : '--'}
                  </Text>
                  <Text className="text-neutral-600 dark:text-neutral-400 line-clamp-1 flex-1">
                    {ans.answer}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    ),
  }))

  return (
    <Collapse
      items={items}
      defaultActiveKey={comparisons[0]?.category ? [comparisons[0].category] : []}
      className="bg-transparent border-0"
      expandIconPosition="end"
    />
  )
}
