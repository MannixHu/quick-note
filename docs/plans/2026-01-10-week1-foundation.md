# Week 1: Foundation Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish the foundational infrastructure (directory structure, dependencies, configurations) for the comprehensive optimization.

**Architecture:** Maintain Turborepo monorepo structure, add hooks/ and components/ui/ directories, install animation and testing libraries, update TypeScript/Next.js configs for path aliases.

**Tech Stack:**
- Animation: Framer Motion
- Testing: Vitest, @testing-library/react, Playwright
- Build: Existing Next.js 15 + Turborepo

**Timeline:** Week 1, Day 1-2

---

## Task 1: Create New Directory Structure

**Files:**
- Create: `apps/web/hooks/.gitkeep`
- Create: `apps/web/components/ui/.gitkeep`
- Create: `apps/web/components/auth/.gitkeep`
- Create: `apps/web/components/time-blocks/.gitkeep`
- Create: `apps/web/components/daily-question/.gitkeep`
- Create: `apps/web/components/layout/.gitkeep`
- Create: `packages/api/src/services/.gitkeep`
- Create: `packages/api/src/middleware/.gitkeep`
- Create: `packages/shared/src/validators/.gitkeep`
- Create: `tests/unit/.gitkeep`
- Create: `tests/integration/.gitkeep`
- Create: `tests/e2e/.gitkeep`

**Step 1: Create frontend directories**

```bash
mkdir -p apps/web/hooks
mkdir -p apps/web/components/{ui,auth,time-blocks,daily-question,layout}
touch apps/web/hooks/.gitkeep
touch apps/web/components/ui/.gitkeep
touch apps/web/components/auth/.gitkeep
touch apps/web/components/time-blocks/.gitkeep
touch apps/web/components/daily-question/.gitkeep
touch apps/web/components/layout/.gitkeep
```

**Step 2: Create backend directories**

```bash
mkdir -p packages/api/src/services
mkdir -p packages/api/src/middleware
touch packages/api/src/services/.gitkeep
touch packages/api/src/middleware/.gitkeep
```

**Step 3: Create shared and test directories**

```bash
mkdir -p packages/shared/src/validators
mkdir -p tests/{unit,integration,e2e}
touch packages/shared/src/validators/.gitkeep
touch tests/unit/.gitkeep
touch tests/integration/.gitkeep
touch tests/e2e/.gitkeep
```

**Step 4: Verify directory structure**

Run: `tree -L 3 -d apps/web/components apps/web/hooks packages/api/src tests`

Expected output should show all new directories.

**Step 5: Commit directory structure**

```bash
git add apps/web/hooks apps/web/components packages/api/src/services packages/api/src/middleware packages/shared/src/validators tests
git commit -m "chore: add new directory structure for optimization

- Add hooks/ directory for custom React hooks
- Add components/ subdirectories by feature
- Add services/ and middleware/ for backend
- Add validators/ for Zod schemas
- Add tests/ structure for unit/integration/e2e

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Install Dependencies

**Files:**
- Modify: `package.json` (root)
- Modify: `apps/web/package.json`

**Step 1: Install animation library**

```bash
pnpm add framer-motion
```

Expected: framer-motion added to apps/web/package.json dependencies

**Step 2: Install testing libraries**

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected: Testing libraries added to root package.json devDependencies

**Step 3: Install Playwright for E2E**

```bash
pnpm add -D @playwright/test
```

Expected: Playwright added to root package.json devDependencies

**Step 4: Install type utilities**

```bash
pnpm add -D @types/node
```

Expected: @types/node added to devDependencies

**Step 5: Verify installations**

Run: `pnpm list framer-motion vitest @playwright/test`

Expected: All packages listed with versions

**Step 6: Commit dependencies**

```bash
git add package.json pnpm-lock.yaml apps/web/package.json
git commit -m "chore: add animation and testing dependencies

- Add framer-motion for animations
- Add vitest + testing-library for unit tests
- Add playwright for e2e tests
- Add @types/node for type support

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

