'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const { Title, Text } = Typography

export default function RegisterPage() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      message.success('注册成功，请登录')
      router.push('/login')
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        message.error('该邮箱已被注册')
      } else {
        message.error('注册失败，请稍后重试')
      }
    },
  })

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
    <main className="flex min-h-screen items-center justify-center p-6">
      <header className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>

      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Title level={2} className="!mb-2">
            {tCommon('appName')}
          </Title>
          <Text type="secondary">{t('register')}</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name">
            <Input prefix={<UserOutlined />} placeholder={t('name')} size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder={t('email')} size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('password')} size="large" />
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
              prefix={<LockOutlined />}
              placeholder={t('confirmPassword')}
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading || registerMutation.isPending}
            >
              {t('register')}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text type="secondary">{t('hasAccount')} </Text>
            <Link href="/login">{t('loginNow')}</Link>
          </div>
        </Form>
      </Card>
    </main>
  )
}
