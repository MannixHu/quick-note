'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  Radio,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
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
    // Get a random question from the sample questions, excluding the current one
    const availableQuestions = SAMPLE_QUESTIONS.filter((q) => q !== todayQuestion)
    const nextQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)] ??
      SAMPLE_QUESTIONS[0] ??
      '今天最让你感到有成就感的事情是什么？'
    setTodayQuestion(nextQuestion)
    setQuestionId(null)
    // Try to fetch from API
    randomQuestionQuery.refetch()
  }

  const handleSaveSettings = (values: AIConfig) => {
    setAiConfig(values)
    localStorage.setItem('ai-config', JSON.stringify(values))
    setSettingsOpen(false)
    message.success('AI 配置已保存')
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
    <main className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />} type="text">
              {tCommon('back')}
            </Button>
          </Link>
          <Title level={3} className="!mb-0">
            {t('title')}
          </Title>
          {!isApiAvailable && <Tag color="orange">离线模式</Tag>}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title="AI 生成问题">
            <Button
              icon={<ThunderboltOutlined />}
              onClick={handleGenerateQuestions}
              loading={generateAIMutation.isPending}
              disabled={!aiConfig}
            />
          </Tooltip>
          <Tooltip title="AI 设置">
            <Button
              icon={<SettingOutlined />}
              onClick={() => setSettingsOpen(true)}
              type={aiConfig ? 'default' : 'primary'}
            />
          </Tooltip>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-6xl flex gap-6">
        {/* Left: Today's Question */}
        <div className="flex-1">
          <Card
            className="mb-6"
            loading={randomQuestionQuery.isLoading}
            title={
              <div className="flex items-center gap-2">
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
                <Button type="link" onClick={() => randomQuestionQuery.refetch()} className="mt-2">
                  重试
                </Button>
              </div>
            ) : (
              <>
                <Paragraph className="mb-4 text-lg">{todayQuestion}</Paragraph>

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
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="primary"
                      onClick={handleSubmit}
                      loading={answerMutation.isPending}
                    >
                      {t('submitAnswer')}
                    </Button>
                    <Button onClick={getNextQuestion}>换一个问题</Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right: Answer History */}
        <div className="w-80 shrink-0">
          <Card
            title={t('history')}
            loading={historyQuery.isLoading}
            className="sticky top-6"
            styles={{ body: { maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' } }}
          >
            {history.length === 0 ? (
              <Empty description={tCommon('noData')} />
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="mb-1">
                      <Text type="secondary" className="text-xs">
                        {item.date}
                      </Text>
                    </div>
                    <Text strong className="mb-1 block text-purple-600 text-sm">
                      {item.question}
                    </Text>
                    {editingHistoryId === item.id ? (
                      <div className="space-y-2">
                        <TextArea
                          rows={3}
                          value={editingHistoryAnswer}
                          onChange={(e) => setEditingHistoryAnswer(e.target.value)}
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleSaveHistoryEdit(item)}
                          >
                            保存
                          </Button>
                          <Button size="small" onClick={handleCancelHistoryEdit}>
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-1 -m-1 transition-colors text-left w-full"
                        onClick={() => handleEditHistory(item)}
                      >
                        {item.answer}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
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

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存配置
            </Button>
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
  )
}
