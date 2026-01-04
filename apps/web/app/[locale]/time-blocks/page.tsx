'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import { ArrowLeftOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, DatePicker, Input, Popover, Tag, Typography, message } from 'antd'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

const { Title, Text } = Typography

// Demo user ID - in production this would come from auth context
const DEMO_USER_ID = 'demo-user-123'

// Generate hours array (0-23)
const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Default categories for demo/fallback
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'longTerm', label: '长期目标', color: '#1677ff' },
  { id: '2', name: 'work', label: '工作', color: '#52c41a' },
  { id: '3', name: 'study', label: '学习', color: '#722ed1' },
  { id: '4', name: 'rest', label: '休息', color: '#faad14' },
  { id: '5', name: 'exercise', label: '运动', color: '#eb2f96' },
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
  const t = useTranslations('timeBlock')
  const tCommon = useTranslations('common')

  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', label: '', color: '#1677ff' })
  const [isApiAvailable, setIsApiAvailable] = useState(true)

  // tRPC queries with fallback
  const categoriesQuery = trpc.timeBlock.getCategories.useQuery(
    { userId: DEMO_USER_ID },
    {
      enabled: isApiAvailable,
      retry: 1,
      onError: () => setIsApiAvailable(false),
    }
  )

  const blocksQuery = trpc.timeBlock.getByDate.useQuery(
    { userId: DEMO_USER_ID, date: selectedDate.format('YYYY-MM-DD') },
    {
      enabled: isApiAvailable,
      retry: 1,
      onError: () => setIsApiAvailable(false),
    }
  )

  // tRPC mutations
  const quickCreateMutation = trpc.timeBlock.quickCreate.useMutation({
    onSuccess: (newBlock) => {
      const block: TimeBlock = {
        id: newBlock.id,
        startTime: newBlock.startTime,
        endTime: newBlock.endTime,
        category: newBlock.category as Category,
        note: newBlock.note,
      }
      setBlocks((prev) => [...prev, block].sort((a, b) => a.startTime.localeCompare(b.startTime)))
    },
    onError: () => setIsApiAvailable(false),
  })

  const deleteMutation = trpc.timeBlock.delete.useMutation({
    onSuccess: (_, variables) => {
      setBlocks((prev) => prev.filter((b) => b.id !== variables.id))
    },
    onError: () => setIsApiAvailable(false),
  })

  const createCategoryMutation = trpc.timeBlock.createCategory.useMutation({
    onSuccess: (newCat) => {
      const cat: Category = {
        id: newCat.id,
        name: newCat.name,
        label: newCat.label,
        color: newCat.color,
      }
      setCategories((prev) => [...prev, cat])
    },
    onError: () => setIsApiAvailable(false),
  })

  // Sync API data to local state
  useEffect(() => {
    if (categoriesQuery.data && categoriesQuery.data.length > 0) {
      setCategories(
        categoriesQuery.data.map((c) => ({
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
      setBlocks(
        blocksQuery.data.map((b) => ({
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
    message.success(tCommon('copied'))
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

    setNewCategory({ name: '', label: '', color: '#1677ff' })
    setShowAddCategory(false)
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
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-4xl">
        {/* Date Picker & Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            allowClear={false}
          />
          <Button icon={<CopyOutlined />} onClick={handleCopyText}>
            {t('copyText')}
          </Button>
        </div>

        {/* Category Selector */}
        <Card className="mb-6" size="small">
          <div className="flex flex-wrap items-center gap-2">
            <Text strong className="mr-2">
              {t('selectCategory')}:
            </Text>
            {categories.map((cat) => (
              <Tag
                key={cat.id}
                color={selectedCategory?.id === cat.id ? cat.color : undefined}
                className={`cursor-pointer transition-all ${
                  selectedCategory?.id === cat.id
                    ? 'ring-2 ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  borderColor: cat.color,
                  backgroundColor: selectedCategory?.id === cat.id ? cat.color : 'transparent',
                  color: selectedCategory?.id === cat.id ? '#fff' : cat.color,
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.label}
              </Tag>
            ))}
            <Popover
              open={showAddCategory}
              onOpenChange={setShowAddCategory}
              trigger="click"
              content={
                <div className="w-64 space-y-3">
                  <Input
                    placeholder={t('categoryName')}
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <Input
                    placeholder={t('categoryLabel')}
                    value={newCategory.label}
                    onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                  />
                  <Input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="h-10 w-full"
                  />
                  <Button type="primary" block onClick={handleAddCategory}>
                    {tCommon('confirm')}
                  </Button>
                </div>
              }
            >
              <Tag icon={<PlusOutlined />} className="cursor-pointer border-dashed">
                {t('addCategory')}
              </Tag>
            </Popover>
          </div>
        </Card>

        {/* Time Grid */}
        <Card>
          <div className="grid grid-cols-[60px_1fr] gap-0">
            {HOURS.map((hour) => {
              const block = getBlockForHour(hour)
              return (
                <div key={hour} className="contents">
                  {/* Time Label */}
                  <div className="flex h-12 items-center justify-end border-b border-r pr-2 text-sm text-gray-500">
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </div>
                  {/* Time Slot */}
                  <button
                    type="button"
                    className={`flex h-12 w-full cursor-pointer items-center border-b px-3 text-left transition-colors ${
                      block ? 'text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      backgroundColor: block?.category.color,
                    }}
                    onClick={() => handleTimeSlotClick(hour)}
                  >
                    {block && <span className="text-sm font-medium">#{block.category.name}</span>}
                  </button>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Generated Text Preview */}
        {blocks.length > 0 && (
          <Card className="mt-6" title={t('generateText')}>
            <pre className="whitespace-pre-wrap rounded bg-gray-100 p-4 text-sm dark:bg-gray-800">
              {generateText()}
            </pre>
          </Card>
        )}
      </div>
    </main>
  )
}
