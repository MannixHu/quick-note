'use client'

import { trpc } from '@/lib/trpc/client'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

dayjs.extend(dayOfYear)

// Sample fallback questions
const SAMPLE_QUESTIONS = [
  '今天最让你感到有成就感的事情是什么？',
  '如果今天可以重来，你会做什么不同的选择？',
  '最近学到的最重要的一课是什么？',
  '什么事情一直在消耗你的能量，但你还没有处理？',
  '你最近一次真正开心是什么时候？当时在做什么？',
]

export interface AnswerHistory {
  id: string
  date: string
  question: string
  answer: string
}

export interface AIConfig {
  provider: 'openrouter' | 'deepseek'
  apiKey: string
  model?: string
}

export interface UseQuestionOptions {
  userId: string
}

export interface UseQuestionReturn {
  // State
  todayQuestion: string
  questionId: string | null
  answer: string
  setAnswer: (answer: string) => void
  history: AnswerHistory[]
  isApiAvailable: boolean
  isLoading: boolean
  isSubmitting: boolean

  // AI State
  aiConfig: AIConfig | null
  setAiConfig: (config: AIConfig | null) => void
  isGeneratingAI: boolean
  isPingingAI: boolean

  // Actions
  submitAnswer: () => void
  getNextQuestion: () => void
  generateAIQuestions: (count?: number) => void
  pingAI: (config: AIConfig) => Promise<{ success: boolean; latency?: number; error?: string }>

  // History editing
  editingHistoryId: string | null
  editingHistoryAnswer: string
  startEditingHistory: (item: AnswerHistory) => void
  saveHistoryEdit: (item: AnswerHistory) => void
  cancelHistoryEdit: () => void
}

/**
 * Hook for managing daily question operations
 * Handles question fetching, answering, history, and AI integration
 */
