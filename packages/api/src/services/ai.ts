/**
 * AI Service - 统一的 AI 提供商接口
 * 支持: OpenRouter, DeepSeek
 */

interface AIConfig {
  apiKey: string
  model?: string
  baseURL: string // API 地址
  prompt?: string // 自定义生成问题的提示词
}

interface GeneratedQuestion {
  question: string
  category: string
  tag: string // INTP-based tag
}

/**
 * AI 服务类
 */
export class AIService {
  private config: AIConfig
  private baseURL: string
  private defaultModel: string

  constructor(config: AIConfig) {
    this.config = config
    this.baseURL = config.baseURL.replace(/\/$/, '') // 移除末尾斜杠

    // 根据 baseURL 自动设置默认模型
    if (config.model) {
      this.defaultModel = config.model
    } else if (this.baseURL.includes('openrouter')) {
      this.defaultModel = 'anthropic/claude-3.5-sonnet'
    } else if (this.baseURL.includes('deepseek')) {
      this.defaultModel = 'deepseek-chat'
    } else {
      this.defaultModel = 'gpt-3.5-turbo'
    }
  }

  /**
   * 测试 API 连接是否正常
   * @returns 返回延迟时间（毫秒）和模型信息
   */
  /**
   * 判断是否是 OpenRouter 服务
   */
  private isOpenRouter(): boolean {
    return this.baseURL.includes('openrouter')
  }

  async ping(): Promise<{ latency: number; model: string; baseURL: string }> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          ...(this.isOpenRouter() && {
            'HTTP-Referer': 'https://github.com/mannix-lei/quick-note',
            'X-Title': 'QuickNote App',
          }),
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: 'user',
              content: 'Hi',
            },
          ],
          max_tokens: 5,
        }),
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`API error: ${response.status} - ${error}`)
      }

      return {
        latency,
        model: this.defaultModel,
        baseURL: this.baseURL,
      }
    } catch (error) {
      const latency = Date.now() - startTime
      throw new Error(
        `Connection failed (${latency}ms): ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * 生成一个深度思考问题
   */
  async generateQuestion(category?: string): Promise<GeneratedQuestion> {
    const questions = await this.generateQuestions(1, category ? [category] : undefined)
    if (!questions[0]) {
      throw new Error('Failed to generate question')
    }
    return questions[0]
  }

  /**
   * 批量生成深度思考问题
   */
  async generateQuestions(count = 5, categories?: string[]): Promise<GeneratedQuestion[]> {
    // 可选的类别列表
    const categoryList = categories?.length
      ? categories.join(', ')
      : 'reflection, planning, gratitude, growth, relationships, values, logic, philosophy, creativity, psychology'

    // 固定的标签列表
    const tagList = 'thinking, introspection, learning, possibilities, optimization, social, values, action'

    // 用户可自定义的角色提示词（描述AI的角色和风格）
    const defaultRolePrompt = `你是一个专业的人生教练和心理咨询师。请生成深度思考问题，帮助用户进行自我反思和成长。

要求：
1. 问题要具有深度，能触发真正的思考
2. 问题要具体，不要太抽象
3. 问题要能帮助用户了解自己、规划未来或改善生活
4. 每个问题都应该是开放性的，没有标准答案
5. 问题应该用中文表达，贴近中国文化语境`

    const rolePrompt = this.config.prompt || defaultRolePrompt

    // 固定的格式要求（代码依赖，不可自定义）
    const formatPrompt = `
请生成 ${count} 个问题。

category 必须从以下选择: ${categoryList}
tag 必须从以下选择: ${tagList}

请以 JSON 格式返回，格式如下：
[
  {
    "question": "问题文本",
    "category": "类别(英文)",
    "tag": "标签(英文)"
  }
]

只返回 JSON，不要其他解释。`

    const prompt = rolePrompt + formatPrompt

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          ...(this.isOpenRouter() && {
            'HTTP-Referer': 'https://github.com/your-repo', // OpenRouter 要求
            'X-Title': 'QuickNote App',
          }),
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AI API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content in AI response')
      }

      // 解析 JSON 响应
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON in AI response')
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0])

      // 验证格式
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format')
      }

      return questions.slice(0, count)
    } catch (error) {
      console.error('AI generation error:', error)
      throw error
    }
  }

  /**
   * 根据用户历史回答生成个性化问题
   */
  async generatePersonalizedQuestion(
    userAnswerHistory: { question: string; answer: string; date: Date }[]
  ): Promise<GeneratedQuestion> {
    const recentAnswers = userAnswerHistory
      .slice(0, 5)
      .map((a) => `问题: ${a.question}\n回答: ${a.answer}`)
      .join('\n\n')

    const prompt = `你是一个专业的人生教练。根据用户最近的回答历史，生成一个能帮助用户深入思考的新问题。

用户最近的回答：
${recentAnswers}

要求：
1. 基于用户的回答内容，生成一个延续性的、有针对性的问题
2. 问题要能帮助用户更深入地探索自己
3. 不要重复用户已经回答过的问题
4. 用中文表达

请以 JSON 格式返回：
{
  "question": "问题文本",
  "category": "问题类别 (reflection/planning/gratitude/growth/relationships/values)"
}

只返回 JSON，不要其他解释。`

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          ...(this.isOpenRouter() && {
            'HTTP-Referer': 'https://github.com/your-repo',
            'X-Title': 'QuickNote App',
          }),
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AI API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content in AI response')
      }

      // 解析 JSON 响应
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON in AI response')
      }

      const question: GeneratedQuestion = JSON.parse(jsonMatch[0])

      // 验证格式
      if (!question.question || !question.category) {
        throw new Error('Invalid question format')
      }

      return question
    } catch (error) {
      console.error('AI personalized generation error:', error)
      throw error
    }
  }
}

/**
 * 创建 AI 服务实例的工厂函数
 * @param customConfig 可选的自定义配置（从前端传入）
 */
export function createAIService(customConfig?: {
  apiKey?: string
  model?: string
  baseURL?: string
  prompt?: string
}): AIService | null {
  const apiKey = customConfig?.apiKey || process.env.AI_API_KEY
  const baseURL = customConfig?.baseURL || process.env.AI_BASE_URL

  if (!apiKey || !baseURL) {
    console.warn('AI service not configured. Set AI_BASE_URL and AI_API_KEY.')
    return null
  }

  return new AIService({
    apiKey,
    baseURL,
    model: customConfig?.model || process.env.AI_MODEL,
    prompt: customConfig?.prompt,
  })
}
