const createNextIntlPlugin = require('next-intl/plugin')
const path = require('node:path')

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@app/api', '@app/db', '@app/shared'],

  // Turbopack 配置
  turbopack: {
    root: '../../',
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Add package aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@app/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@app/api': path.resolve(__dirname, '../../packages/api/src'),
      '@app/db': path.resolve(__dirname, '../../packages/db/src'),
    }

    // Only in client bundle, optimize Ant Design icons
    if (!isServer) {
      config.resolve.alias['@ant-design/icons$'] = '@ant-design/icons/lib/icons'
    }
    return config
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental features for optimization
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons', 'framer-motion'],
  },

  // Standalone output for Docker
  output: 'standalone',
}

module.exports = withNextIntl(nextConfig)
