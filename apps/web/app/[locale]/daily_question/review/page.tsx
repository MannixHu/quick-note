'use client'

import { YearlyHeatmap } from '@/components/activity'
import { AnswerCard, type AnswerCardItem } from '@/components/daily-question/AnswerCard'
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
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

const { Text } = Typography

interface HighRatedQuestion {
  id: string
  questionId: string
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
  const locale = useLocale()
  const isZh = locale === 'zh-CN'
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const currentYear = dayjs().year()
  const [activityYear, setActivityYear] = useState(currentYear)

  // i18n texts
  const t = {
    back: isZh ? '返回' : 'Back',
    title: isZh ? '回顾与成长' : 'Review & Growth',
    week: isZh ? '本周' : 'Week',
    month: isZh ? '本月' : 'Month',
    redirecting: isZh ? '正在跳转登录...' : 'Redirecting to login...',
    topicDistribution: isZh ? '话题分布' : 'Topic Distribution',
    highRatedQuestions: isZh ? '高分问题回顾' : 'Top Rated Questions',
    ratingLabel: '(4-5★)',
    noHighRated: isZh
      ? '暂无高分问题，继续回答并评分吧'
      : 'No highly rated questions yet. Keep answering!',
    growthTrack: isZh ? '成长轨迹' : 'Growth Track',
    growthSubtitle: isZh ? '同类问题的思考演变' : 'How your thinking evolved',
    periodAnswers: (p: string) => (isZh ? `${p}回答` : `${p} Answers`),
    noAnswers: (p: string) => (isZh ? `${p}还没有回答` : `No answers ${p.toLowerCase()} yet`),
  }

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

  // @ts-expect-error - tRPC v11 RC type compatibility
  const activityQuery = trpc.dailyQuestion.getActivityData.useQuery(
    { userId: userId ?? '', year: activityYear },
    { retry: 2, enabled: !!userId }
  )

  // 如果当前年份没有数据，自动切换到去年
  useEffect(() => {
    if (
      activityQuery.data &&
      activityYear === currentYear &&
      activityQuery.data.totalActivities === 0
    ) {
      setActivityYear(currentYear - 1)
    }
  }, [activityQuery.data, activityYear, currentYear])

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
          <Spin size="large" tip={t.redirecting} />
        </div>
      </PageTransition>
    )
  }

  const periodText = period === 'week' ? t.week : t.month

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
                    {t.back}
                  </Button>
                </Link>
                <span className="text-lg md:text-xl font-semibold">{t.title}</span>
              </div>
              <Segmented
                value={period}
                onChange={(v) => setPeriod(v as 'week' | 'month')}
                options={[
                  { label: t.week, value: 'week' },
                  { label: t.month, value: 'month' },
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

          {/* Activity Heatmap & Tag Distribution - Side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Yearly Activity Heatmap */}
            <SlideUp delay={0.25}>
              <YearlyHeatmap
                activities={activityQuery.data?.activities ?? []}
                year={activityYear}
                totalActivities={activityQuery.data?.totalActivities ?? 0}
                activeDays={activityQuery.data?.activeDays ?? 0}
                isLoading={activityQuery.isLoading}
                onYearChange={setActivityYear}
              />
            </SlideUp>

            {/* Tag Distribution */}
            <SlideUp delay={0.3}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-primary-500" />
                    <span>{t.topicDistribution}</span>
                  </div>
                }
                className="glass !rounded-xl md:!rounded-2xl h-full"
              >
                <TagDistributionChart
                  data={stats?.tagDistribution ?? []}
                  isLoading={reviewStatsQuery.isLoading}
                />
              </Card>
            </SlideUp>
          </div>

          {/* High-Rated Questions */}
          <SlideUp delay={0.4}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <StarOutlined className="text-orange-500" />
                  <span>{t.highRatedQuestions}</span>
                  <Text type="secondary" className="text-sm font-normal">
                    {t.ratingLabel}
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
                <Empty description={t.noHighRated} />
              ) : (
                <div className="space-y-4">
                  {(stats.highRatedQuestions as HighRatedQuestion[]).map((item, index) => (
                    <AnswerCard
                      key={item.id}
                      item={
                        {
                          id: item.id,
                          questionId: item.questionId,
                          date: item.date,
                          question: item.question,
                          answer: item.answer,
                          rating: item.rating,
                          category: item.category,
                        } as AnswerCardItem
                      }
                      index={index}
                      variant="filled"
                      showQuestionPrefix
                      onRatingChange={() => reviewStatsQuery.refetch()}
                    />
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
                  <span>{t.growthTrack}</span>
                  <Text type="secondary" className="text-sm font-normal">
                    {t.growthSubtitle}
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
                  <span>{t.periodAnswers(periodText)}</span>
                </div>
              }
              className="glass !rounded-xl md:!rounded-2xl"
              styles={{ body: { maxHeight: 500, overflowY: 'auto' } }}
            >
              {reviewStatsQuery.isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton items
                    <div
                      key={`skeleton-${i}`}
                      className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded"
                    />
                  ))}
                </div>
              ) : !stats?.answers || stats.answers.length === 0 ? (
                <Empty description={t.noAnswers(periodText)} />
              ) : (
                <div className="space-y-3">
                  {(stats.answers as AnswerItem[]).map((item, index) => (
                    <AnswerCard
                      key={item.id}
                      item={
                        {
                          id: item.id,
                          date: item.date,
                          question: item.question,
                          questionId: item.questionId,
                          answer: item.answer,
                          rating: item.rating,
                          category: item.category,
                        } as AnswerCardItem
                      }
                      index={index}
                      variant="bordered"
                      animationDelay={0.03}
                      onRatingChange={() => reviewStatsQuery.refetch()}
                    />
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
