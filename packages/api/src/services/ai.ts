/**
 * AI Service - 统一的 AI 提供商接口
 * 支持: OpenRouter, DeepSeek
 */

interface AIConfig {
  provider: 'openrouter' | 'deepseek'
  apiKey: string
  model?: string
}

interface GeneratedQuestion {
  question: string
  category: string
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

    // 根据提供商设置 baseURL 和默认模型
    if (config.provider === 'openrouter') {
      this.baseURL = 'https://openrouter.ai/api/v1'
      this.defaultModel = config.model || 'anthropic/claude-3.5-sonnet' // OpenRouter 上的 Claude
    } else if (config.provider === 'deepseek') {
      this.baseURL = 'https://api.deepseek.com/v1'
      this.defaultModel = config.model || 'deepseek-chat'
    } else {
      throw new Error(`Unsupported AI provider: ${config.provider}`)
    }
  }

  /**
   * 生成一个深度思考问题
   */
  async generateQuestion(category?: string): Promise<GeneratedQuestion> {
    const questions = await this.generateQuestions(1, category ? [category] : undefined)
    return questions[0]
  }

  /**
   * 批量生成深度思考问题
   */
  async generateQuestions(count = 5, categories?: string[]): Promise<GeneratedQuestion[]> {
    const categoryHint = categories?.length
      ? `问题类别应该从以下选择: ${categories.join(', ')}`
      : '问题类别可以是: reflection(反思), planning(规划), gratitude(感恩), growth(成长), relationships(人际关系), values(价值观)'

    const prompt = `你是一个专业的人生教练和心理咨询师。请生成 ${count} 个深度思考问题，帮助用户进行自我反思和成长。

要求：
1. 问题要具有深度，能触发真正的思考
2. 问题要具体，不要太抽象
3. 问题要能帮助用户了解自己、规划未来或改善生活
4. ${categoryHint}
5. 每个问题都应该是开放性的，没有标准答案
6. 问题应该用中文表达，贴近中国文化语境

请以 JSON 格式返回，格式如下：
[
  {
    "question": "问题文本",
    "category": "问题类别"
  }
]

只返回 JSON，不要其他解释。`

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          ...(this.config.provider === 'openrouter' && {
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
          ...(this.config.provider === 'openrouter' && {
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
  provider?: string
  apiKey?: string
  model?: string
}): AIService | null {
  // 优先使用自定义配置，否则使用环境变量
  const provider = (customConfig?.provider || process.env.AI_PROVIDER) as
    | 'openrouter'
    | 'deepseek'
    | undefined
  const apiKey =
    customConfig?.apiKey ||
    (provider === 'openrouter'
      ? process.env.OPENROUTER_API_KEY
      : provider === 'deepseek'
        ? process.env.DEEPSEEK_API_KEY
        : undefined)

  if (!provider || !apiKey) {
    console.warn('AI service not configured. Set AI_PROVIDER and corresponding API key.')
    return null
  }

  return new AIService({
    provider,
    apiKey,
    model: customConfig?.model || process.env.AI_MODEL,
  })
}
