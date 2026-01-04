'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/lib/i18n/routing'
import { Button, Typography } from 'antd'
import { useTranslations } from 'next-intl'

const { Title, Paragraph } = Typography

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <Title>{t('title')}</Title>
      <Paragraph className="text-center text-gray-500 dark:text-gray-400">
        {t('description')}
      </Paragraph>
      <div className="mt-8 flex gap-4">
        <Link href="/dashboard">
          <Button type="primary" size="large">
            {t('getStarted')}
          </Button>
        </Link>
        <Link href="/api/health">
          <Button size="large">{t('apiHealth')}</Button>
        </Link>
      </div>
    </main>
  )
}