export function useQuestion({ userId }: UseQuestionOptions): UseQuestionReturn {
  // Compute fallback question based on day of year
  const todayIndex = dayjs().dayOfYear() % SAMPLE_QUESTIONS.length
  const fallbackQuestion =
    SAMPLE_QUESTIONS[todayIndex] ?? SAMPLE_QUESTIONS[0] ?? '今天最让你感到有成就感的事情是什么？'

  // State
  const [todayQuestion, setTodayQuestion] = useState<string>(fallbackQuestion)
  const [questionId, setQuestionId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [history, setHistory] = useState<AnswerHistory[]>([])
  const [isApiAvailable, setIsApiAvailable] = useState(true)

  // History editing state
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null)
  const [editingHistoryAnswer, setEditingHistoryAnswer] = useState('')

  // AI config from localStorage
  const [aiConfig, setAiConfig] = useLocalStorage<AIConfig | null>('ai-config', null)

  // tRPC queries
  // @ts-expect-error - tRPC v11 RC type compatibility
  const randomQuestionQuery = trpc.dailyQuestion.getRandomQuestion.useQuery(
    { userId },
    { retry: 2 }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const historyQuery = trpc.dailyQuestion.getAnswerHistory.useQuery(
    { userId, limit: 30 },
    { retry: 2 }
  )

  // tRPC mutations
  // @ts-expect-error - tRPC v11 RC type compatibility
  const answerMutation = trpc.dailyQuestion.answerQuestionNew.useMutation()
  // @ts-expect-error - tRPC v11 RC type compatibility
  const generateAIMutation = trpc.dailyQuestion.generateAIQuestions.useMutation()
  // @ts-expect-error - tRPC v11 RC type compatibility
  const pingAIMutation = trpc.dailyQuestion.pingAI.useMutation()

  // Sync question from API
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

  // Sync history from API
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
        const apiIds = new Set(apiHistory.map((h) => h.id))
        const localOnly = prev.filter((h) => !apiIds.has(h.id))
        return [...localOnly, ...apiHistory]
      })
    }
  }, [historyQuery.data])

  // Handle answer mutation results
  useEffect(() => {
    if (answerMutation.data) {
      const data = answerMutation.data as {
        id: string
        date: Date
        question: { question: string }
        answer: string
      }
      const newAnswer: AnswerHistory = {
        id: data.id,
        date: dayjs(data.date).format('YYYY-MM-DD HH:mm'),
        question: data.question.question,
        answer: data.answer,
      }
      setHistory((prev) => [newAnswer, ...prev])
      setAnswer('')
      // Get next question
      setQuestionId(null)
      randomQuestionQuery.refetch()
    }
  }, [answerMutation.data, randomQuestionQuery])

  // Actions
  const submitAnswer = useCallback(() => {
    if (!answer.trim()) return

    if (!questionId || !isApiAvailable) {
      // Local fallback
      const newAnswer: AnswerHistory = {
        id: `${Date.now()}`,
        date: dayjs().format('YYYY-MM-DD HH:mm'),
        question: todayQuestion,
        answer: answer.trim(),
      }
      setHistory((prev) => [newAnswer, ...prev])
      setAnswer('')
      // Get next question locally
      const nextIndex = (dayjs().dayOfYear() + history.length + 1) % SAMPLE_QUESTIONS.length
      setTodayQuestion(
        SAMPLE_QUESTIONS[nextIndex] ?? SAMPLE_QUESTIONS[0] ?? '今天最让你感到有成就感的事情是什么？'
      )
      return
    }

    answerMutation.mutate({
      userId,
      questionId,
      answer: answer.trim(),
    })
  }, [answer, questionId, isApiAvailable, todayQuestion, history.length, userId, answerMutation])

  const getNextQuestion = useCallback(() => {
    setQuestionId(null)
    randomQuestionQuery.refetch()
  }, [randomQuestionQuery])

  const generateAIQuestions = useCallback(
    (count = 5) => {
      if (!aiConfig) return

      generateAIMutation.mutate({
        count,
        aiConfig,
      })
    },
    [aiConfig, generateAIMutation]
  )

  const pingAI = useCallback(
    async (config: AIConfig): Promise<{ success: boolean; latency?: number; error?: string }> => {
      return new Promise((resolve) => {
        pingAIMutation.mutate(
          { aiConfig: config },
          {
            onSuccess: (data: unknown) => {
              const result = data as { success: boolean; latency?: number; error?: string }
              resolve(result)
            },
            onError: (error: unknown) => {
              resolve({ success: false, error: (error as Error).message })
            },
          }
        )
      })
    },
    [pingAIMutation]
  )

  // History editing
  const startEditingHistory = useCallback((item: AnswerHistory) => {
    setEditingHistoryId(item.id)
    setEditingHistoryAnswer(item.answer)
  }, [])

  const saveHistoryEdit = useCallback(
    (item: AnswerHistory) => {
      if (!editingHistoryAnswer.trim()) return

      setHistory((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, answer: editingHistoryAnswer.trim() } : h))
      )
      setEditingHistoryId(null)
      setEditingHistoryAnswer('')
    },
    [editingHistoryAnswer]
  )

  const cancelHistoryEdit = useCallback(() => {
    setEditingHistoryId(null)
    setEditingHistoryAnswer('')
  }, [])

  return {
    todayQuestion,
    questionId,
    answer,
    setAnswer,
    history,
    isApiAvailable,
    isLoading: randomQuestionQuery.isLoading || historyQuery.isLoading,
    isSubmitting: answerMutation.isPending,

    aiConfig,
    setAiConfig,
    isGeneratingAI: generateAIMutation.isPending,
    isPingingAI: pingAIMutation.isPending,

    submitAnswer,
    getNextQuestion,
    generateAIQuestions,
    pingAI,

    editingHistoryId,
    editingHistoryAnswer,
    startEditingHistory,
    saveHistoryEdit,
    cancelHistoryEdit,
  }
}

export default useQuestion
