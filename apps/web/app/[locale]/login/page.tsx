'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { trpc } from '@/lib/trpc/client'
import { LockOutlined, MailOutlined, MobileOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Segmented, Tag, Typography, message } from 'antd'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const { Title, Text } = Typography

type LoginType = 'password' | 'sms'

export default function LoginPage() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [loginType, setLoginType] = useState<LoginType>('password')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isApiAvailable, setIsApiAvailable] = useState(true)

  const [form] = Form.useForm()

  // tRPC mutations
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      message.success('登录成功')
      // Store user info (in production, use proper session management)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/time-blocks')
    },
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        message.error('邮箱或密码错误')
      } else {
        setIsApiAvailable(false)
        // Fallback to demo login
        handleDemoLogin()
      }
    },
  })

  const sendSmsCodeMutation = trpc.auth.sendSmsCode.useMutation({
    onSuccess: () => {
      message.success('验证码已发送')
      startCountdown()
    },
    onError: () => {
      setIsApiAvailable(false)
      // Fallback: show demo code
      message.success('验证码已发送 (Demo: 123456)')
      startCountdown()
    },
  })

  const verifySmsCodeMutation = trpc.auth.verifySmsCode.useMutation({
    onSuccess: (data) => {
      message.success('登录成功')
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/time-blocks')
    },
    onError: (error) => {
      if (error.data?.code === 'BAD_REQUEST') {
        message.error('验证码无效或已过期')
      } else {
        setIsApiAvailable(false)
        // Fallback: check demo code
        const code = form.getFieldValue('code')
        if (code === '123456') {
          handleDemoLogin()
        } else {
          message.error('验证码错误')
        }
      }
    },
  })

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleDemoLogin = () => {
    message.success('登录成功 (Demo模式)')
    localStorage.setItem('user', JSON.stringify({ id: 'demo-user-123', name: 'Demo User' }))
    router.push('/time-blocks')
  }

  const handleSendCode = async () => {
    const phone = form.getFieldValue('phone')
    if (!phone) {
      message.warning('请输入手机号')
      return
    }

    // Validate phone format
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入有效的手机号')
      return
    }

    if (isApiAvailable) {
      sendSmsCodeMutation.mutate({ phone, type: 'login' })
    } else {
      // Fallback: demo mode
      message.success('验证码已发送 (Demo: 123456)')
      startCountdown()
    }
  }

  const handleSubmit = async (values: {
    email?: string
    password?: string
    phone?: string
    code?: string
  }) => {
    setLoading(true)
    try {
      if (loginType === 'password') {
        if (isApiAvailable && values.email && values.password) {
          loginMutation.mutate({
            email: values.email,
            password: values.password,
          })
        } else {
          // Demo login
          await new Promise((resolve) => setTimeout(resolve, 500))
          handleDemoLogin()
        }
      } else {
        if (isApiAvailable && values.phone && values.code) {
          verifySmsCodeMutation.mutate({
            phone: values.phone,
            code: values.code,
            type: 'login',
          })
        } else {
          // Demo login: accept code 123456
          await new Promise((resolve) => setTimeout(resolve, 500))
          if (values.code === '123456') {
            handleDemoLogin()
          } else {
            message.error('验证码错误 (Demo: 123456)')
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      {/* Header */}
      <header className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>

      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Title level={2} className="!mb-2">
            {tCommon('appName')}
          </Title>
          <div className="flex items-center justify-center gap-2">
            <Text type="secondary">{t('login')}</Text>
            {!isApiAvailable && <Tag color="orange">离线模式</Tag>}
          </div>
        </div>

        <Segmented
          block
          options={[
            { label: t('loginWithPassword'), value: 'password' },
            { label: t('loginWithSms'), value: 'sms' },
          ]}
          value={loginType}
          onChange={(value) => setLoginType(value as LoginType)}
          className="mb-6"
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {loginType === 'password' ? (
            <>
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
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder={t('password')}
                  size="large"
                />
              </Form.Item>
              <div className="mb-4 text-right">
                <Link href="/forgot-password" className="text-sm">
                  {t('forgotPassword')}
                </Link>
              </div>
            </>
          ) : (
            <>
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                ]}
              >
                <Input prefix={<MobileOutlined />} placeholder={t('phone')} size="large" />
              </Form.Item>
              <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
                <div className="flex gap-2">
                  <Input placeholder={t('smsCode')} size="large" className="flex-1" />
                  <Button
                    size="large"
                    disabled={countdown > 0}
                    onClick={handleSendCode}
                    loading={sendSmsCodeMutation.isLoading}
                  >
                    {countdown > 0 ? `${countdown}s` : t('sendCode')}
                  </Button>
                </div>
              </Form.Item>
            </>
          )}

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading || loginMutation.isLoading || verifySmsCodeMutation.isLoading}
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
