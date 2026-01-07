'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const { Title, Text, Paragraph } = Typography

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (_values: { email: string }) => {
    setLoading(true)
    try {
      // TODO: 实现发送重置密码邮件的 API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
      message.success('重置链接已发送到您的邮箱')
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
            {t('resetPassword')}
          </Title>
          <Text type="secondary">
            {submitted ? '请查收邮件' : '输入您的邮箱地址，我们将发送重置链接'}
          </Text>
        </div>

        {submitted ? (
          <div className="text-center">
            <Paragraph>
              重置密码的链接已发送到您的邮箱，请查收并按照邮件中的指引重置密码。
            </Paragraph>
            <Paragraph type="secondary" className="text-sm">
              没有收到邮件？请检查垃圾邮件文件夹，或稍后重试。
            </Paragraph>
            <Link href="/login">
              <Button type="primary" icon={<ArrowLeftOutlined />} className="mt-4">
                返回登录
              </Button>
            </Link>
          </div>
        ) : (
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

            <Form.Item className="mb-4">
              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                发送重置链接
              </Button>
            </Form.Item>

            <div className="text-center">
              <Link href="/login">
                <Button type="link" icon={<ArrowLeftOutlined />}>
                  返回登录
                </Button>
              </Link>
            </div>
          </Form>
        )}
      </Card>
    </main>
  )
}
