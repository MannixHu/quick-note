'use client'

import { trpc } from '@/lib/trpc/client'
import dayjs, { type Dayjs } from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface Category {
  id: string
  name: string
  label: string
  color: string
}

export interface TimeBlock {
  id: string
  startTime: string
  endTime: string
  category: Category
  note?: string | null
}

// Default categories for demo/fallback
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'longTerm', label: '长期目标', color: '#4f46e5' },
  { id: '2', name: 'work', label: '工作', color: '#059669' },
  { id: '3', name: 'study', label: '学习', color: '#7c3aed' },
  { id: '4', name: 'rest', label: '休息', color: '#f59e0b' },
  { id: '5', name: 'exercise', label: '运动', color: '#ec4899' },
]

export interface UseTimeBlocksOptions {
  userId: string
  initialDate?: Dayjs
}

export interface UseTimeBlocksReturn {
  // State
  selectedDate: Dayjs
  setSelectedDate: (date: Dayjs) => void
  selectedCategory: Category | null
  setSelectedCategory: (category: Category | null) => void
  blocks: TimeBlock[]
  categories: Category[]
  isApiAvailable: boolean
  isLoading: boolean

  // Actions
  handleTimeSlotClick: (hour: number) => void
  createTimeBlock: (categoryId: string, hour: number) => void
  deleteTimeBlock: (id: string) => void
  addCategory: (category: Omit<Category, 'id'>) => void
  generateText: () => string

  // Computed
  totalHours: number
  categoryStats: Array<Category & { hours: number }>
  getBlockForHour: (hour: number) => TimeBlock | undefined
}

/**
 * Hook for managing time block operations
 * Handles CRUD operations, categories, and offline fallback
 */
export function useTimeBlocks({ userId, initialDate }: UseTimeBlocksOptions): UseTimeBlocksReturn {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDate ?? dayjs())
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [isApiAvailable, setIsApiAvailable] = useState(true)

  // tRPC queries
  // @ts-expect-error - tRPC v11 RC type compatibility
  const categoriesQuery = trpc.timeBlock.getCategories.useQuery(
    { userId },
    { enabled: isApiAvailable, retry: 1 }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const blocksQuery = trpc.timeBlock.getByDate.useQuery(
    { userId, date: selectedDate.format('YYYY-MM-DD') },
    { enabled: isApiAvailable, retry: 1 }
  )

  // tRPC mutations
  // @ts-expect-error - tRPC v11 RC type compatibility
  const quickCreateMutation = trpc.timeBlock.quickCreate.useMutation()
  // @ts-expect-error - tRPC v11 RC type compatibility
  const deleteMutation = trpc.timeBlock.delete.useMutation()
  // @ts-expect-error - tRPC v11 RC type compatibility
  const createCategoryMutation = trpc.timeBlock.createCategory.useMutation()

  // Handle query errors
  useEffect(() => {
    if (categoriesQuery.error || blocksQuery.error) {
      setIsApiAvailable(false)
    }
  }, [categoriesQuery.error, blocksQuery.error])

  // Sync categories from API
  useEffect(() => {
    if (categoriesQuery.data && (categoriesQuery.data as unknown[]).length > 0) {
      const data = categoriesQuery.data as Category[]
      setCategories(data)
    }
  }, [categoriesQuery.data])

  // Sync blocks from API
  useEffect(() => {
    if (blocksQuery.data) {
      const data = blocksQuery.data as TimeBlock[]
      setBlocks(data)
    }
  }, [blocksQuery.data])

  // Handle mutation results
  useEffect(() => {
    if (quickCreateMutation.data) {
      const newBlock = quickCreateMutation.data as TimeBlock
      setBlocks((prev) => {
        if (prev.some((b) => b.id === newBlock.id)) return prev
        return [...prev, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime))
      })
    }
    if (quickCreateMutation.error) {
      setIsApiAvailable(false)
    }
  }, [quickCreateMutation.data, quickCreateMutation.error])

  useEffect(() => {
    if (deleteMutation.variables && deleteMutation.isSuccess) {
      const variables = deleteMutation.variables as { id: string }
      setBlocks((prev) => prev.filter((b) => b.id !== variables.id))
    }
    if (deleteMutation.error) {
      setIsApiAvailable(false)
    }
  }, [deleteMutation.isSuccess, deleteMutation.error, deleteMutation.variables])

  useEffect(() => {
    if (createCategoryMutation.data) {
      const newCat = createCategoryMutation.data as Category
      setCategories((prev) => {
        if (prev.some((c) => c.id === newCat.id)) return prev
        return [...prev, newCat]
      })
    }
    if (createCategoryMutation.error) {
      setIsApiAvailable(false)
    }
  }, [createCategoryMutation.data, createCategoryMutation.error])

  // Actions
  const createTimeBlock = useCallback(
    (categoryId: string, hour: number) => {
      if (isApiAvailable) {
        quickCreateMutation.mutate({
          userId,
          categoryId,
          date: selectedDate.format('YYYY-MM-DD'),
          hour,
        })
      } else {
        const category = categories.find((c) => c.id === categoryId)
        if (!category) return

        const startTime = `${hour.toString().padStart(2, '0')}:00`
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
        const newBlock: TimeBlock = {
          id: `local-${Date.now()}`,
          startTime,
          endTime,
          category,
        }
        setBlocks((prev) =>
          [...prev, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime))
        )
      }
    },
    [isApiAvailable, userId, selectedDate, categories, quickCreateMutation]
  )

  const deleteTimeBlock = useCallback(
    (id: string) => {
      if (isApiAvailable) {
        deleteMutation.mutate({ id })
      } else {
        setBlocks((prev) => prev.filter((b) => b.id !== id))
      }
    },
    [isApiAvailable, deleteMutation]
  )

  const getBlockForHour = useCallback(
    (hour: number): TimeBlock | undefined => {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`
      return blocks.find((b) => b.startTime === timeStr)
    },
    [blocks]
  )

  const handleTimeSlotClick = useCallback(
    (hour: number) => {
      if (!selectedCategory) return

      const existingBlock = getBlockForHour(hour)
      if (existingBlock) {
        deleteTimeBlock(existingBlock.id)
      } else {
        createTimeBlock(selectedCategory.id, hour)
      }
    },
    [selectedCategory, getBlockForHour, deleteTimeBlock, createTimeBlock]
  )

  const addCategory = useCallback(
    (category: Omit<Category, 'id'>) => {
      if (isApiAvailable) {
        createCategoryMutation.mutate({ userId, ...category })
      } else {
        const newCategory: Category = {
          id: `local-${Date.now()}`,
          ...category,
        }
        setCategories((prev) => [...prev, newCategory])
      }
    },
    [isApiAvailable, userId, createCategoryMutation]
  )

  const generateText = useCallback(() => {
    if (blocks.length === 0) return ''
    return blocks.map((b) => `${b.startTime}-${b.endTime} #${b.category.name}`).join('\n')
  }, [blocks])

  // Computed values
  const totalHours = blocks.length

  const categoryStats = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        hours: blocks.filter((b) => b.category.id === cat.id).length,
      })),
    [categories, blocks]
  )

  const isLoading = categoriesQuery.isLoading || blocksQuery.isLoading

  return {
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    blocks,
    categories,
    isApiAvailable,
    isLoading,
    handleTimeSlotClick,
    createTimeBlock,
    deleteTimeBlock,
    addCategory,
    generateText,
    totalHours,
    categoryStats,
    getBlockForHour,
  }
}

export default useTimeBlocks
