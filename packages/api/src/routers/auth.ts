import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { EmailService, createEmailService } from '../services/email'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

// Generate 6-digit SMS code
function generateSmsCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Rate limiting constants
const EMAIL_CODE_COOLDOWN = 60 * 1000 // 60 seconds between sends
const EMAIL_CODE_EXPIRY = 10 * 60 * 1000 // 10 minutes validity
const MAX_VERIFY_ATTEMPTS = 5 // Max failed attempts before lockout
const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000 // Clean up codes older than 24 hours

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

  // Send email verification code
  sendEmailCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        type: z.enum(['register', 'reset_password']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check rate limit - find most recent code for this email/type
      const recentCode = await ctx.prisma.emailVerification.findFirst({
        where: {
          email: input.email,
          type: input.type,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (recentCode) {
        const timeSinceLastSend = Date.now() - recentCode.createdAt.getTime()
        if (timeSinceLastSend < EMAIL_CODE_COOLDOWN) {
          const waitSeconds = Math.ceil((EMAIL_CODE_COOLDOWN - timeSinceLastSend) / 1000)
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: `请等待 ${waitSeconds} 秒后再试`,
          })
        }
      }

      // For register type, check if email already exists
      if (input.type === 'register') {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        })
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '该邮箱已注册',
          })
        }
      }

      // For reset_password type, check if email exists
      if (input.type === 'reset_password') {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        })
        if (!existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '该邮箱未注册',
          })
        }
      }

      // Mark old codes as used
      await ctx.prisma.emailVerification.updateMany({
        where: {
          email: input.email,
          type: input.type,
          used: false,
        },
        data: { used: true },
      })

      // Cleanup: Delete old verification codes (older than 24 hours)
      // This runs asynchronously and doesn't block the response
      ctx.prisma.emailVerification
        .deleteMany({
          where: {
            createdAt: { lt: new Date(Date.now() - CLEANUP_THRESHOLD) },
          },
        })
        .catch((err) => console.error('Failed to cleanup old verification codes:', err))

      // Generate new code
      const code = EmailService.generateCode()
      const expires = new Date(Date.now() + EMAIL_CODE_EXPIRY)

      // Save to database
      await ctx.prisma.emailVerification.create({
        data: {
          email: input.email,
          code,
          type: input.type,
          expires,
        },
      })

      // Send email
      const emailService = createEmailService()
      if (emailService) {
        const result =
          input.type === 'register'
            ? await emailService.sendVerificationCode(input.email, code)
            : await emailService.sendPasswordResetCode(input.email, code)

        if (!result.success) {
          console.error('Failed to send email:', result.error)
          // Still return success - code is saved, user can retry
        }
      } else {
        // Development mode - log the code
        console.log(`[DEV] Email code for ${input.email}: ${code}`)
      }

      return { success: true, message: '验证码已发送' }
    }),

  // Verify email code
  verifyEmailCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
        type: z.enum(['register', 'reset_password']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the verification record
      const verification = await ctx.prisma.emailVerification.findFirst({
        where: {
          email: input.email,
          type: input.type,
          used: false,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!verification) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '验证码不存在或已过期',
        })
      }

      // Check if expired
      if (verification.expires < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '验证码已过期，请重新获取',
        })
      }

      // Check attempts
      if (verification.attempts >= MAX_VERIFY_ATTEMPTS) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: '验证次数过多，请重新获取验证码',
        })
      }

      // Verify code
      if (verification.code !== input.code) {
        // Increment attempts
        await ctx.prisma.emailVerification.update({
          where: { id: verification.id },
          data: { attempts: verification.attempts + 1 },
        })

        const remaining = MAX_VERIFY_ATTEMPTS - verification.attempts - 1
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `验证码错误，还剩 ${remaining} 次机会`,
        })
      }

      // Mark as used
      await ctx.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { used: true },
      })

      return { success: true, message: '验证成功' }
    }),

  // Register with email verification
  registerWithVerification: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the email code first
      const verification = await ctx.prisma.emailVerification.findFirst({
        where: {
          email: input.email,
          type: 'register',
          code: input.code,
          used: true, // Must have been verified
        },
        orderBy: { createdAt: 'desc' },
      })

      // Check if code was verified recently (within expiry time for security)
      if (!verification || Date.now() - verification.createdAt.getTime() > EMAIL_CODE_EXPIRY * 2) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '请先验证邮箱',
        })
      }

      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '该邮箱已注册',
        })
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          emailVerified: new Date(), // Mark as verified
        },
      })

      // Create default time block categories
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

  // Reset password with email verification
  resetPasswordWithCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the email code
      const verification = await ctx.prisma.emailVerification.findFirst({
        where: {
          email: input.email,
          type: 'reset_password',
          code: input.code,
          used: true, // Must have been verified
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!verification || Date.now() - verification.createdAt.getTime() > EMAIL_CODE_EXPIRY * 2) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '请先验证邮箱',
        })
      }

      // Find user
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      // Update password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10)
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      return { success: true, message: '密码重置成功' }
    }),
})
