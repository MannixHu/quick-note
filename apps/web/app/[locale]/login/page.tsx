'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Tag, Typography, message } from 'antd'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const { Title, Text } = Typography

export default function LoginPage() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isApiAvailable, setIsApiAvailable] = useState(true)

  const [form] = Form.useForm()

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      message.success('登录成功')
      localStorage.setItem('user', JSON.stringify(data.user))
      document.cookie = `auth-token=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 7}`
      const redirectUrl =
        new URLSearchParams(window.location.search).get('redirect') || '/time-blocks'
      router.push(redirectUrl)
    },
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        message.error('邮箱或密码错误')
      } else {
        setIsApiAvailable(false)
        handleDemoLogin()
      }
    },
  })

  const handleDemoLogin = () => {
    message.success('登录成功 (Demo模式)')
    localStorage.setItem('user', JSON.stringify({ id: 'demo-user-123', name: 'Demo User' }))
    document.cookie = `auth-token=demo-user-123; path=/; max-age=${60 * 60 * 24 * 7}`
    const redirectUrl =
      new URLSearchParams(window.location.search).get('redirect') || '/time-blocks'
    router.push(redirectUrl)
  }

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
    <main className="flex min-h-screen items-center justify-center p-6">
      <header className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>

      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Title level={2} className="!mb-2">
            {tCommon('appName')}
          </Title>
          <div className="flex items-center justify-center gap-2">
            <Text type="secondary">{t('login')}</Text>
            {!isApiAvailable && <Tag color="orange">离线模式</Tag>}
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder={t('email')} size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('password')} size="large" />
          </Form.Item>

          <div className="mb-4 text-right">
            <Link href="/forgot-password" className="text-sm">
              {t('forgotPassword')}
            </Link>
          </div>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading || loginMutation.isPending}
            >
              {t('login')}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text type="secondary">{t('noAccount')} </Text>
            <Link href="/register">{t('registerNow')}</Link>
          </div>
        </Form>
      </Card>
    </main>
  )
}
