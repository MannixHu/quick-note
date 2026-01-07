'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link, useRouter } from '@/lib/i18n/routing'
import {
  ClockCircleOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { Button, Card, Typography, message } from 'antd'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

const { Title, Paragraph, Text } = Typography

export default function HomePage() {
  const t = useTranslations('home')
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    setIsLoggedIn(!!user)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    document.cookie = 'auth-token=; path=/; max-age=0'
    setIsLoggedIn(false)
    message.success('已退出登录')
    router.push('/')
  }

  const features = [
    {
      icon: <ClockCircleOutlined className="text-3xl text-blue-500" />,
      title: t('features.timeBlock'),
      description: t('features.timeBlockDesc'),
      href: '/time-blocks',
    },
    {
      icon: <QuestionCircleOutlined className="text-3xl text-purple-500" />,
      title: t('features.dailyQuestion'),
      description: t('features.dailyQuestionDesc'),
      href: '/daily-question',
    },
    {
      icon: <SyncOutlined className="text-3xl text-green-500" />,
      title: t('features.sync'),
      description: t('features.syncDesc'),
      href: '#',
    },
  ]

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
        {isLoggedIn && <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} />}
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-24">
        <Title className="!mb-4 text-center">{t('title')}</Title>
        <Paragraph className="max-w-xl text-center text-lg text-gray-500 dark:text-gray-400">
          {t('description')}
        </Paragraph>
        <div className="mt-8 flex gap-4">
          <Link href="/login">
            <Button type="primary" size="large">
              {t('getStarted')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card hoverable className="h-full transition-all hover:shadow-lg">
                <div className="mb-4">{feature.icon}</div>
                <Text strong className="mb-2 block text-lg">
                  {feature.title}
                </Text>
                <Text type="secondary">{feature.description}</Text>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
