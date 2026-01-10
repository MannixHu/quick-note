export const APP_NAME = 'Universal App'
export const APP_VERSION = '0.1.0'

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  TRPC: '/api/trpc',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

// INTP-based Question Tags for Daily Questions
export const QUESTION_TAGS = {
  THINKING: 'thinking', // 思维探索 - 逻辑分析、抽象概念
  INTROSPECTION: 'introspection', // 自我认知 - 内省、情绪觉察
  LEARNING: 'learning', // 学习成长 - 知识获取、技能提升
  POSSIBILITIES: 'possibilities', // 可能性探索 - 假设推演、创意想象
  OPTIMIZATION: 'optimization', // 效率优化 - 流程改进、系统构建
  SOCIAL: 'social', // 人际洞察 - 关系理解、沟通反思
  VALUES: 'values', // 价值追问 - 人生意义、核心价值
  ACTION: 'action', // 行动复盘 - 执行反思、习惯养成
} as const

export const QUESTION_TAG_LABELS: Record<string, string> = {
  [QUESTION_TAGS.THINKING]: '思维探索 🧠',
  [QUESTION_TAGS.INTROSPECTION]: '自我认知 🔍',
  [QUESTION_TAGS.LEARNING]: '学习成长 📚',
  [QUESTION_TAGS.POSSIBILITIES]: '可能性探索 🌌',
  [QUESTION_TAGS.OPTIMIZATION]: '效率优化 ⚙️',
  [QUESTION_TAGS.SOCIAL]: '人际洞察 👥',
  [QUESTION_TAGS.VALUES]: '价值追问 💎',
  [QUESTION_TAGS.ACTION]: '行动复盘 🎯',
}

export type QuestionTag = (typeof QUESTION_TAGS)[keyof typeof QUESTION_TAGS]

// Recommendation settings
export const RECOMMENDATION = {
  PREFERENCE_RATIO: 0.6, // 60% based on user preference
  RANDOM_RATIO: 0.4, // 40% random (anti-filter-bubble)
} as const
