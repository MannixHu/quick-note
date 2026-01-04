const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@app/api', '@app/db', '@app/shared'],
  // Turbopack 配置
  turbopack: {
    root: '../../',
  },
}

module.exports = withNextIntl(nextConfig)
