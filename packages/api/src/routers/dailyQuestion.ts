import { z } from 'zod'
import { createAIService } from '../services/ai'
import { createTRPCRouter, publicProcedure } from '../trpc'

// Sample thought-provoking questions
const SAMPLE_QUESTIONS = [
  // Reflection
  { question: '今天最让你感到有成就感的事情是什么？', category: 'reflection' },
  { question: '如果今天可以重来，你会做什么不同的选择？', category: 'reflection' },
  { question: '最近学到的最重要的一课是什么？', category: 'reflection' },
  { question: '什么事情一直在消耗你的能量，但你还没有处理？', category: 'reflection' },
  { question: '你最近一次真正开心是什么时候？当时在做什么？', category: 'reflection' },

  // Planning
  { question: '如果你只能完成今天的一件事，那会是什么？', category: 'planning' },
  { question: '五年后的你会感谢今天的你做了什么决定？', category: 'planning' },
  { question: '有什么事情你一直拖延，但其实只需要5分钟就能完成？', category: 'planning' },
  { question: '你目前最重要的三个目标是什么？今天为它们做了什么？', category: 'planning' },

  // Gratitude
  { question: '今天有什么值得感恩的小事？', category: 'gratitude' },
  { question: '生活中有谁是你一直想感谢但还没说出口的？', category: 'gratitude' },
  { question: '你拥有的什么东西是很多人梦寐以求的？', category: 'gratitude' },

  // Growth
  { question: '你最害怕的事情是什么？如果克服它会怎样？', category: 'growth' },
  { question: '如果你知道不会失败，你会尝试什么？', category: 'growth' },
  { question: '你的舒适区边界在哪里？最近有没有尝试突破？', category: 'growth' },
  { question: '什么习惯如果坚持一年，会彻底改变你的生活？', category: 'growth' },

  // Relationships
  { question: '你最近和谁的关系需要修复或加深？', category: 'relationships' },
  { question: '你希望别人如何记住你？', category: 'relationships' },
  { question: '谁是你生活中最重要的人？你有多久没有认真和他们交流了？', category: 'relationships' },

  // Values
  { question: '你最近的行为和你的价值观一致吗？', category: 'values' },
  { question: '如果明天就是生命的最后一天，你今天会做什么？', category: 'values' },
  { question: '什么事情让你忘记时间的流逝？', category: 'values' },
  { question: '你最自豪的个人品质是什么？', category: 'values' },
]

