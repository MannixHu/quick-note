'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import { ArrowLeftOutlined, CheckOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons'
import { App, Button, DatePicker, Input, Popover, Tag } from 'antd'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

// Demo user ID - in production this would come from auth context
const DEMO_USER_ID = 'demo-user-123'

// Generate hours array (0-23)
const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Default categories for demo/fallback
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'longTerm', label: '长期目标', color: '#4f46e5' },
  { id: '2', name: 'work', label: '工作', color: '#059669' },
  { id: '3', name: 'study', label: '学习', color: '#7c3aed' },
  { id: '4', name: 'rest', label: '休息', color: '#f59e0b' },
  { id: '5', name: 'exercise', label: '运动', color: '#ec4899' },
]

interface Category {
  id: string
  name: string
  label: string
  color: string
}

interface TimeBlock {
  id: string
  startTime: string
  endTime: string
  category: Category
  note?: string | null
}

export default function TimeBlocksPage() {
  const { message } = App.useApp()
  const t = useTranslations('timeBlock')
  const tCommon = useTranslations('common')

  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', label: '', color: '#4f46e5' })
  const [isApiAvailable, setIsApiAvailable] = useState(true)
  const [copied, setCopied] = useState(false)

  // tRPC queries with fallback
  // @ts-expect-error - tRPC v11 RC type compatibility
  const categoriesQuery = trpc.timeBlock.getCategories.useQuery(
    { userId: DEMO_USER_ID },
    {
      enabled: isApiAvailable,
      retry: 1,
    }
  )

  // @ts-expect-error - tRPC v11 RC type compatibility
  const blocksQuery = trpc.timeBlock.getByDate.useQuery(
    { userId: DEMO_USER_ID, date: selectedDate.format('YYYY-MM-DD') },
    {
      enabled: isApiAvailable,
      retry: 1,
    }
  )

  // Handle query errors
  useEffect(() => {
    if (categoriesQuery.error || blocksQuery.error) {
      setIsApiAvailable(false)
    }
  }, [categoriesQuery.error, blocksQuery.error])

  // tRPC mutations
  // @ts-expect-error - tRPC v11 RC type compatibility
  const quickCreateMutation = trpc.timeBlock.quickCreate.useMutation()

  // Handle mutation success/error
  useEffect(() => {
    if (quickCreateMutation.data) {
      const newBlock = quickCreateMutation.data as {
        id: string
        startTime: string
        endTime: string
        category: Category
        note?: string | null
      }
      const block: TimeBlock = {
        id: newBlock.id,
        startTime: newBlock.startTime,
        endTime: newBlock.endTime,
        category: newBlock.category as Category,
        note: newBlock.note,
      }
      setBlocks((prev) => {
        if (prev.some((b) => b.id === block.id)) return prev
        return [...prev, block].sort((a, b) => a.startTime.localeCompare(b.startTime))
      })
    }
    if (quickCreateMutation.error) {
      setIsApiAvailable(false)
    }
  }, [quickCreateMutation.data, quickCreateMutation.error])

  // @ts-expect-error - tRPC v11 RC type compatibility
  const deleteMutation = trpc.timeBlock.delete.useMutation()

  useEffect(() => {
    if (deleteMutation.variables && deleteMutation.isSuccess) {
      const variables = deleteMutation.variables as { id: string }
      setBlocks((prev) => prev.filter((b) => b.id !== variables.id))
    }
    if (deleteMutation.error) {
      setIsApiAvailable(false)
    }
  }, [deleteMutation.isSuccess, deleteMutation.error, deleteMutation.variables])

  // @ts-expect-error - tRPC v11 RC type compatibility
  const createCategoryMutation = trpc.timeBlock.createCategory.useMutation()

  useEffect(() => {
    if (createCategoryMutation.data) {
      const newCat = createCategoryMutation.data as {
        id: string
        name: string
        label: string
        color: string
      }
      const cat: Category = {
        id: newCat.id,
        name: newCat.name,
        label: newCat.label,
        color: newCat.color,
      }
      setCategories((prev) => {
        if (prev.some((c) => c.id === cat.id)) return prev
        return [...prev, cat]
      })
    }
    if (createCategoryMutation.error) {
      setIsApiAvailable(false)
    }
  }, [createCategoryMutation.data, createCategoryMutation.error])

  // Sync API data to local state
  useEffect(() => {
    if (categoriesQuery.data && (categoriesQuery.data as unknown[]).length > 0) {
      const data = categoriesQuery.data as Array<{
        id: string
        name: string
        label: string
        color: string
      }>
      setCategories(
        data.map((c) => ({
          id: c.id,
          name: c.name,
          label: c.label,
          color: c.color,
        }))
      )
    }
  }, [categoriesQuery.data])

  useEffect(() => {
    if (blocksQuery.data) {
      const data = blocksQuery.data as Array<{
        id: string
        startTime: string
        endTime: string
        category: Category
        note?: string | null
      }>
      setBlocks(
        data.map((b) => ({
          id: b.id,
          startTime: b.startTime,
          endTime: b.endTime,
          category: {
            id: b.category.id,
            name: b.category.name,
            label: b.category.label,
            color: b.category.color,
          },
          note: b.note,
        }))
      )
    }
  }, [blocksQuery.data])

  // Handle clicking on a time slot
  // biome-ignore lint/correctness/useExhaustiveDependencies: message.warning is a stable ref
  const handleTimeSlotClick = useCallback(
    (hour: number) => {
      if (!selectedCategory) {
        message.warning(t('selectCategory'))
        return
      }

      const startTime = `${hour.toString().padStart(2, '0')}:00`

      // Check if block already exists at this time
      const existingBlock = blocks.find((b) => b.startTime === startTime)

      if (existingBlock) {
        // Remove the block
        if (isApiAvailable) {
          deleteMutation.mutate({ id: existingBlock.id })
        } else {
          setBlocks(blocks.filter((b) => b.id !== existingBlock.id))
        }
      } else {
        // Add new block
        if (isApiAvailable) {
          quickCreateMutation.mutate({
            userId: DEMO_USER_ID,
            categoryId: selectedCategory.id,
            date: selectedDate.format('YYYY-MM-DD'),
            hour,
          })
        } else {
          // Local fallback
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
          const newBlock: TimeBlock = {
            id: `local-${Date.now()}`,
            startTime,
            endTime,
            category: selectedCategory,
          }
          setBlocks([...blocks, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)))
        }
      }
    },
    [selectedCategory, blocks, isApiAvailable, selectedDate, t, deleteMutation, quickCreateMutation]
  )

  // Get block for a specific hour
  const getBlockForHour = (hour: number): TimeBlock | undefined => {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`
    return blocks.find((b) => b.startTime === timeStr)
  }

  // Generate text output
  const generateText = () => {
    if (blocks.length === 0) return ''
    return blocks.map((b) => `${b.startTime}-${b.endTime} #${b.category.name}`).join('\n')
  }

  // Copy text to clipboard
  const handleCopyText = async () => {
    const text = generateText()
    if (!text) {
      message.warning(t('noBlocks'))
      return
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    message.success(tCommon('copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  // Add new category
  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.label) return

    if (isApiAvailable) {
      createCategoryMutation.mutate({
        userId: DEMO_USER_ID,
        ...newCategory,
      })
    } else {
      // Local fallback
      const category: Category = {
        id: `local-${Date.now()}`,
        ...newCategory,
      }
      setCategories([...categories, category])
    }

    setNewCategory({ name: '', label: '', color: '#4f46e5' })
    setShowAddCategory(false)
  }

  // Calculate stats
  const totalHours = blocks.length
  const categoryStats = categories.map((cat) => ({
    ...cat,
    hours: blocks.filter((b) => b.category.id === cat.id).length,
  }))

  return (
    <main className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                icon={<ArrowLeftOutlined />}
                type="text"
                className="!text-gray-600 dark:!text-gray-400 hover:!text-primary-600"
              >
                {tCommon('back')}
              </Button>
            </Link>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
            </div>
            {!isApiAvailable && (
              <Tag color="orange" className="!m-0">
                离线模式
              </Tag>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Date & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                allowClear={false}
                className="!rounded-xl"
                size="large"
              />
              <Button
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopyText}
                className="!rounded-xl"
                type={copied ? 'primary' : 'default'}
              >
                {copied ? '已复制' : t('copyText')}
              </Button>
            </div>

            {/* Category Selector */}
            <div className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t('selectCategory')}
                </span>
                <Popover
                  open={showAddCategory}
                  onOpenChange={setShowAddCategory}
                  trigger="click"
                  content={
                    <div className="w-64 space-y-4">
                      <Input
                        placeholder={t('categoryName')}
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="!rounded-lg"
                      />
                      <Input
                        placeholder={t('categoryLabel')}
                        value={newCategory.label}
                        onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                        className="!rounded-lg"
                      />
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={newCategory.color}
                          onChange={(e) =>
                            setNewCategory({ ...newCategory, color: e.target.value })
                          }
                          className="!h-10 !w-16 !rounded-lg !p-1"
                        />
                        <span className="text-sm text-gray-500">选择颜色</span>
                      </div>
                      <Button
                        type="primary"
                        block
                        onClick={handleAddCategory}
                        className="!rounded-lg"
                      >
                        {tCommon('confirm')}
                      </Button>
                    </div>
                  }
                >
                  <Button
                    icon={<PlusOutlined />}
                    type="text"
                    size="small"
                    className="!text-primary-600"
                  >
                    添加
                  </Button>
                </Popover>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                      ${
                        selectedCategory?.id === cat.id
                          ? 'text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105'
                      }
                    `}
                    style={{
                      backgroundColor: selectedCategory?.id === cat.id ? cat.color : undefined,
                      boxShadow:
                        selectedCategory?.id === cat.id ? `0 4px 14px ${cat.color}40` : undefined,
                    }}
                  >
                    {selectedCategory?.id === cat.id && <CheckOutlined className="mr-1.5" />}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Grid */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[60px_1fr]">
                {HOURS.map((hour) => {
                  const block = getBlockForHour(hour)
                  const isCurrentHour =
                    dayjs().hour() === hour && selectedDate.isSame(dayjs(), 'day')

                  return (
                    <div key={hour} className="contents">
                      {/* Time Label */}
                      <div
                        className={`
                          flex h-12 items-center justify-end border-b border-r border-gray-200/50 dark:border-gray-700/50 pr-3 text-sm
                          ${isCurrentHour ? 'bg-primary-50 dark:bg-primary-900/20 font-semibold text-primary-600' : 'text-gray-500'}
                        `}
                      >
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </div>
                      {/* Time Slot */}
                      <button
                        type="button"
                        className={`
                          relative flex h-12 w-full items-center border-b border-gray-200/50 dark:border-gray-700/50 px-4 text-left transition-all duration-200
                          ${
                            block
                              ? 'text-white'
                              : isCurrentHour
                                ? 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-100/50 dark:hover:bg-primary-900/20'
                                : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                          }
                        `}
                        style={{
                          backgroundColor: block?.category.color,
                        }}
                        onClick={() => handleTimeSlotClick(hour)}
                      >
                        {block && (
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <span className="h-2 w-2 rounded-full bg-white/50" />#
                            {block.category.name}
                          </span>
                        )}
                        {isCurrentHour && !block && (
                          <span className="absolute right-3 h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 font-display text-lg font-bold text-gray-900 dark:text-white">
                今日统计
              </h3>
              <div className="mb-6 text-center">
                <div className="font-display text-5xl font-bold gradient-text">{totalHours}</div>
                <div className="mt-1 text-sm text-gray-500">小时已记录</div>
              </div>
              <div className="space-y-3">
                {categoryStats
                  .filter((c) => c.hours > 0)
                  .map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {cat.label}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cat.hours}h
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Generated Text Preview */}
            {blocks.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="mb-4 font-display text-lg font-bold text-gray-900 dark:text-white">
                  {t('generateText')}
                </h3>
                <pre className="whitespace-pre-wrap rounded-xl bg-gray-100/50 dark:bg-gray-800/50 p-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                  {generateText()}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
