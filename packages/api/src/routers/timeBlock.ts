import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const timeBlockRouter = createTRPCRouter({
  // Get all categories for a user
  getCategories: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.timeBlockCategory.findMany({
        where: { userId: input.userId },
        orderBy: { sortOrder: 'asc' },
      })
    }),

  // Create a new category
  createCategory: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        label: z.string(),
        color: z.string(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const maxOrder = await ctx.prisma.timeBlockCategory.findFirst({
        where: { userId: input.userId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      })

      return ctx.prisma.timeBlockCategory.create({
        data: {
          ...input,
          sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
        },
      })
    }),

  // Update category
  updateCategory: publicProcedure
    .input(
      z.object({
        id: z.string(),
        label: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.timeBlockCategory.update({
        where: { id },
        data,
      })
    }),

  // Delete category
  deleteCategory: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.timeBlockCategory.delete({
        where: { id: input.id },
      })
    }),

  // Get time blocks for a specific date
  getByDate: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        date: z.string(), // ISO date string "2024-01-15"
      })
    )
    .query(async ({ ctx, input }) => {
      const dateStart = new Date(input.date)
      dateStart.setHours(0, 0, 0, 0)

      return ctx.prisma.timeBlock.findMany({
        where: {
          userId: input.userId,
          date: dateStart,
        },
        include: {
          category: true,
        },
        orderBy: { startTime: 'asc' },
      })
    }),

  // Get time blocks for a date range
  getByDateRange: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const start = new Date(input.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(input.endDate)
      end.setHours(23, 59, 59, 999)

      return ctx.prisma.timeBlock.findMany({
        where: {
          userId: input.userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          category: true,
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      })
    }),

  // Create a new time block
  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        categoryId: z.string(),
        date: z.string(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dateObj = new Date(input.date)
      dateObj.setHours(0, 0, 0, 0)

      return ctx.prisma.timeBlock.create({
        data: {
          userId: input.userId,
          categoryId: input.categoryId,
          date: dateObj,
          startTime: input.startTime,
          endTime: input.endTime,
          note: input.note,
        },
        include: {
          category: true,
        },
      })
    }),

  // Quick create - click on time slot with selected category
  quickCreate: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        categoryId: z.string(),
        date: z.string(),
        hour: z.number().min(0).max(23), // Hour slot (0-23)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dateObj = new Date(input.date)
      dateObj.setHours(0, 0, 0, 0)

      const startTime = `${input.hour.toString().padStart(2, '0')}:00`
      const endTime = `${(input.hour + 1).toString().padStart(2, '0')}:00`

      return ctx.prisma.timeBlock.create({
        data: {
          userId: input.userId,
          categoryId: input.categoryId,
          date: dateObj,
          startTime,
          endTime,
        },
        include: {
          category: true,
        },
      })
    }),

  // Update time block
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        categoryId: z.string().optional(),
        startTime: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .optional(),
        endTime: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.timeBlock.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      })
    }),

  // Delete time block
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.prisma.timeBlock.delete({
      where: { id: input.id },
    })
  }),

  // Generate formatted text output for a date
  generateText: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        date: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dateObj = new Date(input.date)
      dateObj.setHours(0, 0, 0, 0)

      const blocks = await ctx.prisma.timeBlock.findMany({
        where: {
          userId: input.userId,
          date: dateObj,
        },
        include: {
          category: true,
        },
        orderBy: { startTime: 'asc' },
      })

      // Generate text like "10:00-11:00 #longTerm"
      const lines = blocks.map(
        (block) =>
          `${block.startTime}-${block.endTime} #${block.category.name}${
            block.note ? ` ${block.note}` : ''
          }`
      )

      return {
        text: lines.join('\n'),
        blocks,
      }
    }),
})