**Step 1: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/dist/**',
        '**/.next/**'
      ]
    }
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
      '@app/shared': path.resolve(__dirname, './packages/shared/src')
    }
  }
})
```

**Step 2: Create test setup file**

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
```

**Step 3: Add test scripts to package.json**

Modify root `package.json`, add to scripts section:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

**Step 4: Test the configuration**

Run: `pnpm test --run`

Expected: "No test files found" (this is OK - we haven't created tests yet)

**Step 5: Commit test configuration**

```bash
git add vitest.config.ts tests/setup.ts package.json
git commit -m "chore: configure vitest for testing

- Add vitest config with jsdom environment
- Configure path aliases for imports
- Add test setup with localStorage and matchMedia mocks
- Add test scripts to package.json

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Configure Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/.gitkeep` (already exists)

**Step 1: Initialize Playwright**

Run: `pnpm exec playwright install --with-deps`

Expected: Chromium, Firefox, WebKit browsers installed

**Step 2: Create Playwright config**

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
```

**Step 3: Create example E2E test**

Create `tests/e2e/example.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/快记/)
})
```

**Step 4: Test Playwright setup**

Run: `pnpm test:e2e tests/e2e/example.spec.ts`

Expected: Test passes, homepage loads successfully

**Step 5: Commit Playwright configuration**

```bash
git add playwright.config.ts tests/e2e/example.spec.ts
git commit -m "chore: configure playwright for e2e testing

- Add playwright config with multiple browsers
- Configure webServer for auto-start
- Add example e2e test for homepage

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update TypeScript Configuration

**Files:**
- Modify: `tsconfig.json`
- Modify: `apps/web/tsconfig.json`

**Step 1: Update root tsconfig.json**

Modify `tsconfig.json`, ensure paths section exists:

```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./apps/web/components/*"],
      "@/hooks/*": ["./apps/web/hooks/*"],
      "@/lib/*": ["./apps/web/lib/*"],
      "@/styles/*": ["./apps/web/styles/*"],
      "@app/api": ["./packages/api/src"],
      "@app/db": ["./packages/db/src"],
      "@app/shared": ["./packages/shared/src"]
    }
  }
}
```

**Step 2: Update apps/web/tsconfig.json**

Modify `apps/web/tsconfig.json`, add/update compilerOptions:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/lib/*": ["./lib/*"],
      "@/styles/*": ["./styles/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ]
}
```

**Step 3: Verify TypeScript configuration**

Run: `pnpm turbo run type-check`

Expected: Type checking passes (or shows existing errors, not config errors)

**Step 4: Commit TypeScript configuration**

```bash
git add tsconfig.json apps/web/tsconfig.json
git commit -m "chore: update TypeScript path aliases

- Add path aliases for new directory structure
- Configure @ imports for components, hooks, lib
- Add @app/* aliases for packages

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update Next.js Configuration

**Files:**
- Modify: `apps/web/next.config.js`

**Step 1: Update Next.js config for optimization**

Modify `apps/web/next.config.js`:

```javascript
const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Only in client bundle, optimize Ant Design icons
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@ant-design/icons$': '@ant-design/icons/lib/icons'
      }
    }
    return config
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: []
  },

  // Experimental features for optimization
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons', 'framer-motion']
  },

  // Standalone output for Docker
  output: 'standalone',

  // Disable telemetry
  telemetry: false
}

module.exports = nextConfig
```

**Step 2: Verify Next.js builds**

Run: `pnpm turbo run build --filter=@app/web`

Expected: Build succeeds with no errors

**Step 3: Check build output size**

Run: `ls -lh apps/web/.next/static/chunks/*.js | head -5`

Expected: See chunk files (verifying build worked)

**Step 4: Commit Next.js configuration**

```bash
git add apps/web/next.config.js
git commit -m "chore: optimize Next.js configuration

- Enable SWC minification
- Optimize Ant Design icons import
- Add image optimization with avif/webp
- Enable experimental package import optimization
- Configure standalone output for Docker

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Update Turbo Configuration

**Files:**
- Modify: `turbo.json`

**Step 1: Update turbo.json with test tasks**

Modify `turbo.json`, update pipeline:

```json
{
  "globalDependencies": [".env", "tsconfig.json"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "test:coverage": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "cache": false
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "db:generate": {
      "outputs": ["node_modules/.prisma/**"],
      "cache": true
    },
    "db:push": {
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Step 2: Test turbo caching**

Run: `pnpm turbo run test --dry=json | grep "cache"`

Expected: Shows cache configuration for test task

**Step 3: Commit Turbo configuration**

```bash
git add turbo.json
git commit -m "chore: update Turborepo pipeline configuration

- Add test and test:coverage tasks with caching
- Add test:e2e task without caching
- Configure task dependencies properly
- Enable cache for type-check and lint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Index Files for New Directories

**Files:**
- Create: `apps/web/hooks/index.ts`
- Create: `apps/web/components/ui/index.ts`
- Create: `packages/api/src/services/index.ts`
- Create: `packages/shared/src/validators/index.ts`

**Step 1: Create hooks index**

Create `apps/web/hooks/index.ts`:

```typescript
// Custom hooks will be exported from here
// Example:
// export { useAuth } from './useAuth'
// export { useLocalStorage } from './useLocalStorage'
```

**Step 2: Create UI components index**

Create `apps/web/components/ui/index.ts`:

```typescript
// UI components will be exported from here
// Example:
// export { Button } from './Button'
// export { Card } from './Card'
```

**Step 3: Create services index**

Create `packages/api/src/services/index.ts`:

```typescript
// Services will be exported from here
// Example:
// export { authService } from './auth.service'
// export { timeBlockService } from './timeBlock.service'
```

**Step 4: Create validators index**

Create `packages/shared/src/validators/index.ts`:

```typescript
// Zod validators will be exported from here
// Example:
// export * from './auth.schema'
// export * from './timeBlock.schema'
```

**Step 5: Commit index files**

```bash
git add apps/web/hooks/index.ts apps/web/components/ui/index.ts packages/api/src/services/index.ts packages/shared/src/validators/index.ts
git commit -m "chore: add index files for new directories

- Add hooks/index.ts for custom hooks exports
- Add components/ui/index.ts for UI components
- Add services/index.ts for backend services
- Add validators/index.ts for Zod schemas

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Verification and Documentation

**Files:**
- Modify: `README.md`

**Step 1: Verify all installations**

Run: `pnpm list --depth=0 | grep -E "(framer-motion|vitest|playwright)"`

Expected: All three packages listed

**Step 2: Verify directory structure**

Run: `tree -L 3 -I node_modules`

Expected: All new directories present

**Step 3: Run all checks**

Run: `pnpm check && pnpm turbo run type-check`

Expected: All checks pass

**Step 4: Update README with new structure**

Add to `README.md` after "项目结构" section:

```markdown
## 新增目录说明

### 前端 (apps/web/)
- `hooks/` - 自定义 React Hooks
- `components/ui/` - 基础 UI 组件库
- `components/auth/` - 认证相关组件
- `components/time-blocks/` - 时间块组件
- `components/daily-question/` - 每日问答组件
- `components/layout/` - 布局组件

### 后端 (packages/api/)
- `services/` - 业务逻辑层
- `middleware/` - 中间件

### 共享 (packages/shared/)
- `validators/` - Zod 数据验证 schemas

### 测试 (tests/)
- `unit/` - 单元测试
- `integration/` - 集成测试
- `e2e/` - 端到端测试

### 测试命令

\`\`\`bash
pnpm test              # 运行单元测试
pnpm test:ui           # 测试 UI 界面
pnpm test:coverage     # 生成覆盖率报告
pnpm test:e2e          # 运行 E2E 测试
pnpm test:e2e:ui       # E2E 测试 UI
\`\`\`
```

**Step 5: Commit README update**

```bash
git add README.md
git commit -m "docs: update README with new structure

- Document new directory structure
- Add hooks, components, services directories
- Add test commands documentation
- Explain testing setup

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

**Step 6: Final verification - run dev server**

Run: `pnpm dev`

Expected: Dev server starts successfully at http://localhost:3000

**Step 7: Final verification - test homepage**

Open browser to http://localhost:3000

Expected: Homepage loads normally, no console errors

---

## Summary

**Completed:**
- ✅ Created new directory structure (hooks, components, services, tests)
- ✅ Installed dependencies (framer-motion, vitest, playwright)
- ✅ Configured Vitest with test setup
- ✅ Configured Playwright for E2E testing
- ✅ Updated TypeScript path aliases
- ✅ Optimized Next.js configuration
- ✅ Updated Turborepo pipeline
- ✅ Created index files for exports
- ✅ Updated documentation

**Total Commits:** 9 commits

**Ready for:** Week 1 Day 3-4 (UI Components Library)

**Verification Checklist:**
- [ ] All directories created and committed
- [ ] All dependencies installed
- [ ] `pnpm test --run` works (even if no tests)
- [ ] `pnpm test:e2e` example test passes
- [ ] `pnpm check` passes
- [ ] `pnpm turbo run build` succeeds
- [ ] `pnpm dev` starts without errors
- [ ] Homepage loads in browser

---

**Next Steps:**

After completing this plan, proceed to:
- **Week 1 Day 3-4:** UI Components Library (11 components + animations)
- **Week 1 Day 5-7:** Hooks and Services extraction
