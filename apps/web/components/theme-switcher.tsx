'use client'

import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const t = useTranslations('theme')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button shape="circle" icon={<SunOutlined />} />
  }

  const items: MenuProps['items'] = [
    {
      key: 'light',
      label: t('light'),
      icon: <SunOutlined />,
      onClick: () => setTheme('light'),
    },
    {
      key: 'dark',
      label: t('dark'),
      icon: <MoonOutlined />,
      onClick: () => setTheme('dark'),
    },
    {
      key: 'system',
      label: t('system'),
      icon: <DesktopOutlined />,
      onClick: () => setTheme('system'),
    },
  ]

  const currentIcon = resolvedTheme === 'dark' ? <MoonOutlined /> : <SunOutlined />

  return (
    <Dropdown menu={{ items, selectedKeys: [theme || 'system'] }} trigger={['click']}>
      <Button shape="circle" icon={currentIcon} />
    </Dropdown>
  )
}
