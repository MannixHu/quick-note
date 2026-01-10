'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button, FadeIn, PageTransition, SlideUp } from '@/components/ui'
import { Link } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import {
  ApiOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  Button as AntButton,
  App,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  Radio,
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

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const DEMO_USER_ID = 'demo-user-123'

const SAMPLE_QUESTIONS = [
  '今天最让你感到有成就感的事情是什么？',
  '如果今天可以重来，你会做什么不同的选择？',
  '最近学到的最重要的一课是什么？',
  '什么事情一直在消耗你的能量，但你还没有处理？',
  '你最近一次真正开心是什么时候？当时在做什么？',
]

interface AnswerHistory {
  id: string
  date: string
  question: string
  answer: string
}

interface AIConfig {
  provider: 'openrouter' | 'deepseek'
  apiKey: string
  model?: string
}

export default function DailyQuestionPage() {
  const { message } = App.useApp()
  const t = useTranslations('dailyQuestion')
  const tCommon = useTranslations('common')

  const todayIndex = dayjs().dayOfYear() % SAMPLE_QUESTIONS.length
  const fallbackQuestion =
    SAMPLE_QUESTIONS[todayIndex] ?? SAMPLE_QUESTIONS[0] ?? '今天最让你感到有成就感的事情是什么？'

  const [answer, setAnswer] = useState('')
  const [todayQuestion, setTodayQuestion] = useState<string>(fallbackQuestion)
  const [questionId, setQuestionId] = useState<string | null>(null)
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

  // Load AI config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig) as AIConfig
        setAiConfig(config)
        settingsForm.setFieldsValue(config)
      } catch {
        // ignore
      }
    }
  }, [settingsForm])

  // tRPC queries
  // @ts-expect-error - tRPC v11 RC type compatibility
  const randomQuestionQuery = trpc.dailyQuestion.getRandomQuestion.useQuery(
    { userId: DEMO_USER_ID },
    { retry: 2 }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const historyQuery = trpc.dailyQuestion.getAnswerHistory.useQuery(
    { userId: DEMO_USER_ID, limit: 30 },
    { retry: 2 }
  )

  // tRPC mutations
  // @ts-expect-error - tRPC v11 RC type compatibility
  const answerMutation = trpc.dailyQuestion.answerQuestionNew.useMutation()

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
        question: { question: string }
        answer: string
      }
      // Add to local history immediately using the returned data
      const newAnswer: AnswerHistory = {
        id: data.id,
        date: dayjs(data.date).format('YYYY-MM-DD HH:mm'),
        question: data.question.question,
        answer: data.answer,
      }
      setHistory((prev) => [newAnswer, ...prev])
      setAnswer('')
      message.success('回答已保存')
      // Get next question
      getNextQuestion()
    }
    if (answerMutation.error) {
      message.error('保存失败，请重试')
    }
  }, [answerMutation.data, answerMutation.error])

  // biome-ignore lint/correctness/useExhaustiveDependencies: message is a stable ref
  useEffect(() => {
    if (generateAIMutation.data) {
      const data = generateAIMutation.data as { count: number }
      message.success(`成功生成 ${data.count} 个问题`)
    }
    if (generateAIMutation.error) {
      const error = generateAIMutation.error as { message: string }
      message.error(`生成失败: ${error.message}`)
    }
  }, [generateAIMutation.data, generateAIMutation.error])

  // Sync API data to local state
  useEffect(() => {
    if (randomQuestionQuery.data) {
      const data = randomQuestionQuery.data as {
        id: string
        question: string
        category: string | null
      }
      setTodayQuestion(data.question)
      setQuestionId(data.id)
      setIsApiAvailable(true)
    }
    if (randomQuestionQuery.error) {
      setIsApiAvailable(false)
    }
  }, [randomQuestionQuery.data, randomQuestionQuery.error])

  useEffect(() => {
    if (historyQuery.data) {
      const data = historyQuery.data as Array<{
        id: string
        date: Date
        question: { question: string }
        answer: string
      }>
      const apiHistory = data.map((h) => ({
        id: h.id,
        date: dayjs(h.date).format('YYYY-MM-DD HH:mm'),
        question: h.question.question,
        answer: h.answer,
      }))
      // Merge with existing local history (avoid duplicates by id)
      setHistory((prev) => {
        // Keep local entries that aren't in API yet, plus all API entries
        const apiIds = new Set(apiHistory.map((h) => h.id))
        const localOnly = prev.filter((h) => !apiIds.has(h.id))
        return [...localOnly, ...apiHistory]
      })
    }
  }, [historyQuery.data])

  const handleLocalSubmit = () => {
    if (!answer.trim()) {
      message.warning('请输入你的回答')
      return
    }

    const newAnswer: AnswerHistory = {
      id: `${Date.now()}`,
      date: dayjs().format('YYYY-MM-DD HH:mm'),
      question: todayQuestion,
      answer: answer.trim(),
    }
    setHistory([newAnswer, ...history])
    setAnswer('')
    // Get next question
    getNextQuestion()
    message.success('回答已保存')
  }

  const handleSubmit = () => {
    if (!answer.trim()) {
      message.warning('请输入你的回答')
      return
    }

    if (!questionId) {
      // Fallback to local submit
      handleLocalSubmit()
      return
    }

    answerMutation.mutate({
      userId: DEMO_USER_ID,
      questionId,
      answer: answer.trim(),
    })
  }

  const getNextQuestion = () => {
    // Only fetch from API, let the useEffect handle the update
    // If API fails, the error handler will keep the current question
    setQuestionId(null)
    randomQuestionQuery.refetch()
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
    if (!formValues.provider || !formValues.apiKey) {
      message.warning('请先填写服务商和 API Key')
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

    generateAIMutation.mutate({
      count: 5,
      aiConfig,
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
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="!text-gray-600 dark:!text-gray-400 hover:!text-primary-600 !px-2 md:!px-4"
                  >
                    <ArrowLeftOutlined />
                    <span className="hidden sm:inline ml-2">{tCommon('back')}</span>
                  </Button>
                </Link>
                <Title level={4} className="!mb-0 md:!text-xl">
                  {t('title')}
                </Title>
                {!isApiAvailable && <Tag color="orange">离线模式</Tag>}
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Tooltip title="AI 生成问题">
                  <AntButton
                    icon={<ThunderboltOutlined />}
                    onClick={handleGenerateQuestions}
                    loading={generateAIMutation.isPending}
                    disabled={!aiConfig}
                    size="middle"
                  />
                </Tooltip>
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
          {/* Today's Question */}
          <SlideUp delay={0.2}>
            <motion.div
              whileHover={{ boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <Card
                loading={randomQuestionQuery.isLoading}
                className="glass !rounded-xl md:!rounded-2xl"
                title={
                  <div className="flex items-center gap-2 flex-wrap">
                    <QuestionCircleOutlined className="text-purple-500" />
                    <span>{t('todayQuestion')}</span>
                    <Text type="secondary" className="ml-auto text-sm font-normal">
                      {dayjs().format('YYYY-MM-DD')}
                    </Text>
                  </div>
                }
              >
                {randomQuestionQuery.error ? (
                  <div className="text-center py-4">
                    <Text type="danger">加载问题失败，请检查网络连接</Text>
                    <br />
                    <AntButton
                      type="link"
                      onClick={() => randomQuestionQuery.refetch()}
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
                      <div className="flex gap-2">
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
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Text type="secondary" className="text-xs">
                            {item.date}
                          </Text>
                        </div>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                          {item.question}
                        </Text>
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
                            className="text-sm cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left bg-transparent border-0 p-0 w-full"
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
          <Form form={settingsForm} layout="vertical" onFinish={handleSaveSettings}>
            <Form.Item
              name="provider"
              label="AI 服务商"
              rules={[{ required: true, message: '请选择服务商' }]}
            >
              <Radio.Group>
                <Radio.Button value="openrouter">OpenRouter</Radio.Button>
                <Radio.Button value="deepseek">DeepSeek</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="apiKey"
              label="API Key"
              rules={[{ required: true, message: '请输入 API Key' }]}
            >
              <Input.Password placeholder="sk-..." />
            </Form.Item>

            <Form.Item name="model" label="模型 (可选)">
              <Input placeholder="默认: Claude 3.5 / DeepSeek Chat" />
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
