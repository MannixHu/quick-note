'use client'

import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const t = useTranslations('theme')
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    // Start 1 second hover timer
    hoverTimerRef.current = setTimeout(() => {
      setDropdownOpen(true)
    }, 1000)
  }, [])

  const handleMouseLeave = useCallback(() => {
    // Clear timer if mouse leaves before 1 second
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }, [])

  const handleClick = useCallback(() => {
    // Clear hover timer on click
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    // If dropdown is open, don't toggle - let the dropdown handle it
    if (dropdownOpen) {
      return
    }
    // Toggle between light and dark
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }, [dropdownOpen, resolvedTheme, setTheme])

  const handleMenuClick = useCallback(
    (key: string) => {
      setTheme(key)
      setDropdownOpen(false)
    },
    [setTheme]
  )

  if (!mounted) {
    return <Button shape="circle" icon={<SunOutlined />} />
  }

  const items: MenuProps['items'] = [
    {
      key: 'light',
      label: t('light'),
      icon: <SunOutlined />,
      onClick: () => handleMenuClick('light'),
    },
    {
      key: 'dark',
      label: t('dark'),
      icon: <MoonOutlined />,
      onClick: () => handleMenuClick('dark'),
    },
    {
      key: 'system',
      label: t('system'),
      icon: <DesktopOutlined />,
      onClick: () => handleMenuClick('system'),
    },
  ]

  const currentIcon =
    theme === 'system' ? (
      <DesktopOutlined />
    ) : resolvedTheme === 'dark' ? (
      <MoonOutlined />
    ) : (
      <SunOutlined />
    )

  return (
    <Dropdown
      menu={{ items, selectedKeys: [theme || 'system'] }}
      open={dropdownOpen}
      onOpenChange={(open) => {
        // Only close when clicking outside, not when selecting
        if (!open) setDropdownOpen(false)
      }}
      trigger={[]}
    >
      <Button
        shape="circle"
        icon={currentIcon}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </Dropdown>
  )
}
