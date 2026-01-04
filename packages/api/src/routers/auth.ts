import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

// Generate 6-digit SMS code
function generateSmsCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const authRouter = createTRPCRouter({
  // Register with email and password
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
        },
      })

      // Create default time block categories for new user
      await ctx.prisma.timeBlockCategory.createMany({
        data: [
          { userId: user.id, name: 'longTerm', label: '长期目标', color: '#1677ff', sortOrder: 0 },
          { userId: user.id, name: 'work', label: '工作', color: '#52c41a', sortOrder: 1 },
          { userId: user.id, name: 'study', label: '学习', color: '#722ed1', sortOrder: 2 },
          { userId: user.id, name: 'rest', label: '休息', color: '#faad14', sortOrder: 3 },
          { userId: user.id, name: 'exercise', label: '运动', color: '#eb2f96', sortOrder: 4 },
        ],
      })

      return { success: true, userId: user.id }
    }),

  // Login with email and password
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!user || !user.password) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        })
      }

      const validPassword = await bcrypt.compare(input.password, user.password)
      if (!validPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        })
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      }
    }),

  // Send SMS verification code
  sendSmsCode: publicProcedure
    .input(
      z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number'),
        type: z.enum(['login', 'register', 'reset_password']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const code = generateSmsCode()
      const expires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      // Mark old codes as used
      await ctx.prisma.smsVerification.updateMany({
        where: {
          phone: input.phone,
          used: false,
        },
        data: { used: true },
      })

      // Create new verification code
      await ctx.prisma.smsVerification.create({
        data: {
          phone: input.phone,
          code,
          type: input.type,
          expires,
        },
      })

      // TODO: Integrate with actual SMS service (Aliyun SMS, Tencent SMS, etc.)
      // For now, log the code (only in development)
      console.log(`SMS Code for ${input.phone}: ${code}`)

      return { success: true, message: 'Verification code sent' }
    }),

  // Verify SMS code and login/register
  verifySmsCode: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        code: z.string().length(6),
        type: z.enum(['login', 'register', 'reset_password']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const verification = await ctx.prisma.smsVerification.findFirst({
        where: {
          phone: input.phone,
          code: input.code,
          type: input.type,
          used: false,
          expires: { gt: new Date() },
        },
      })

      if (!verification) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired verification code',
        })
      }

      // Mark code as used
      await ctx.prisma.smsVerification.update({
        where: { id: verification.id },
        data: { used: true },
      })

      // Find or create user
      let user = await ctx.prisma.user.findUnique({
        where: { phone: input.phone },
      })

      if (!user) {
        // Create new user for SMS login
        user = await ctx.prisma.user.create({
          data: { phone: input.phone },
        })

        // Create default categories
        await ctx.prisma.timeBlockCategory.createMany({
          data: [
            {
              userId: user.id,
              name: 'longTerm',
              label: '长期目标',
              color: '#1677ff',
              sortOrder: 0,
            },
            { userId: user.id, name: 'work', label: '工作', color: '#52c41a', sortOrder: 1 },
            { userId: user.id, name: 'study', label: '学习', color: '#722ed1', sortOrder: 2 },
            { userId: user.id, name: 'rest', label: '休息', color: '#faad14', sortOrder: 3 },
            { userId: user.id, name: 'exercise', label: '运动', color: '#eb2f96', sortOrder: 4 },
          ],
        })
      }

      return {
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
        },
      }
    }),

  // Reset password
  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        newPassword: z.string().min(6),
        code: z.string().length(6).optional(), // SMS code if using phone
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.phone && input.code) {
        // Verify SMS code first
        const verification = await ctx.prisma.smsVerification.findFirst({
          where: {
            phone: input.phone,
            code: input.code,
            type: 'reset_password',
            used: false,
            expires: { gt: new Date() },
          },
        })

        if (!verification) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid or expired verification code',
          })
        }

        await ctx.prisma.smsVerification.update({
          where: { id: verification.id },
          data: { used: true },
        })

        const hashedPassword = await bcrypt.hash(input.newPassword, 10)
        await ctx.prisma.user.update({
          where: { phone: input.phone },
          data: { password: hashedPassword },
        })

        return { success: true }
      }

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Phone and verification code required',
      })
    }),

  // Get current user profile
  me: protectedProcedure.query(async ({ ctx: _ctx }) => {
    // TODO: Get user from session context
    return null
  }),
})
