'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  List,
  Radio,
  Tag,
  Tooltip,
  Typography,
  message,
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
  const t = useTranslations('dailyQuestion')
  const tCommon = useTranslations('common')

  const todayIndex = dayjs().dayOfYear() % SAMPLE_QUESTIONS.length
  const fallbackQuestion = SAMPLE_QUESTIONS[todayIndex]

  const [answer, setAnswer] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [todayQuestion, setTodayQuestion] = useState(fallbackQuestion)
  const [questionId, setQuestionId] = useState<string | null>(null)
  const [history, setHistory] = useState<AnswerHistory[]>([
    {
      id: '1',
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      question: '如果你知道不会失败，你会尝试什么？',
      answer:
        '我会尝试创业，做一个帮助人们更好地管理时间和生活的产品。虽然有风险，但如果不会失败的话，这是我最想做的事情。',
    },
    {
      id: '2',
      date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      question: '今天有什么值得感恩的小事？',
      answer: '感恩早晨喝到了一杯好咖啡，感恩和朋友有一次愉快的聊天，感恩天气很好可以出去走走。',
    },
  ])
  const [isApiAvailable, setIsApiAvailable] = useState(true)

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
  const todayQuestionQuery = trpc.dailyQuestion.getTodayQuestion.useQuery(
    { userId: DEMO_USER_ID },
    {
      enabled: isApiAvailable,
      retry: 1,
    }
  )

  const historyQuery = trpc.dailyQuestion.getAnswerHistory.useQuery(
    { userId: DEMO_USER_ID, limit: 30 },
    {
      enabled: isApiAvailable,
      retry: 1,
    }
  )

  // tRPC mutations
  const answerMutation = trpc.dailyQuestion.answerQuestion.useMutation({
    onSuccess: () => {
      setIsAnswered(true)
      message.success('回答已保存')

      const newAnswer: AnswerHistory = {
        id: `${Date.now()}`,
        date: dayjs().format('YYYY-MM-DD'),
        question: todayQuestion,
        answer: answer.trim(),
      }
      setHistory((prev) => [newAnswer, ...prev.filter((h) => h.date !== newAnswer.date)])
    },
    onError: () => {
      setIsApiAvailable(false)
      handleLocalSubmit()
    },
  })

  const generateAIMutation = trpc.dailyQuestion.generateAIQuestions.useMutation({
    onSuccess: (data) => {
      message.success(`成功生成 ${data.count} 个问题`)
    },
    onError: (error) => {
      message.error(`生成失败: ${error.message}`)
    },
  })

  // Sync API data to local state
  useEffect(() => {
    if (todayQuestionQuery.data) {
      setTodayQuestion(todayQuestionQuery.data.question.question)
      setQuestionId(todayQuestionQuery.data.questionId)
      if (todayQuestionQuery.data.answer) {
        setAnswer(todayQuestionQuery.data.answer)
        setIsAnswered(true)
      }
    }
  }, [todayQuestionQuery.data])

  useEffect(() => {
    if (historyQuery.data && historyQuery.data.length > 0) {
      setHistory(
        historyQuery.data.map((h) => ({
          id: h.id,
          date: dayjs(h.date).format('YYYY-MM-DD'),
          question: h.question.question,
          answer: h.answer,
        }))
      )
    }
  }, [historyQuery.data])

  const handleLocalSubmit = () => {
    if (!answer.trim()) {
      message.warning('请输入你的回答')
      return
    }

    const newAnswer: AnswerHistory = {
      id: `${Date.now()}`,
      date: dayjs().format('YYYY-MM-DD'),
      question: todayQuestion,
      answer: answer.trim(),
    }
    setHistory([newAnswer, ...history.filter((h) => h.date !== newAnswer.date)])
    setIsAnswered(true)
    message.success('回答已保存')
  }

  const handleSubmit = () => {
    if (!answer.trim()) {
      message.warning('请输入你的回答')
      return
    }

    if (isApiAvailable && questionId) {
      answerMutation.mutate({
        userId: DEMO_USER_ID,
        questionId,
        answer: answer.trim(),
      })
    } else {
      handleLocalSubmit()
    }
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

      <div className="mx-auto max-w-2xl">
        {/* Today's Question */}
        <Card
          className="mb-6"
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
          <Paragraph className="mb-4 text-lg">{todayQuestion}</Paragraph>

          {isAnswered ? (
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="mb-2 flex items-center gap-2 text-green-600">
                <CheckCircleOutlined />
                <Text strong className="text-green-600">
                  {t('answered')}
                </Text>
              </div>
              <Paragraph className="!mb-0">{answer}</Paragraph>
            </div>
          ) : (
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
              <Button type="primary" onClick={handleSubmit} loading={answerMutation.isPending}>
                {t('submitAnswer')}
              </Button>
            </div>
          )}
        </Card>

        {/* Answer History */}
        <Card title={t('history')}>
          <List
            dataSource={history}
            renderItem={(item) => (
              <List.Item className="!block !px-0">
                <div className="mb-1 flex items-center justify-between">
                  <Text type="secondary" className="text-sm">
                    {item.date}
                  </Text>
                </div>
                <Text strong className="mb-2 block text-purple-600">
                  {item.question}
                </Text>
                <Paragraph className="!mb-0 text-gray-600 dark:text-gray-400">
                  {item.answer}
                </Paragraph>
              </List.Item>
            )}
            locale={{ emptyText: tCommon('noData') }}
          />
        </Card>
      </div>

      {/* AI Settings Drawer */}
      <Drawer
        title="AI 配置"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        width={400}
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
