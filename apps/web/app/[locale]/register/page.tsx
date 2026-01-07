'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link, useRouter } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Form, Input } from 'antd'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function RegisterPage() {
  const { message } = App.useApp()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // @ts-expect-error - tRPC v11 RC type compatibility
  const registerMutation = trpc.auth.register.useMutation()

  // Handle mutation result
  // biome-ignore lint/correctness/useExhaustiveDependencies: message is a stable ref
  useEffect(() => {
    if (registerMutation.isSuccess) {
      message.success('注册成功，请登录')
      router.push('/login')
    }
    if (registerMutation.error) {
      const error = registerMutation.error as { data?: { code?: string }; message?: string }
      if (error.data?.code === 'CONFLICT') {
        message.error('该邮箱已被注册')
      } else {
        message.error('注册失败，请稍后重试')
      }
    }
  }, [registerMutation.isSuccess, registerMutation.error, router])

  const handleSubmit = async (values: { email: string; password: string; name?: string }) => {
    setLoading(true)
    try {
      registerMutation.mutate({
        email: values.email,
        password: values.password,
        name: values.name,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Animated background orbs */}
      <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl animate-pulse-soft" />
      <div
        className="absolute bottom-1/3 left-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl animate-pulse-soft"
        style={{ animationDelay: '1.5s' }}
      />

      {/* Header */}
      <header className="absolute right-6 top-6 z-20 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>

      {/* Left side - Register form */}
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
                {t('register')}
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">创建账号，开启高效生活</p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
              <Form.Item name="name">
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder={t('name')}
                  className="!rounded-xl !py-3"
                />
              </Form.Item>

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
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading || registerMutation.isPending}
                  className="!h-12 !rounded-xl !text-base !font-semibold btn-glow"
                >
                  {t('register')}
                </Button>
              </Form.Item>

              <div className="text-center">
                <span className="text-gray-500 dark:text-gray-400">{t('hasAccount')} </span>
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                >
                  {t('loginNow')}
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
              数据安全
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              免费使用
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="relative hidden w-1/2 flex-col justify-center p-16 lg:flex">
        <div className="relative z-10 stagger-children">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            开始你的高效之旅
          </div>

          <h1 className="font-display text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            加入
            <span className="block mt-2 gradient-text">{tCommon('appName')}</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            每天花几分钟记录时间，回答一个深度问题， 让每一天都变得更有意义。
          </p>

          {/* Benefits */}
          <div className="mt-12 space-y-4">
            {[
              { icon: '✨', text: '简单直观的界面设计' },
              { icon: '🔒', text: '数据加密，隐私安全' },
              { icon: '☁️', text: '云端同步，多设备访问' },
              { icon: '🎯', text: '培养反思习惯，持续成长' },
            ].map((benefit, i) => (
              <div
                key={benefit.text}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                style={{ animationDelay: `${200 + i * 50}ms` }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 dark:bg-gray-800/50 text-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  {benefit.icon}
                </span>
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
