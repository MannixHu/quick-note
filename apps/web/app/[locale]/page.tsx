'use client'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button, FadeIn, PageTransition } from '@/components/ui'
import { useAuth } from '@/hooks'
import { Link } from '@/lib/i18n/routing'
import { BulbOutlined, HeartOutlined, RiseOutlined, RobotOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading while checking auth
  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      </PageTransition>
    )
  }

  const features = [
    {
      icon: <BulbOutlined className="text-2xl" />,
      title: '深度思考',
      description: 'AI 生成的问题帮助你探索内心',
    },
    {
      icon: <RobotOutlined className="text-2xl" />,
      title: '个性推荐',
      description: '根据评分偏好，推荐你喜欢的问题类型',
    },
    {
      icon: <RiseOutlined className="text-2xl" />,
      title: '成长追踪',
      description: '回顾历史回答，见证思考的成长',
    },
    {
      icon: <HeartOutlined className="text-2xl" />,
      title: '防止茧房',
      description: '30% 随机探索，拓展思维边界',
    },
  ]

  return (
    <PageTransition>
      <main className="relative min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        {/* Header */}
        <FadeIn delay={0.1}>
          <header className="relative z-20 flex items-center justify-between px-4 md:px-6 py-4">
            <motion.div
              className="font-display text-xl font-bold gradient-text"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              每日问答
            </motion.div>
            <div className="flex items-center gap-2 md:gap-3">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </header>
        </FadeIn>

        {/* Main Content */}
        <div className="relative flex h-[calc(100vh-56px)] flex-col items-center justify-center px-4 md:px-6 py-4">
          {/* Hero */}
          <FadeIn delay={0.2} className="mb-6 text-center max-w-2xl">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-2">
              每天一个问题
            </h1>
            <h2 className="font-display text-lg sm:text-xl text-gray-600 dark:text-gray-300 md:text-2xl mb-3">
              发现更好的自己
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
              AI 驱动的深度思考问题，帮助你进行自我反思和成长。
            </p>
          </FadeIn>

          {/* Features */}
          <FadeIn delay={0.3} className="mb-6 w-full max-w-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="glass rounded-xl p-3 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="mb-1.5 text-purple-500">{feature.icon}</div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.6}>
            <div className="flex flex-col items-center gap-3">
              <Link href="/daily_question">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="primary"
                    className="!px-12 !py-4 !text-xl !rounded-2xl !font-semibold shadow-lg shadow-primary-500/30"
                  >
                    {isAuthenticated ? '进入问答 →' : '开始探索 →'}
                  </Button>
                </motion.div>
              </Link>
              {!isAuthenticated && (
                <div className="flex items-center gap-3 text-sm text-gray-500">
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
          </FadeIn>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
          每日问答 Daily Question
        </footer>
      </main>
    </PageTransition>
  )
}
