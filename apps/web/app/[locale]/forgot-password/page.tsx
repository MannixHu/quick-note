'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { ArrowLeftOutlined, CheckCircleOutlined, MailOutlined } from '@ant-design/icons'
import { App, Button, Form, Input } from 'antd'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const { message } = App.useApp()
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Animated background orbs */}
      <div className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl animate-pulse-soft" />
      <div
        className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl animate-pulse-soft"
        style={{ animationDelay: '1s' }}
      />

      {/* Header */}
      <header className="absolute right-4 md:right-6 top-4 md:top-6 z-20 flex items-center gap-2 md:gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>

      {/* Back button */}
      <Link href="/login" className="absolute left-4 md:left-6 top-4 md:top-6 z-20">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="!text-gray-600 dark:!text-gray-400 hover:!text-primary-600 dark:hover:!text-primary-400"
        >
          返回登录
        </Button>
      </Link>

      {/* Main content */}
      <div className="relative w-full max-w-md p-6 animate-scale-in">
        <div className="glass rounded-2xl p-8 shadow-xl">
          {submitted ? (
            <div className="text-center stagger-children">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircleOutlined className="text-4xl text-emerald-500" />
              </div>

              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                邮件已发送
              </h2>

              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                重置密码的链接已发送到您的邮箱，请查收并按照邮件中的指引重置密码。
              </p>

              <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
                没有收到邮件？请检查垃圾邮件文件夹，或稍后重试。
              </p>

              <Link href="/login">
                <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  className="!mt-8 !h-12 !rounded-xl !text-base !font-semibold"
                >
                  返回登录
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                  <MailOutlined className="text-3xl text-amber-500" />
                </div>

                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                  {t('resetPassword')}
                </h2>

                <p className="mt-3 text-gray-500 dark:text-gray-400">
                  输入您的邮箱地址，我们将发送重置链接
                </p>
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

                <Form.Item className="mb-4 mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    className="!h-12 !rounded-xl !text-base !font-semibold btn-glow"
                  >
                    发送重置链接
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </div>

        {/* Help text */}
        <p className="mt-8 text-center text-sm text-gray-400">
          记得密码了？{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
          >
            立即登录
          </Link>
        </p>
      </div>
    </main>
  )
}