export const dailyQuestionRouter = createTRPCRouter({
  // Initialize questions in database (run once)
  seedQuestions: publicProcedure.mutation(async ({ ctx }) => {
    const existingCount = await ctx.prisma.dailyQuestion.count()
    if (existingCount > 0) {
      return { message: 'Questions already seeded', count: existingCount }
    }

    await ctx.prisma.dailyQuestion.createMany({
      data: SAMPLE_QUESTIONS,
    })

    return { message: 'Questions seeded successfully', count: SAMPLE_QUESTIONS.length }
  }),

  // Get today's question for a user
  getTodayQuestion: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if user already has a question assigned for today
      let userDailyQuestion = await ctx.prisma.userDailyQuestion.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: today,
          },
        },
        include: {
          question: true,
        },
      })

      if (!userDailyQuestion) {
        // Get a random question that user hasn't seen recently
        const recentQuestionIds = await ctx.prisma.userDailyQuestion.findMany({
          where: { userId: input.userId },
          orderBy: { date: 'desc' },
          take: 10,
          select: { questionId: true },
        })

        const excludeIds = recentQuestionIds.map((q) => q.questionId)

        // Find a question not in recent list
        const availableQuestions = await ctx.prisma.dailyQuestion.findMany({
          where: {
            id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
          },
        })

        // If all questions have been used, get any random one
        const questions =
          availableQuestions.length > 0
            ? availableQuestions
            : await ctx.prisma.dailyQuestion.findMany()

        if (questions.length === 0) {
          return null
        }

        const randomQuestion = questions[Math.floor(Math.random() * questions.length)]

        userDailyQuestion = await ctx.prisma.userDailyQuestion.create({
          data: {
            userId: input.userId,
            questionId: randomQuestion.id,
            date: today,
          },
          include: {
            question: true,
          },
        })
      }

      // Get user's answer if exists
      const answer = await ctx.prisma.questionAnswer.findUnique({
        where: {
          userId_questionId_date: {
            userId: input.userId,
            questionId: userDailyQuestion.questionId,
            date: today,
          },
        },
      })

      return {
        ...userDailyQuestion,
        answer: answer?.answer || null,
      }
    }),

  // Answer today's question
  answerQuestion: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        questionId: z.string(),
        answer: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Create or update answer
      const result = await ctx.prisma.questionAnswer.upsert({
        where: {
          userId_questionId_date: {
            userId: input.userId,
            questionId: input.questionId,
            date: today,
          },
        },
        create: {
          userId: input.userId,
          questionId: input.questionId,
          answer: input.answer,
          date: today,
        },
        update: {
          answer: input.answer,
        },
      })

      // Mark as answered
      await ctx.prisma.userDailyQuestion.updateMany({
        where: {
          userId: input.userId,
          date: today,
        },
        data: { answered: true },
      })

      return result
    }),

  // Get answer history
  getAnswerHistory: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.questionAnswer.findMany({
        where: { userId: input.userId },
        include: {
          question: true,
        },
        orderBy: { date: 'desc' },
        take: input.limit,
      })
    }),

  // Get all questions (for admin)
  getAllQuestions: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.dailyQuestion.findMany({
      orderBy: { category: 'asc' },
    })
  }),

  // Add new question (for admin)
  addQuestion: publicProcedure
    .input(
      z.object({
        question: z.string().min(1),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dailyQuestion.create({
        data: input,
      })
    }),

  // ============================================
  // AI-Generated Questions
  // ============================================

  /**
   * 使用 AI 生成新问题并保存到数据库
   * 需要配置 AI_PROVIDER 和对应的 API Key
   */
  generateAIQuestions: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(20).default(5),
        categories: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const aiService = createAIService()

      if (!aiService) {
        throw new Error(
          'AI service not configured. Please set AI_PROVIDER and corresponding API key in environment variables.'
        )
      }

      try {
        // 使用 AI 生成问题
        const generatedQuestions = await aiService.generateQuestions(input.count, input.categories)

        // 保存到数据库
        const created = await ctx.prisma.dailyQuestion.createMany({
          data: generatedQuestions,
          skipDuplicates: true,
        })

        return {
          success: true,
          count: created.count,
          questions: generatedQuestions,
        }
      } catch (error) {
        console.error('AI generation error:', error)
        throw new Error(`Failed to generate AI questions: ${(error as Error).message}`)
      }
    }),

  /**
   * 为用户生成个性化的今日问题（基于历史回答）
   * 如果 AI 未配置或失败，降级到数据库随机问题
   */
  getTodayQuestionWithAI: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        usePersonalization: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 检查是否已有今日问题
      let userDailyQuestion = await ctx.prisma.userDailyQuestion.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: today,
          },
        },
        include: {
          question: true,
        },
      })

      if (userDailyQuestion) {
        // 已有问题，直接返回
        const answer = await ctx.prisma.questionAnswer.findUnique({
          where: {
            userId_questionId_date: {
              userId: input.userId,
              questionId: userDailyQuestion.questionId,
              date: today,
            },
          },
        })

        return {
          ...userDailyQuestion,
          answer: answer?.answer || null,
          source: 'existing' as const,
        }
      }

      // 尝试使用 AI 生成个性化问题
      const aiService = createAIService()
      let newQuestion: { question: string; category: string } | null = null
      let source: 'ai' | 'database' = 'database'

      if (aiService && input.usePersonalization) {
        try {
          // 获取用户最近的回答历史
          const answerHistory = await ctx.prisma.questionAnswer.findMany({
            where: { userId: input.userId },
            include: { question: true },
            orderBy: { date: 'desc' },
            take: 5,
          })

          if (answerHistory.length > 0) {
            // 生成个性化问题
            const generated = await aiService.generatePersonalizedQuestion(
              answerHistory.map((a) => ({
                question: a.question.question,
                answer: a.answer,
                date: a.date,
              }))
            )

            newQuestion = generated
            source = 'ai'
          }
        } catch (error) {
          console.error('AI personalization failed, fallback to database:', error)
        }
      }

      // 如果 AI 生成失败或未启用，从数据库随机选择
      if (!newQuestion) {
        const recentQuestionIds = await ctx.prisma.userDailyQuestion.findMany({
          where: { userId: input.userId },
          orderBy: { date: 'desc' },
          take: 10,
          select: { questionId: true },
        })

        const excludeIds = recentQuestionIds.map((q) => q.questionId)

        const availableQuestions = await ctx.prisma.dailyQuestion.findMany({
          where: {
            id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
          },
        })

        const questions =
          availableQuestions.length > 0
            ? availableQuestions
            : await ctx.prisma.dailyQuestion.findMany()

        if (questions.length === 0) {
          throw new Error('No questions available in database')
        }

        const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
        newQuestion = {
          question: randomQuestion.question,
          category: randomQuestion.category || 'reflection',
        }
      }

      // 如果是 AI 生成的，先保存到数据库
      let questionRecord: { id: string; question: string; category: string | null }
      if (source === 'ai') {
        questionRecord = await ctx.prisma.dailyQuestion.create({
          data: {
            question: newQuestion.question,
            category: newQuestion.category,
          },
        })
      } else {
        // 从数据库查询已有问题
        const found = await ctx.prisma.dailyQuestion.findFirst({
          where: { question: newQuestion.question },
        })
        if (!found) {
          throw new Error('Question not found in database')
        }
        questionRecord = found
      }

      // 创建用户每日问题记录
      userDailyQuestion = await ctx.prisma.userDailyQuestion.create({
        data: {
          userId: input.userId,
          questionId: questionRecord.id,
          date: today,
        },
        include: {
          question: true,
        },
      })

      return {
        ...userDailyQuestion,
        answer: null,
        source,
      }
    }),

  /**
   * 检查 AI 服务状态
   */
  checkAIStatus: publicProcedure.query(() => {
    const provider = process.env.AI_PROVIDER
    const hasKey =
      (provider === 'openrouter' && !!process.env.OPENROUTER_API_KEY) ||
      (provider === 'deepseek' && !!process.env.DEEPSEEK_API_KEY)

    return {
      configured: !!provider && hasKey,
      provider: provider || 'none',
      model: process.env.AI_MODEL || 'default',
    }
  }),
})
