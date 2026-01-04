'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { ClockCircleOutlined, QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Card, Typography } from 'antd'
import { useTranslations } from 'next-intl'

const { Title, Paragraph, Text } = Typography

export default function HomePage() {
  const t = useTranslations('home')

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
