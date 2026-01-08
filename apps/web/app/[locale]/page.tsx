'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link, useRouter } from '@/lib/i18n/routing'
import { ClockCircleOutlined, LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { message } = App.useApp()
  const t = useTranslations('home')
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
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

  const modules = [
    {
      icon: <ClockCircleOutlined className="text-4xl" />,
      title: t('features.timeBlock'),
      description: t('features.timeBlockDesc'),
      href: '/time-blocks',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-500',
      hoverBg: 'hover:bg-blue-500/5',
    },
    {
      icon: <QuestionCircleOutlined className="text-4xl" />,
      title: t('features.dailyQuestion'),
      description: t('features.dailyQuestionDesc'),
      href: '/daily-question',
      gradient: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconColor: 'text-purple-500',
      hoverBg: 'hover:bg-purple-500/5',
    },
  ]

  return (
    <main className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-6 py-4">
        <div className="font-display text-xl font-bold gradient-text">快记</div>
        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {isLoggedIn && (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="!text-gray-500 hover:!text-red-500"
            >
              退出
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 md:px-6 py-8 md:py-12">
        {/* Welcome text */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {isLoggedIn ? '欢迎回来' : t('title')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {isLoggedIn ? '选择一个模块开始' : t('description')}
          </p>
        </div>

        {/* Module Cards - Quick Access */}
        <div className="grid w-full max-w-3xl gap-4 md:gap-6 md:grid-cols-2">
          {modules.map((module) => (
            <Link key={module.href} href={module.href} className="block">
              <div
                className={
                  'group relative h-full overflow-hidden rounded-2xl glass p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-primary-500/30'
                }
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.08]`}
                />

                {/* Icon */}
                <div
                  className={`mb-4 md:mb-6 inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl ${module.bgColor} ${module.iconColor} transition-all duration-300 group-hover:scale-110`}
                >
                  {module.icon}
                </div>

                {/* Content */}
                <h2 className="mb-2 md:mb-3 font-display text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {module.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {module.description}
                </p>

                {/* Click hint */}
                <div className="mt-4 md:mt-6 flex items-center text-sm font-medium text-primary-600 dark:text-primary-400">
                  点击进入
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Login hint for non-logged users */}
        {!isLoggedIn && (
          <div className="mt-8 md:mt-12 flex items-center gap-3 md:gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>还没有账号？</span>
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              登录
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              注册
            </Link>
          </div>
        )}
      </div>

      {/* Simple footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
        快记 QuickNote
      </footer>
    </main>
  )
}
