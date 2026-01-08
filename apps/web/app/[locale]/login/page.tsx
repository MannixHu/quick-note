'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link, useRouter } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { App, Button, Form, Input, Tag } from 'antd'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const { message } = App.useApp()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isApiAvailable, setIsApiAvailable] = useState(true)

  const [form] = Form.useForm()

  // @ts-expect-error - tRPC v11 RC type compatibility
  const loginMutation = trpc.auth.login.useMutation()

  const handleDemoLogin = () => {
    message.success('登录成功 (Demo模式)')
    localStorage.setItem('user', JSON.stringify({ id: 'demo-user-123', name: 'Demo User' }))
    document.cookie = `auth-token=demo-user-123; path=/; max-age=${60 * 60 * 24 * 7}`
    const redirectUrl =
      new URLSearchParams(window.location.search).get('redirect') || '/time-blocks'
    router.push(redirectUrl as '/time-blocks')
  }

  // Handle mutation result
  // biome-ignore lint/correctness/useExhaustiveDependencies: message, router, handleDemoLogin are stable refs
  useEffect(() => {
    if (loginMutation.data) {
      const data = loginMutation.data as { user: { id: string; email: string; name?: string } }
      message.success('登录成功')
      localStorage.setItem('user', JSON.stringify(data.user))
      document.cookie = `auth-token=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 7}`
      const redirectUrl =
        new URLSearchParams(window.location.search).get('redirect') || '/time-blocks'
      router.push(redirectUrl as '/time-blocks')
    }
    if (loginMutation.error) {
      const error = loginMutation.error as { data?: { code?: string }; message?: string }
      if (error.data?.code === 'UNAUTHORIZED') {
        message.error('邮箱或密码错误')
      } else {
        setIsApiAvailable(false)
        handleDemoLogin()
      }
    }
  }, [loginMutation.data, loginMutation.error])

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      if (isApiAvailable) {
        loginMutation.mutate({
          email: values.email,
          password: values.password,
        })
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
        handleDemoLogin()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Animated background orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl animate-pulse-soft" />
      <div
        className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl animate-pulse-soft"
        style={{ animationDelay: '1s' }}
      />

      {/* Header */}
      <header className="absolute right-4 md:right-6 top-4 md:top-6 z-20 flex items-center gap-2 md:gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>

      {/* Left side - Branding */}
      <div className="relative hidden w-1/2 flex-col justify-center p-16 lg:flex">
        <div className="relative z-10 stagger-children">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400">
            <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            快速记录，高效生活
          </div>

          <h1 className="font-display text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            欢迎回到
            <span className="block mt-2 gradient-text">{tCommon('appName')}</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            用时间块记录每一天，用深度问题反思成长。 简单、高效、跨平台同步。
          </p>

          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-2 gap-6">
            {[
              { icon: '⏰', label: '时间块记录' },
              { icon: '💭', label: '每日问答' },
              { icon: '🔄', label: '实时同步' },
              { icon: '📱', label: '多端支持' },
            ].map((feature, i) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 rounded-xl bg-white/50 dark:bg-gray-800/50 p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                style={{ animationDelay: `${200 + i * 50}ms` }}
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-scale-in">
          {/* Glass card */}
          <div className="glass rounded-2xl p-8 shadow-xl">
            {/* Mobile logo */}
            <div className="mb-8 text-center lg:hidden">
              <h1 className="font-display text-3xl font-bold gradient-text">
                {tCommon('appName')}
              </h1>
            </div>

            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                {t('login')}
              </h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                <p className="text-gray-500 dark:text-gray-400">登录以继续使用</p>
                {!isApiAvailable && (
                  <Tag color="orange" className="!m-0">
                    离线模式
                  </Tag>
                )}
              </div>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
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

              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder={t('password')}
                  className="!rounded-xl !py-3"
                />
              </Form.Item>

              <div className="mb-6 flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              </div>

              <Form.Item className="mb-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading || loginMutation.isPending}
                  className="!h-12 !rounded-xl !text-base !font-semibold btn-glow"
                >
                  {t('login')}
                </Button>
              </Form.Item>

              <div className="text-center">
                <span className="text-gray-500 dark:text-gray-400">{t('noAccount')} </span>
                <Link
                  href="/register"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                >
                  {t('registerNow')}
                </Link>
              </div>
            </Form>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              安全加密
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              隐私保护
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
