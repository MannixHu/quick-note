'use client'

import { DashboardPanel } from '@/components/daily-question/DashboardPanel'
import { LanguageSwitcher } from '@/components/language-switcher'
import { StarRating } from '@/components/star-rating'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button, FadeIn, PageTransition, SlideUp } from '@/components/ui'
import { useAuth } from '@/hooks'
import { useRouter } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import {
  Button as AntButton,
  App,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

dayjs.extend(dayOfYear)

const { Text, Paragraph } = Typography
const { TextArea } = Input

const SAMPLE_QUESTIONS = [
  '今天最让你感到有成就感的事情是什么？',
  '如果今天可以重来，你会做什么不同的选择？',
  '最近学到的最重要的一课是什么？',
  '什么事情一直在消耗你的能量，但你还没有处理？',
  '你最近一次真正开心是什么时候？当时在做什么？',
]

// 用户可自定义的角色提示词（格式要求由后端固定）
const DEFAULT_AI_PROMPT = `你是一个专业的人生教练和心理咨询师。请生成深度思考问题，帮助用户进行自我反思和成长。

要求：
1. 问题要具有深度，能触发真正的思考
2. 问题要具体，不要太抽象
3. 问题要能帮助用户了解自己、规划未来或改善生活
4. 每个问题都应该是开放性的，没有标准答案
5. 问题应该用中文表达，贴近中国文化语境`

interface AnswerHistory {
  id: string
  date: string
  question: string
  questionId: string
  answer: string
  rating?: number // 用户评分 1-5
}

interface AIConfig {
  apiKey: string
  model?: string
  baseURL: string
  prompt?: string // 自定义生成问题的提示词
}

export default function DailyQuestionPage() {
  const { message } = App.useApp()
  const t = useTranslations('dailyQuestion')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/daily_question')
    }
  }, [authLoading, isAuthenticated, router])

  const todayIndex = dayjs().dayOfYear() % SAMPLE_QUESTIONS.length
  const fallbackQuestion =
    SAMPLE_QUESTIONS[todayIndex] ?? SAMPLE_QUESTIONS[0] ?? '今天最让你感到有成就感的事情是什么？'

  const [answer, setAnswer] = useState('')
  const [todayQuestion, setTodayQuestion] = useState<string>(fallbackQuestion)
  const [questionId, setQuestionId] = useState<string | null>(null)
  const [questionSource, setQuestionSource] = useState<'preference' | 'random'>('random')
  const [currentRating, setCurrentRating] = useState<number>(0)
  const [history, setHistory] = useState<AnswerHistory[]>([])
  const [isApiAvailable, setIsApiAvailable] = useState(true)
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null)
  const [editingHistoryAnswer, setEditingHistoryAnswer] = useState('')

  // AI Config
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null)
  const [settingsForm] = Form.useForm()
  const [pingResult, setPingResult] = useState<{
    success: boolean
    latency?: number
    error?: string
  } | null>(null)

  // Load AI config from localStorage (only set state, not form)
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig) as AIConfig
        // 检测并清理旧版本的 prompt（包含 JSON 格式要求或变量占位符）
        const hasOldFormat =
          !config.prompt ||
          config.prompt.includes('JSON 格式') ||
          config.prompt.includes('{{') ||
          config.prompt.includes('只返回 JSON')
        if (hasOldFormat) {
          config.prompt = DEFAULT_AI_PROMPT
          // 更新 localStorage 清理旧格式
          localStorage.setItem('ai-config', JSON.stringify(config))
        }
        setAiConfig(config)
      } catch {
        // ignore
      }
    }
  }, [])

  // Sync form values when drawer opens
  useEffect(() => {
    if (settingsOpen) {
      // Drawer 打开时才设置表单值，避免 Form 未挂载的警告
      if (aiConfig) {
        settingsForm.setFieldsValue(aiConfig)
      } else {
        settingsForm.setFieldsValue({ prompt: DEFAULT_AI_PROMPT })
      }
    }
  }, [settingsOpen, aiConfig, settingsForm])

  // tRPC queries - only run when authenticated
  // @ts-expect-error - tRPC v11 RC type compatibility
  const recommendedQuestionQuery = trpc.dailyQuestion.getRecommendedQuestion.useQuery(
    { userId: userId ?? '' },
    { retry: 2, enabled: !!userId }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const historyQuery = trpc.dailyQuestion.getAnswerHistory.useQuery(
    { userId: userId ?? '', limit: 30 },
    { retry: 2, enabled: !!userId }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const questionRatingQuery = trpc.dailyQuestion.getQuestionRating.useQuery(
    { userId: userId ?? '', questionId: questionId ?? '' },
    { enabled: !!userId && !!questionId }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const dashboardQuery = trpc.dailyQuestion.getDashboardSummary.useQuery(
    { userId: userId ?? '' },
    { retry: 2, enabled: !!userId }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const activityQuery = trpc.dailyQuestion.getActivityData.useQuery(
    { userId: userId ?? '' },
    { retry: 2, enabled: !!userId }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const userRatingsQuery = trpc.dailyQuestion.getUserRatings.useQuery(
    { userId: userId ?? '', limit: 100 },
    { retry: 2, enabled: !!userId }
  )

  // tRPC mutations
  // @ts-expect-error - tRPC v11 RC type compatibility
  const answerMutation = trpc.dailyQuestion.answerQuestionNew.useMutation()

  // @ts-expect-error - tRPC v11 RC type compatibility
  const rateMutation = trpc.dailyQuestion.rateQuestion.useMutation()

  // @ts-expect-error - tRPC v11 RC type compatibility
  const generateAIMutation = trpc.dailyQuestion.generateAIQuestions.useMutation()

  // @ts-expect-error - tRPC v11 RC type compatibility
  const pingAIMutation = trpc.dailyQuestion.pingAI.useMutation()

  // Handle mutation results
  // biome-ignore lint/correctness/useExhaustiveDependencies: message and getNextQuestion are stable refs
  useEffect(() => {
    if (answerMutation.data) {
      const data = answerMutation.data as {
        id: string
        date: Date
        questionId: string
        question: { question: string }
        answer: string
      }
      // Add to local history immediately using the returned data
      const newAnswer: AnswerHistory = {
        id: data.id,
        date: dayjs(data.date).format('YYYY-MM-DD HH:mm'),
        question: data.question.question,
        questionId: data.questionId,
        answer: data.answer,
        rating: currentRating || undefined,
      }
      setHistory((prev) => [newAnswer, ...prev])
      setAnswer('')
      message.success('回答已保存')
      // Get next question
      getNextQuestion()
    }
    if (answerMutation.error) {
      console.error('Answer mutation failed:', answerMutation.error)
      message.error('保存失败，请重试')
    }
  }, [answerMutation.data, answerMutation.error])

  // biome-ignore lint/correctness/useExhaustiveDependencies: message is a stable ref
  useEffect(() => {
    if (generateAIMutation.data) {
      const data = generateAIMutation.data as {
        count: number
        questions: Array<{
          id: string
          question: string
          category: string | null
          tag: string | null
        }>
        preferenceApplied?: boolean
        usedCategories?: string[]
      }
      // 生成成功后，将第一个问题设置为当前问题
      if (data.questions.length > 0) {
        const firstQuestion = data.questions[0]
        if (firstQuestion) {
          setTodayQuestion(firstQuestion.question)
          setQuestionId(firstQuestion.id)
          setQuestionSource(data.preferenceApplied ? 'preference' : 'random')
          setCurrentRating(0)
          // 根据是否应用偏好显示不同提示
          if (data.preferenceApplied && data.usedCategories?.length) {
            message.success(`已根据偏好生成 (${data.usedCategories.slice(0, 2).join('/')})`)
          } else {
            message.success('AI 问题已生成 (随机探索)')
          }
        }
      }
    }
    if (generateAIMutation.error) {
      const error = generateAIMutation.error as { message: string }
      message.error(`生成失败: ${error.message}`)
    }
  }, [generateAIMutation.data, generateAIMutation.error])

  // Sync API data to local state
  useEffect(() => {
    if (recommendedQuestionQuery.data) {
      const data = recommendedQuestionQuery.data as {
        question: {
          id: string
          question: string
          category: string | null
          tag: string | null
        } | null
        source: 'preference' | 'random'
      }
      if (data.question) {
        setTodayQuestion(data.question.question)
        setQuestionId(data.question.id)
        setQuestionSource(data.source)
        setCurrentRating(0) // Reset rating for new question
        setIsApiAvailable(true)
      }
    }
    if (recommendedQuestionQuery.error) {
      setIsApiAvailable(false)
    }
  }, [recommendedQuestionQuery.data, recommendedQuestionQuery.error])

  // Sync existing rating
  useEffect(() => {
    if (questionRatingQuery.data) {
      const data = questionRatingQuery.data as { rating: number } | null
      setCurrentRating(data?.rating ?? 0)
    }
  }, [questionRatingQuery.data])

  useEffect(() => {
    if (historyQuery.data) {
      const data = historyQuery.data as Array<{
        id: string
        date: Date
        questionId: string
        question: { question: string }
        answer: string
      }>

      // 获取评分映射
      const ratingsMap = new Map<string, number>()
      if (userRatingsQuery.data) {
        const ratings = userRatingsQuery.data as Array<{
          questionId: string
          rating: number
        }>
        for (const r of ratings) {
          ratingsMap.set(r.questionId, r.rating)
        }
      }

      const apiHistory = data.map((h) => ({
        id: h.id,
        date: dayjs(h.date).format('YYYY-MM-DD HH:mm'),
        question: h.question.question,
        questionId: h.questionId,
        answer: h.answer,
        rating: ratingsMap.get(h.questionId),
      }))
      // Merge with existing local history (avoid duplicates by id)
      setHistory((prev) => {
        // Keep local entries that aren't in API yet, plus all API entries
        const apiIds = new Set(apiHistory.map((h) => h.id))
        const localOnly = prev.filter((h) => !apiIds.has(h.id))
        return [...localOnly, ...apiHistory]
      })
    }
  }, [historyQuery.data, userRatingsQuery.data])

  const handleLocalSubmit = () => {
    if (!answer.trim()) {
      message.warning('请输入你的回答')
      return
    }

    const newAnswer: AnswerHistory = {
      id: `${Date.now()}`,
      date: dayjs().format('YYYY-MM-DD HH:mm'),
      question: todayQuestion,
      questionId: questionId ?? '',
      answer: answer.trim(),
      rating: currentRating || undefined,
    }
    setHistory([newAnswer, ...history])
    setAnswer('')
    // Get next question
    getNextQuestion()
    message.success('回答已保存')
  }

  // 处理历史记录中的评分变更
  const handleHistoryRatingChange = (item: AnswerHistory, rating: number) => {
    if (!userId || !item.questionId) return

    // 乐观更新本地状态
    setHistory((prev) => prev.map((h) => (h.id === item.id ? { ...h, rating } : h)))

    rateMutation.mutate(
      { userId, questionId: item.questionId, rating },
      {
        onSuccess: () => {
          message.success('评分已更新')
          userRatingsQuery.refetch()
        },
        onError: (error: unknown) => {
          console.error('Rating failed:', error)
          message.error('评分失败')
          // 回滚
          setHistory((prev) =>
            prev.map((h) => (h.id === item.id ? { ...h, rating: item.rating } : h))
          )
        },
      }
    )
  }

  const handleSubmit = () => {
    if (!answer.trim()) {
      message.warning('请输入你的回答')
      return
    }

    if (!questionId || !userId) {
      // Fallback to local submit
      handleLocalSubmit()
      return
    }

    answerMutation.mutate({
      userId,
      questionId,
      answer: answer.trim(),
    })
  }

  const getNextQuestion = () => {
    // Only fetch from API, let the useEffect handle the update
    // If API fails, the error handler will keep the current question
    setQuestionId(null)
    setCurrentRating(0)
    recommendedQuestionQuery.refetch()
  }

  const handleRatingChange = (rating: number) => {
    if (!userId || !questionId) {
      console.warn('Rating skipped: missing userId or questionId', { userId, questionId })
      return
    }
    setCurrentRating(rating)
    rateMutation.mutate(
      { userId, questionId, rating },
      {
        onSuccess: () => {
          message.success('评分已保存')
        },
        onError: (error: unknown) => {
          console.error('Rating failed:', error)
          message.error('评分保存失败')
          setCurrentRating(0)
        },
      }
    )
  }

  const handleSaveSettings = (values: AIConfig) => {
    setAiConfig(values)
    localStorage.setItem('ai-config', JSON.stringify(values))
    setSettingsOpen(false)
    setPingResult(null)
    message.success('AI 配置已保存')
  }

  const handlePingTest = () => {
    const formValues = settingsForm.getFieldsValue() as AIConfig
    if (!formValues.baseURL || !formValues.apiKey) {
      message.warning('请先填写 API 地址和 API Key')
      return
    }
    setPingResult(null)
    pingAIMutation.mutate(
      { aiConfig: formValues },
      {
        onSuccess: (data: unknown) => {
          const result = data as { success: boolean; latency?: number; error?: string }
          setPingResult(result)
        },
        onError: (error: unknown) => {
          setPingResult({ success: false, error: (error as Error).message })
        },
      }
    )
  }

  const handleGenerateQuestions = () => {
    if (!aiConfig) {
      message.warning('请先配置 AI API')
      setSettingsOpen(true)
      return
    }

    // 生成 1 个问题，传入 userId 以启用偏好推荐
    // preferenceStrength 默认 0.7 (70% 偏好，30% 随机探索防止信息茧房)
    generateAIMutation.mutate({
      count: 1,
      aiConfig,
      userId: userId ?? undefined,
    })
  }

  const handleEditHistory = (item: AnswerHistory) => {
    setEditingHistoryId(item.id)
    setEditingHistoryAnswer(item.answer)
  }

  const handleSaveHistoryEdit = (item: AnswerHistory) => {
    if (!editingHistoryAnswer.trim()) {
      message.warning('回答不能为空')
      return
    }
    setHistory((prev) =>
      prev.map((h) => (h.id === item.id ? { ...h, answer: editingHistoryAnswer.trim() } : h))
    )
    setEditingHistoryId(null)
    setEditingHistoryAnswer('')
    message.success('已保存')
  }

  const handleCancelHistoryEdit = () => {
    setEditingHistoryId(null)
    setEditingHistoryAnswer('')
  }

  // Show loading only while checking auth (not when redirecting)
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
  // Show brief loading state during redirect
  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center">
          <Spin size="large" tip="正在跳转登录..." />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="relative min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        {/* Animated background orbs */}
        <motion.div
          className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
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
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-lg md:text-xl font-semibold">{t('title')}</span>
                {!isApiAvailable && <Tag color="orange">离线模式</Tag>}
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Tooltip title="AI 设置">
                  <AntButton
                    icon={<SettingOutlined />}
                    onClick={() => setSettingsOpen(true)}
                    type={aiConfig ? 'default' : 'primary'}
                    size="middle"
                  />
                </Tooltip>
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
            </div>
          </header>
        </FadeIn>

        <div className="relative z-10 mx-auto max-w-3xl px-4 md:px-6 py-4 md:py-8 flex flex-col gap-4 md:gap-6">
          {/* Dashboard Panel */}
          <DashboardPanel
            weeklyProgress={dashboardQuery.data?.weeklyProgress ?? { answered: 0, total: 7 }}
            currentStreak={dashboardQuery.data?.currentStreak ?? 0}
            topTags={dashboardQuery.data?.topTags ?? []}
            todayAnswered={dashboardQuery.data?.todayAnswered ?? false}
            weeklyActivities={activityQuery.data?.activities ?? []}
            isLoading={dashboardQuery.isLoading || activityQuery.isLoading}
          />

          {/* Today's Question */}
          <SlideUp delay={0.2}>
            <motion.div
              whileHover={{ boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <Card
                loading={recommendedQuestionQuery.isLoading}
                className="glass !rounded-xl md:!rounded-2xl"
                title={
                  <div className="flex items-center gap-2 flex-wrap">
                    <QuestionCircleOutlined className="text-purple-500" />
                    <span>{t('todayQuestion')}</span>
                    {questionId && (
                      <StarRating
                        value={currentRating}
                        onChange={handleRatingChange}
                        disabled={rateMutation.isPending}
                        size="small"
                      />
                    )}
                    {questionSource === 'preference' && (
                      <Tag color="purple" className="!text-xs">
                        为你推荐
                      </Tag>
                    )}
                    <Text type="secondary" className="ml-auto text-sm font-normal">
                      {dayjs().format('YYYY-MM-DD')}
                    </Text>
                  </div>
                }
              >
                {recommendedQuestionQuery.error ? (
                  <div className="text-center py-4">
                    <Text type="danger">加载问题失败，请检查网络连接</Text>
                    <br />
                    <AntButton
                      type="link"
                      onClick={() => recommendedQuestionQuery.refetch()}
                      className="mt-2"
                    >
                      重试
                    </AntButton>
                  </div>
                ) : (
                  <>
                    <motion.div
                      key={todayQuestion}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Paragraph className="mb-4 text-lg">{todayQuestion}</Paragraph>
                    </motion.div>

                    <div className="space-y-4">
                      <div>
                        <Text strong className="mb-2 block">
                          {t('yourAnswer')}
                        </Text>
                        <TextArea
                          rows={4}
                          placeholder={t('answerPlaceholder')}
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="resize-none !rounded-xl"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="primary"
                          onClick={handleSubmit}
                          isLoading={answerMutation.isPending}
                          className="!rounded-xl"
                        >
                          {t('submitAnswer')}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={getNextQuestion}
                          className="!rounded-xl"
                        >
                          换一个问题
                        </Button>
                        <Tooltip title={aiConfig ? 'AI 生成新问题' : '请先配置 AI'}>
                          <AntButton
                            icon={<RobotOutlined />}
                            onClick={handleGenerateQuestions}
                            loading={generateAIMutation.isPending}
                            disabled={!aiConfig}
                            className="!rounded-xl"
                          >
                            AI 生成
                          </AntButton>
                        </Tooltip>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </SlideUp>

          {/* Answer History */}
          <SlideUp delay={0.3}>
            <motion.div
              whileHover={{ boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <Card
                title={t('history')}
                loading={historyQuery.isLoading}
                className="glass !rounded-xl md:!rounded-2xl"
                styles={{
                  body: { maxHeight: '400px', overflowY: 'auto', padding: '12px 16px' },
                }}
              >
                {history.length === 0 ? (
                  <Empty description={tCommon('noData')} />
                ) : (
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0"
                      >
                        {/* 日期和评分 */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <Text type="secondary" className="text-xs">
                            {item.date}
                          </Text>
                          {item.questionId && (
                            <StarRating
                              value={item.rating ?? 0}
                              onChange={(rating) => handleHistoryRatingChange(item, rating)}
                              size="small"
                            />
                          )}
                        </div>
                        {/* 问题 - 加粗样式 */}
                        <Text strong className="text-sm block mb-1.5">
                          {item.question}
                        </Text>
                        {/* 回答 - 可编辑 */}
                        {editingHistoryId === item.id ? (
                          <div className="space-y-2">
                            <Input.TextArea
                              rows={2}
                              value={editingHistoryAnswer}
                              onChange={(e) => setEditingHistoryAnswer(e.target.value)}
                              className="resize-none text-sm"
                              autoFocus
                              variant="borderless"
                            />
                            <div className="flex gap-2">
                              <AntButton size="small" onClick={() => handleSaveHistoryEdit(item)}>
                                保存
                              </AntButton>
                              <AntButton size="small" type="text" onClick={handleCancelHistoryEdit}>
                                取消
                              </AntButton>
                            </div>
                          </div>
                        ) : (
                          <motion.button
                            type="button"
                            className="text-sm cursor-pointer text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left bg-transparent border-0 p-0 w-full"
                            onClick={() => handleEditHistory(item)}
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          >
                            {item.answer}
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </SlideUp>
        </div>

        {/* AI Settings Drawer */}
        <Drawer
          title="AI 配置"
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          styles={{ wrapper: { width: 400 } }}
        >
          <Form
            form={settingsForm}
            layout="vertical"
            onFinish={handleSaveSettings}
            autoComplete="off"
          >
            <Form.Item
              name="baseURL"
              label="API 地址"
              tooltip="支持 OpenAI 兼容接口，需以 /v1 结尾"
              rules={[{ required: true, message: '请输入 API 地址' }]}
              extra={
                <Text type="secondary" className="text-xs">
                  需填写完整地址，如 https://api.deepseek.com/v1/chat/completions
                </Text>
              }
            >
              <Input
                placeholder="https://api.example.com/v1"
                autoComplete="new-password"
                data-form-type="other"
              />
            </Form.Item>

            {/* 预设按钮 */}
            <div className="mb-4 flex flex-wrap gap-2">
              <AntButton
                size="small"
                onClick={() =>
                  settingsForm.setFieldsValue({
                    baseURL: 'https://openrouter.ai/api/v1/chat/completions',
                  })
                }
              >
                OpenRouter
              </AntButton>
              <AntButton
                size="small"
                onClick={() =>
                  settingsForm.setFieldsValue({
                    baseURL: 'https://api.deepseek.com/v1/chat/completions',
                  })
                }
              >
                DeepSeek
              </AntButton>
              <AntButton
                size="small"
                onClick={() =>
                  settingsForm.setFieldsValue({
                    baseURL: 'https://api.openai.com/v1/chat/completions',
                  })
                }
              >
                OpenAI
              </AntButton>
            </div>

            <Form.Item
              name="apiKey"
              label="API Key"
              rules={[{ required: true, message: '请输入 API Key' }]}
            >
              <Input.Password placeholder="sk-..." />
            </Form.Item>

            <Form.Item name="model" label="模型 (可选)">
              <Input
                placeholder="如: gpt-4, claude-3.5-sonnet, deepseek-chat"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="prompt"
              label={
                <div className="flex items-center justify-between w-full">
                  <span>角色提示词</span>
                  <AntButton
                    type="link"
                    size="small"
                    className="!p-0 !h-auto"
                    onClick={() => settingsForm.setFieldValue('prompt', DEFAULT_AI_PROMPT)}
                  >
                    重置默认
                  </AntButton>
                </div>
              }
              tooltip="自定义 AI 的角色和风格，输出格式由系统固定"
              extra={
                <Text type="secondary" className="text-xs">
                  只需描述 AI 角色和生成要求，JSON 格式由系统自动处理
                </Text>
              }
            >
              <Input.TextArea rows={6} autoComplete="off" />
            </Form.Item>

            {/* Ping Test */}
            <div className="mb-4 flex items-center gap-2">
              <AntButton
                icon={<ApiOutlined />}
                onClick={handlePingTest}
                loading={pingAIMutation.isPending}
              >
                测试连接
              </AntButton>
              {pingAIMutation.isPending && <Spin size="small" />}
              {pingResult && (
                <span className="flex items-center gap-1 text-sm">
                  {pingResult.success ? (
                    <>
                      <CheckCircleOutlined className="text-green-500" />
                      <span className="text-green-600">{pingResult.latency}ms</span>
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined className="text-red-500" />
                      <span
                        className="text-red-500 truncate max-w-[180px]"
                        title={pingResult.error}
                      >
                        {pingResult.error}
                      </span>
                    </>
                  )}
                </span>
              )}
            </div>

            <Form.Item>
              <AntButton type="primary" htmlType="submit" block>
                保存配置
              </AntButton>
            </Form.Item>
          </Form>

          <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <Text strong className="mb-2 block">
              获取 API Key
            </Text>
            <div className="space-y-2 text-sm">
              <div>
                <Text type="secondary">OpenRouter: </Text>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  openrouter.ai/keys
                </a>
              </div>
              <div>
                <Text type="secondary">DeepSeek: </Text>
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  platform.deepseek.com
                </a>
              </div>
            </div>
          </div>
        </Drawer>
      </main>
    </PageTransition>
  )
}
