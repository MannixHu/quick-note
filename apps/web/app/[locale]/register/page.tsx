'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button, FadeIn, PageTransition, SlideUp, StaggerChildren } from '@/components/ui'
import { Link, useRouter } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { App, Form, Input, Steps } from 'antd'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

type Step = 'email' | 'verify'

export default function RegisterPage() {
  const { message } = App.useApp()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
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
  const registerMutation = trpc.auth.registerWithVerification.useMutation()

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
        await sendCodeMutation.mutateAsync({ email: values.email, type: 'register' })
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
      await sendCodeMutation.mutateAsync({ email, type: 'register' })
      setCountdown(60)
      message.success('验证码已重新发送')
    } catch (error) {
      const err = error as { message?: string }
      message.error(err.message || '发送验证码失败')
    }
  }, [email, countdown, sendCodeMutation, message])

  // Handle verify and register
  const handleVerifyAndRegister = useCallback(
    async (values: { code: string; password: string; name?: string }) => {
      try {
        // First verify the code
        await verifyCodeMutation.mutateAsync({ email, code: values.code, type: 'register' })

        // Then register
        await registerMutation.mutateAsync({
          email,
          password: values.password,
          name: values.name,
          code: values.code,
        })

        message.success('注册成功，请登录')
        router.push('/login')
      } catch (error) {
        const err = error as { message?: string }
        message.error(err.message || '注册失败')
      }
    },
    [email, verifyCodeMutation, registerMutation, message, router]
  )

  // Go back to email step
  const handleBack = useCallback(() => {
    setStep('email')
    verifyForm.resetFields()
  }, [verifyForm])

  const benefits = [
    { icon: '✨', text: '简单直观的界面设计' },
    { icon: '🔒', text: '数据加密，隐私安全' },
    { icon: '☁️', text: '云端同步，多设备访问' },
    { icon: '🎯', text: '培养反思习惯，持续成长' },
  ]

  return (
    <PageTransition>
      <main className="relative flex min-h-screen overflow-hidden">
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 gradient-mesh" />

        {/* Animated background orbs */}
        <motion.div
          className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.3, 0.15],
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

        {/* Left side - Register form */}
        <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2">
          <SlideUp delay={0.2} className="w-full max-w-md">
            {/* Glass card */}
            <motion.div
              className="glass rounded-2xl p-8 shadow-xl"
              whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              {/* Mobile logo */}
              <div className="mb-8 text-center lg:hidden">
                <h1 className="font-display text-3xl font-bold gradient-text">
                  {tCommon('appName')}
                </h1>
              </div>

              <div className="mb-6 text-center">
                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                  {t('register')}
                </h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {step === 'email' ? '输入邮箱获取验证码' : '完成验证并设置密码'}
                </p>
              </div>

              {/* Progress steps */}
              <div className="mb-6">
                <Steps
                  size="small"
                  current={step === 'email' ? 0 : 1}
                  items={[{ title: '验证邮箱' }, { title: '设置密码' }]}
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

                    <Form.Item className="mb-6 mt-8">
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

              {/* Step 2: Verification and password */}
              {step === 'verify' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Form
                    form={verifyForm}
                    layout="vertical"
                    onFinish={handleVerifyAndRegister}
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

                    <Form.Item name="name">
                      <Input
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder={t('name')}
                        className="!rounded-xl !py-3"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[
                        { required: true, message: '请输入密码' },
                        { min: 6, message: '密码至少6位' },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder={t('password')}
                        className="!rounded-xl !py-3"
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: '请确认密码' },
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
                        placeholder={t('confirmPassword')}
                        className="!rounded-xl !py-3"
                      />
                    </Form.Item>

                    <Form.Item className="mb-6 mt-8">
                      <Button
                        variant="primary"
                        htmlType="submit"
                        block
                        isLoading={verifyCodeMutation.isPending || registerMutation.isPending}
                        className="!h-12 !rounded-xl !text-base !font-semibold btn-glow"
                      >
                        完成注册
                      </Button>
                    </Form.Item>
                  </Form>
                </motion.div>
              )}

              <div className="text-center">
                <span className="text-gray-500 dark:text-gray-400">{t('hasAccount')} </span>
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                >
                  {t('loginNow')}
                </Link>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <FadeIn delay={0.5}>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  数据安全
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  免费使用
                </span>
              </div>
            </FadeIn>
          </SlideUp>
        </div>

        {/* Right side - Branding */}
        <div className="relative hidden w-1/2 flex-col justify-center p-16 lg:flex">
          <div className="relative z-10">
            <SlideUp delay={0.1}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <motion.span
                  className="h-2 w-2 rounded-full bg-emerald-500"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                />
                开始你的高效之旅
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <h1 className="font-display text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                加入
                <span className="block mt-2 gradient-text">{tCommon('appName')}</span>
              </h1>
            </SlideUp>

            <SlideUp delay={0.3}>
              <p className="mt-6 max-w-md text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                每天花几分钟记录时间，回答一个深度问题， 让每一天都变得更有意义。
              </p>
            </SlideUp>

            {/* Benefits */}
            <StaggerChildren staggerDelay={0.1} className="mt-12 space-y-4">
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit.text}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <motion.span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 dark:bg-gray-800/50 text-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    {benefit.icon}
                  </motion.span>
                  <span className="font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
