'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button, FadeIn, PageTransition, SlideUp } from '@/components/ui'
import { Link, useRouter } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { App, Form, Input, Steps } from 'antd'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

type Step = 'email' | 'verify' | 'success'

export default function ForgotPasswordPage() {
  const { message } = App.useApp()
  const t = useTranslations('auth')
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [emailForm] = Form.useForm()
  const [verifyForm] = Form.useForm()

  // tRPC mutations
  // @ts-expect-error - tRPC v11 RC type compatibility
  const sendCodeMutation = trpc.auth.sendEmailCode.useMutation()
  // @ts-expect-error - tRPC v11 RC type compatibility
  const verifyCodeMutation = trpc.auth.verifyEmailCode.useMutation()
  // @ts-expect-error - tRPC v11 RC type compatibility
  const resetPasswordMutation = trpc.auth.resetPasswordWithCode.useMutation()

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Handle send code
  const handleSendCode = useCallback(
    async (values: { email: string }) => {
      try {
        await sendCodeMutation.mutateAsync({ email: values.email, type: 'reset_password' })
        setEmail(values.email)
        setStep('verify')
        setCountdown(60)
        message.success('验证码已发送到您的邮箱')
      } catch (error) {
        const err = error as { message?: string }
        message.error(err.message || '发送验证码失败')
      }
    },
    [sendCodeMutation, message]
  )

  // Handle resend code
  const handleResendCode = useCallback(async () => {
    if (countdown > 0) return
    try {
      await sendCodeMutation.mutateAsync({ email, type: 'reset_password' })
      setCountdown(60)
      message.success('验证码已重新发送')
    } catch (error) {
      const err = error as { message?: string }
      message.error(err.message || '发送验证码失败')
    }
  }, [email, countdown, sendCodeMutation, message])

  // Handle verify and reset password
  const handleVerifyAndReset = useCallback(
    async (values: { code: string; password: string }) => {
      try {
        // First verify the code
        await verifyCodeMutation.mutateAsync({ email, code: values.code, type: 'reset_password' })

        // Then reset password
        await resetPasswordMutation.mutateAsync({
          email,
          code: values.code,
          newPassword: values.password,
        })

        setStep('success')
        message.success('密码重置成功')
      } catch (error) {
        const err = error as { message?: string }
        message.error(err.message || '重置密码失败')
      }
    },
    [email, verifyCodeMutation, resetPasswordMutation, message]
  )

  // Go back to email step
  const handleBack = useCallback(() => {
    setStep('email')
    verifyForm.resetFields()
  }, [verifyForm])

  // Navigate to login
  const handleGoToLogin = useCallback(() => {
    router.push('/login')
  }, [router])

  return (
    <PageTransition>
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 gradient-mesh" />

        {/* Animated background orbs */}
        <motion.div
          className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />

        {/* Header */}
        <FadeIn delay={0.2}>
          <header className="absolute right-4 md:right-6 top-4 md:top-6 z-20 flex items-center gap-2 md:gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </header>
        </FadeIn>

        {/* Back button */}
        <FadeIn delay={0.1}>
          <Link href="/login" className="absolute left-4 md:left-6 top-4 md:top-6 z-20">
            <button
              type="button"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeftOutlined />
              <span>返回登录</span>
            </button>
          </Link>
        </FadeIn>

        {/* Main content */}
        <SlideUp delay={0.2} className="relative w-full max-w-md p-6">
          <motion.div
            className="glass rounded-2xl p-8 shadow-xl"
            whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            transition={{ duration: 0.3 }}
          >
            {/* Success state */}
            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                >
                  <CheckCircleOutlined className="text-4xl text-emerald-500" />
                </motion.div>

                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                  密码重置成功
                </h2>

                <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  您的密码已成功重置，现在可以使用新密码登录了。
                </p>

                <Button
                  variant="primary"
                  onClick={handleGoToLogin}
                  className="!mt-8 !h-12 !rounded-xl !text-base !font-semibold"
                >
                  立即登录
                </Button>
              </motion.div>
            )}

            {/* Email and verify steps */}
            {step !== 'success' && (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                    {step === 'email' ? (
                      <MailOutlined className="text-2xl text-amber-500" />
                    ) : (
                      <SafetyOutlined className="text-2xl text-amber-500" />
                    )}
                  </div>

                  <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                    {t('resetPassword')}
                  </h2>

                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {step === 'email' ? '输入邮箱获取验证码' : '输入验证码和新密码'}
                  </p>
                </div>

                {/* Progress steps */}
                <div className="mb-6">
                  <Steps
                    size="small"
                    current={step === 'email' ? 0 : 1}
                    items={[{ title: '验证邮箱' }, { title: '重置密码' }]}
                  />
                </div>

                {/* Step 1: Email input */}
                {step === 'email' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Form form={emailForm} layout="vertical" onFinish={handleSendCode} size="large">
                      <Form.Item
                        name="email"
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '请输入有效的邮箱' },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined className="text-gray-400" />}
                          placeholder={t('email')}
                          className="!rounded-xl !py-3"
                        />
                      </Form.Item>

                      <Form.Item className="mb-4 mt-6">
                        <Button
                          variant="primary"
                          htmlType="submit"
                          block
                          isLoading={sendCodeMutation.isPending}
                          className="!h-12 !rounded-xl !text-base !font-semibold btn-glow"
                        >
                          获取验证码
                        </Button>
                      </Form.Item>
                    </Form>
                  </motion.div>
                )}

                {/* Step 2: Verification and new password */}
                {step === 'verify' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Form
                      form={verifyForm}
                      layout="vertical"
                      onFinish={handleVerifyAndReset}
                      size="large"
                    >
                      {/* Show email with back button */}
                      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          <ArrowLeftOutlined className="text-xs" />
                          返回
                        </button>
                        <span className="flex-1 truncate text-right">{email}</span>
                      </div>

                      <Form.Item
                        name="code"
                        rules={[
                          { required: true, message: '请输入验证码' },
                          { len: 6, message: '验证码为6位数字' },
                        ]}
                      >
                        <Input
                          prefix={<SafetyOutlined className="text-gray-400" />}
                          placeholder="6位验证码"
                          maxLength={6}
                          className="!rounded-xl !py-3 !tracking-[0.5em] !text-center !font-mono"
                        />
                      </Form.Item>

                      {/* Resend button */}
                      <div className="mb-4 text-center">
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={countdown > 0 || sendCodeMutation.isPending}
                          className={`text-sm ${
                            countdown > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-primary-600 hover:text-primary-700 dark:text-primary-400'
                          }`}
                        >
                          {countdown > 0 ? `${countdown}秒后重新发送` : '重新发送验证码'}
                        </button>
                      </div>

                      <Form.Item
                        name="password"
                        rules={[
                          { required: true, message: '请输入新密码' },
                          { min: 6, message: '密码至少6位' },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="新密码"
                          className="!rounded-xl !py-3"
                        />
                      </Form.Item>

                      <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                          { required: true, message: '请确认新密码' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve()
                              }
                              return Promise.reject(new Error('两次输入的密码不一致'))
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="确认新密码"
                          className="!rounded-xl !py-3"
                        />
                      </Form.Item>

                      <Form.Item className="mb-4 mt-6">
                        <Button
                          variant="primary"
                          htmlType="submit"
                          block
                          isLoading={
                            verifyCodeMutation.isPending || resetPasswordMutation.isPending
                          }
                          className="!h-12 !rounded-xl !text-base !font-semibold btn-glow"
                        >
                          重置密码
                        </Button>
                      </Form.Item>
                    </Form>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>

          {/* Help text */}
          {step !== 'success' && (
            <FadeIn delay={0.4}>
              <p className="mt-8 text-center text-sm text-gray-400">
                记得密码了？{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                >
                  立即登录
                </Link>
              </p>
            </FadeIn>
          )}
        </SlideUp>
      </main>
    </PageTransition>
  )
}
