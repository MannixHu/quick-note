import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
      'apps/**/*.test.{ts,tsx}',
      'packages/**/*.test.{ts,tsx}',
    ],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    server: {
      deps: {
        inline: ['react', 'react-dom', '@testing-library/react'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/dist/**',
        '**/.next/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@/components': path.resolve(__dirname, './apps/web/components'),
      '@/hooks': path.resolve(__dirname, './apps/web/hooks'),
      '@/lib': path.resolve(__dirname, './apps/web/lib'),
      '@/styles': path.resolve(__dirname, './apps/web/styles'),
      '@app/api': path.resolve(__dirname, './packages/api/src'),
      '@app/db': path.resolve(__dirname, './packages/db/src'),
      '@app/shared': path.resolve(__dirname, './packages/shared/src'),
      // React resolution for monorepo
      react: path.resolve(__dirname, './apps/web/node_modules/react'),
      'react-dom': path.resolve(__dirname, './apps/web/node_modules/react-dom'),
    },
  },
})
