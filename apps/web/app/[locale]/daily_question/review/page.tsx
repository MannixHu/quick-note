'use client'

import { GrowthComparison } from '@/components/review/GrowthComparison'
import { StatsOverview } from '@/components/review/StatsOverview'
import { TagDistributionChart } from '@/components/review/TagDistributionChart'
import { FadeIn, PageTransition, SlideUp } from '@/components/ui'
import { useAuth } from '@/hooks'
import { Link, useRouter } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import { ArrowLeftOutlined, CalendarOutlined, RiseOutlined, StarOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Segmented, Spin, Typography } from 'antd'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const { Text, Paragraph } = Typography

interface HighRatedQuestion {
  id: string
  question: string
  answer: string
  rating: number
  date: Date
  category: string | null
}

interface AnswerItem {
  id: string
  question: string
  questionId: string
  answer: string
  date: Date
  rating: number | null
  category: string | null
}

export default function ReviewPage() {
  const router = useRouter()
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/daily_question/review')
    }
  }, [authLoading, isAuthenticated, router])

  // @ts-expect-error - tRPC v11 RC type compatibility
  const reviewStatsQuery = trpc.dailyQuestion.getReviewStats.useQuery(
    { userId: userId ?? '', period },
    { retry: 2, enabled: !!userId }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const streakStatsQuery = trpc.dailyQuestion.getStreakStats.useQuery(
    { userId: userId ?? '' },
    { retry: 2, enabled: !!userId }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const growthComparisonQuery = trpc.dailyQuestion.getGrowthComparison.useQuery(
    { userId: userId ?? '', limit: 5 },
    { retry: 2, enabled: !!userId }
  )

  // Show loading only while checking auth
  if (authLoading) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      </PageTransition>
    )
  }

  // If not authenticated after loading, the useEffect will redirect
  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center">
          <Spin size="large" tip="正在跳转登录..." />
        </div>
      </PageTransition>
    )
  }

  const stats = reviewStatsQuery.data
  const streakStats = streakStatsQuery.data
  const growthData = growthComparisonQuery.data

  return (
    <PageTransition>
      <main className="relative min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        {/* Animated background orbs */}
        <motion.div
          className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-green-500/10 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />

        {/* Header */}
        <FadeIn delay={0.1}>
          <header className="relative z-10 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center gap-3">
                <Link href="/daily_question">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    className="!text-gray-600 dark:!text-gray-400"
                  >
                    返回
                  </Button>
                </Link>
                <span className="text-lg md:text-xl font-semibold">回顾与成长</span>
              </div>
              <Segmented
                value={period}
                onChange={(v) => setPeriod(v as 'week' | 'month')}
                options={[
                  { label: '本周', value: 'week' },
                  { label: '本月', value: 'month' },
                ]}
              />
            </div>
          </header>
        </FadeIn>

        <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-8 flex flex-col gap-6">
          {/* Stats Overview */}
          <SlideUp delay={0.2}>
            <StatsOverview
              totalAnswers={stats?.totalAnswers ?? 0}
              answeredDays={stats?.answeredDays ?? 0}
              currentStreak={streakStats?.currentStreak ?? 0}
              avgAnswersPerDay={stats?.avgAnswersPerDay ?? 0}
              isLoading={reviewStatsQuery.isLoading || streakStatsQuery.isLoading}
            />
          </SlideUp>

          {/* Tag Distribution */}
          <SlideUp delay={0.3}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-primary-500" />
                  <span>话题分布</span>
                </div>
              }
              className="glass !rounded-xl md:!rounded-2xl"
            >
              <TagDistributionChart
                data={stats?.tagDistribution ?? []}
                isLoading={reviewStatsQuery.isLoading}
              />
            </Card>
          </SlideUp>

          {/* High-Rated Questions */}
          <SlideUp delay={0.4}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <StarOutlined className="text-orange-500" />
                  <span>高分问题回顾</span>
                  <Text type="secondary" className="text-sm font-normal">
                    (4-5星)
                  </Text>
                </div>
              }
              className="glass !rounded-xl md:!rounded-2xl"
              styles={{ body: { maxHeight: 400, overflowY: 'auto' } }}
            >
              {reviewStatsQuery.isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
                    <div key={`skeleton-${i}`}>
                      <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                      <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : !stats?.highRatedQuestions || stats.highRatedQuestions.length === 0 ? (
                <Empty description="暂无高分问题，继续回答并评分吧" />
              ) : (
                <div className="space-y-4">
                  {(stats.highRatedQuestions as HighRatedQuestion[]).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Text type="secondary" className="text-xs">
                          {dayjs(item.date).format('YYYY-MM-DD')}
                        </Text>
                        <div className="flex items-center gap-1">
                          {[...Array(item.rating)].map((_, i) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: static star rating
                            <span key={`star-${i}`} className="text-orange-400 text-xs">
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <Text className="text-sm text-neutral-600 dark:text-neutral-400 block mb-2">
                        Q: {item.question}
                      </Text>
                      <Paragraph className="!mb-0 text-sm" ellipsis={{ rows: 2, expandable: true }}>
                        {item.answer}
                      </Paragraph>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </SlideUp>

          {/* Growth Comparison */}
          <SlideUp delay={0.5}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <RiseOutlined className="text-green-500" />
                  <span>成长轨迹</span>
                  <Text type="secondary" className="text-sm font-normal">
                    同类问题的思考演变
                  </Text>
                </div>
              }
              className="glass !rounded-xl md:!rounded-2xl"
            >
              <GrowthComparison
                comparisons={growthData?.comparisons ?? []}
                isLoading={growthComparisonQuery.isLoading}
              />
            </Card>
          </SlideUp>

          {/* Recent Answers */}
          <SlideUp delay={0.6}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-blue-500" />
                  <span>{period === 'week' ? '本周' : '本月'}回答</span>
                </div>
              }
              className="glass !rounded-xl md:!rounded-2xl"
              styles={{ body: { maxHeight: 500, overflowY: 'auto' } }}
            >
              {reviewStatsQuery.isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded"
                    />
                  ))}
                </div>
              ) : !stats?.answers || stats.answers.length === 0 ? (
                <Empty description={`${period === 'week' ? '本周' : '本月'}还没有回答`} />
              ) : (
                <div className="space-y-3">
                  {(stats.answers as AnswerItem[]).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Text type="secondary" className="text-xs">
                          {dayjs(item.date).format('YYYY-MM-DD HH:mm')}
                        </Text>
                        {item.rating && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(item.rating)].map((_, i) => (
                              // biome-ignore lint/suspicious/noArrayIndexKey: static star rating
                              <span key={`star-${i}`} className="text-orange-400 text-xs">
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Text className="text-sm text-neutral-500 dark:text-neutral-400 block mb-1">
                        {item.question}
                      </Text>
                      <Paragraph className="!mb-0" ellipsis={{ rows: 2, expandable: true }}>
                        {item.answer}
                      </Paragraph>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </SlideUp>
        </div>
      </main>
    </PageTransition>
  )
}
