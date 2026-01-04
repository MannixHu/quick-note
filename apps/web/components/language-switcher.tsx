'use client'

import { type Locale, locales } from '@/lib/i18n/config'
import { usePathname, useRouter } from '@/lib/i18n/routing'
import { GlobalOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { useLocale, useTranslations } from 'next-intl'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('language')

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }

  const items: MenuProps['items'] = locales.map((loc) => ({
    key: loc,
    label: t(loc),
    onClick: () => handleLocaleChange(loc),
  }))

  return (
    <Dropdown menu={{ items, selectedKeys: [locale] }} trigger={['click']}>
      <Button shape="circle" icon={<GlobalOutlined />} />
    </Dropdown>
  )
}
