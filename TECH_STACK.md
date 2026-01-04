# Universal App 技术栈文档

> 全平台 (Web + Android) 全栈应用技术栈

## 技术栈总览

### 核心框架

| 类别 | 技术 | 版本 |
|------|------|------|
| **Web 框架** | Next.js (App Router) | 15.x |
| **移动端框架** | Expo (React Native) | 52.x |
| **语言** | TypeScript | 5.7+ |
| **运行时** | Node.js | 20.x LTS |

### UI 层

| 类别 | Web | React Native |
|------|-----|--------------|
| **组件库** | Ant Design 6 (先用 5.x) | React Native Paper |
| **样式** | Tailwind CSS 4 | NativeWind 4 |
| **图标** | @ant-design/icons | react-native-vector-icons |

### 状态管理 & 数据

| 类别 | 技术 |
|------|------|
| **客户端状态** | Zustand |
| **服务端状态** | TanStack Query |
| **API 层** | tRPC |
| **验证** | Zod |

### 表单

| 类别 | 技术 |
|------|------|
| **表单库** | React Hook Form |
| **验证** | Zod |

### 后端

| 类别 | 技术 |
|------|------|
| **API** | Next.js API Routes + tRPC |
| **ORM** | Prisma |
| **数据库** | PostgreSQL |
| **认证** | NextAuth.js (Auth.js) |
| **实时同步** | Supabase Realtime |

### 工具库

| 类别 | 技术 |
|------|------|
| **函数工具** | es-toolkit |
| **日期** | dayjs |
| **ID 生成** | nanoid |
| **类名** | clsx + tailwind-merge |
| **查询字符串** | qs |

### 代码规范

| 类别 | 技术 |
|------|------|
| **Lint + Format** | Biome |
| **Git Hooks** | husky + lint-staged |
| **Commit 规范** | commitlint + cz-git |
| **版本管理** | changesets |

### 测试

| 类别 | Web | React Native |
|------|-----|--------------|
| **单元测试** | Vitest | Jest |
| **组件测试** | @testing-library/react | @testing-library/react-native |
| **E2E 测试** | Playwright | Detox |
| **API Mock** | MSW | MSW |
| **视觉测试** | Storybook + Chromatic | Storybook |

### 工程化

| 类别 | 技术 |
|------|------|
| **包管理** | pnpm |
| **Monorepo** | Turborepo |
| **构建 (Web)** | Turbopack / Webpack (Next.js 内置) |
| **构建 (RN)** | Metro Bundler (Expo 内置) |

---

## 项目结构

```
universal-app/
├── apps/
│   ├── web/                    # Next.js Web 应用
│   │   ├── app/                # App Router 页面
│   │   │   ├── (auth)/         # 认证相关页面组
│   │   │   ├── (dashboard)/    # 主应用页面组
│   │   │   ├── api/            # API Routes
│   │   │   │   └── trpc/       # tRPC 端点
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/         # Web 专用组件
│   │   ├── lib/                # Web 专用工具
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── mobile/                 # Expo React Native 应用
│       ├── app/                # Expo Router 页面
│       │   ├── (tabs)/         # Tab 导航
│       │   ├── _layout.tsx
│       │   └── index.tsx
│       ├── components/         # RN 专用组件
│       ├── lib/                # RN 专用工具
│       ├── app.json
│       ├── metro.config.js
│       └── package.json
│
├── packages/
│   ├── api/                    # tRPC API 定义
│   │   ├── src/
│   │   │   ├── routers/        # tRPC routers
│   │   │   ├── trpc.ts         # tRPC 初始化
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── db/                     # Prisma 数据库
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts        # Prisma client 导出
│   │   └── package.json
│   │
│   ├── auth/                   # 认证模块
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared/                 # 共享代码
│   │   ├── src/
│   │   │   ├── utils/          # 工具函数
│   │   │   ├── constants/      # 常量
│   │   │   ├── types/          # 类型定义
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                     # 共享 UI 组件 (如果有)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── config/                 # 共享配置
│       ├── biome/              # Biome 配置
│       ├── typescript/         # TypeScript 配置
│       └── tailwind/           # Tailwind 配置
│
├── tooling/                    # 开发工具配置
│   └── scripts/                # 脚本
│
├── biome.json                  # Biome 配置
├── turbo.json                  # Turborepo 配置
├── pnpm-workspace.yaml         # pnpm 工作区配置
├── package.json                # 根 package.json
├── tsconfig.json               # 根 TypeScript 配置
├── commitlint.config.js        # Commit 规范配置
└── .gitignore
```

---

## 配置文件

### 1. 根目录 package.json

```json
{
  "name": "universal-app",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "dev:web": "turbo dev --filter=@app/web",
    "dev:mobile": "turbo dev --filter=@app/mobile",
    "build": "turbo build",
    "lint": "turbo lint",
    "format": "biome format . --write",
    "check": "biome check .",
    "check:fix": "biome check . --write",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "db:generate": "turbo db:generate",
    "db:push": "turbo db:push",
    "db:studio": "pnpm --filter @app/db studio",
    "prepare": "husky",
    "commit": "cz"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@changesets/cli": "^2.27.10",
    "@commitlint/cli": "^19.6.1",
    "@commitlint/config-conventional": "^19.6.0",
    "commitizen": "^4.3.1",
    "cz-git": "^1.11.0",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.11",
    "turbo": "^2.3.3",
    "typescript": "^5.7.2"
  },
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0"
  },
  "lint-staged": {
    "*.{js,ts,tsx,json,css,md}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  },
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  }
}
```

### 2. pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

### 3. turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "cache": false
    },
    "test:e2e": {
      "cache": false
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

### 4. biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "style": {
        "useConst": "error",
        "noNonNullAssertion": "warn"
      },
      "complexity": {
        "noForEach": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "es5",
      "arrowParentheses": "always"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "files": {
    "ignore": [
      "node_modules",
      ".next",
      ".expo",
      "dist",
      "build",
      "coverage",
      ".turbo",
      "*.gen.ts"
    ]
  }
}
```

### 5. tsconfig.json (根目录)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  },
  "exclude": ["node_modules"]
}
```

### 6. commitlint.config.js

```javascript
/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能
        'test',     // 测试
        'build',    // 构建
        'ci',       // CI
        'chore',    // 杂项
        'revert',   // 回滚
      ],
    ],
    'subject-case': [0],
  },
}
```

### 7. .czrc (cz-git 配置)

```json
{
  "path": "node_modules/cz-git",
  "useEmoji": false,
  "types": [
    { "value": "feat", "name": "feat:     A new feature" },
    { "value": "fix", "name": "fix:      A bug fix" },
    { "value": "docs", "name": "docs:     Documentation only changes" },
    { "value": "style", "name": "style:    Code style changes" },
    { "value": "refactor", "name": "refactor: Code refactoring" },
    { "value": "perf", "name": "perf:     Performance improvements" },
    { "value": "test", "name": "test:     Adding tests" },
    { "value": "build", "name": "build:    Build system changes" },
    { "value": "ci", "name": "ci:       CI configuration changes" },
    { "value": "chore", "name": "chore:    Other changes" },
    { "value": "revert", "name": "revert:   Revert a commit" }
  ],
  "scopes": [
    { "value": "web", "name": "web:      Web app changes" },
    { "value": "mobile", "name": "mobile:   Mobile app changes" },
    { "value": "api", "name": "api:      API changes" },
    { "value": "db", "name": "db:       Database changes" },
    { "value": "shared", "name": "shared:   Shared package changes" },
    { "value": "ui", "name": "ui:       UI package changes" },
    { "value": "config", "name": "config:   Configuration changes" }
  ],
  "allowCustomScopes": true,
  "allowEmptyScopes": true
}
```

### 8. .gitignore

```gitignore
# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
build
.next
.expo
*.tsbuildinfo

# Turbo
.turbo

# Environment
.env
.env.local
.env.*.local

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage
.nyc_output

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Generated
*.gen.ts
prisma/generated
```

---

## apps/web 配置

### apps/web/package.json

```json
{
  "name": "@app/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "biome lint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@ant-design/icons": "^5.5.2",
    "@app/api": "workspace:*",
    "@app/auth": "workspace:*",
    "@app/db": "workspace:*",
    "@app/shared": "workspace:*",
    "@tanstack/react-query": "^5.62.8",
    "@trpc/client": "^11.0.0-rc.660",
    "@trpc/react-query": "^11.0.0-rc.660",
    "@trpc/server": "^11.0.0-rc.660",
    "antd": "^5.22.5",
    "clsx": "^2.1.1",
    "dayjs": "^1.11.13",
    "es-toolkit": "^1.30.1",
    "nanoid": "^5.0.9",
    "next": "^15.1.3",
    "next-auth": "^5.0.0-beta.25",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "msw": "^2.7.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.0.0",
    "vitest": "^2.1.8"
  }
}
```

### apps/web/next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@app/api',
    '@app/auth',
    '@app/db',
    '@app/shared',
    '@app/ui',
  ],
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig
```

### apps/web/tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // 避免与 Ant Design 冲突
  corePlugins: {
    preflight: false,
  },
}

export default config
```

### apps/web/vitest.config.ts

```typescript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### apps/web/vitest.setup.ts

```typescript
import '@testing-library/jest-dom/vitest'
```

### apps/web/playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## apps/mobile 配置

### apps/mobile/package.json

```json
{
  "name": "@app/mobile",
  "version": "0.1.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "build": "eas build",
    "lint": "biome lint .",
    "test": "jest",
    "test:e2e": "detox test"
  },
  "dependencies": {
    "@app/api": "workspace:*",
    "@app/shared": "workspace:*",
    "@react-navigation/native": "^7.0.14",
    "@tanstack/react-query": "^5.62.8",
    "@trpc/client": "^11.0.0-rc.660",
    "@trpc/react-query": "^11.0.0-rc.660",
    "clsx": "^2.1.1",
    "dayjs": "^1.11.13",
    "es-toolkit": "^1.30.1",
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "nanoid": "^5.0.9",
    "nativewind": "^4.1.23",
    "react": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "react-native": "~0.76.0",
    "react-native-paper": "^5.12.5",
    "react-native-safe-area-context": "^4.14.0",
    "react-native-screens": "~4.4.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@testing-library/react-native": "^12.9.0",
    "@types/jest": "^29.5.14",
    "@types/react": "^19.0.2",
    "detox": "^20.33.0",
    "jest": "^29.7.0",
    "react-test-renderer": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2"
  }
}
```

### apps/mobile/app.json

```json
{
  "expo": {
    "name": "Universal App",
    "slug": "universal-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.universalapp"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.universalapp"
    },
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true
    },
    "scheme": "universalapp"
  }
}
```

### apps/mobile/metro.config.js

```javascript
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// 支持 monorepo
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true

// 支持 NativeWind
config.resolver.sourceExts.push('css')

module.exports = config
```

### apps/mobile/tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

### apps/mobile/jest.config.js

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/../../packages/$1/src',
  },
}
```

---

## packages/db 配置 (Prisma)

### packages/db/package.json

```json
{
  "name": "@app/db",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.1.0"
  },
  "devDependencies": {
    "prisma": "^6.1.0"
  }
}
```

### packages/db/prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}
```

### packages/db/src/index.ts

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export * from '@prisma/client'
```

---

## packages/api 配置 (tRPC)

### packages/api/package.json

```json
{
  "name": "@app/api",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {},
  "dependencies": {
    "@app/db": "workspace:*",
    "@trpc/server": "^11.0.0-rc.660",
    "superjson": "^2.2.2",
    "zod": "^3.24.1"
  }
}
```

### packages/api/src/trpc.ts

```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { prisma } from '@app/db'

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    prisma,
    ...opts,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // 添加认证检查
  // if (!ctx.session || !ctx.session.user) {
  //   throw new TRPCError({ code: 'UNAUTHORIZED' })
  // }
  return next({
    ctx: {
      ...ctx,
      // session: ctx.session,
    },
  })
})
```

### packages/api/src/routers/user.ts

```typescript
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const userRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: { id: input.id },
      })
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany()
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: input,
      })
    }),
})
```

### packages/api/src/index.ts

```typescript
import { createTRPCRouter } from './trpc'
import { userRouter } from './routers/user'

export const appRouter = createTRPCRouter({
  user: userRouter,
})

export type AppRouter = typeof appRouter

export { createTRPCContext } from './trpc'
```

---

## packages/shared 配置

### packages/shared/package.json

```json
{
  "name": "@app/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {},
  "dependencies": {
    "clsx": "^2.1.1",
    "dayjs": "^1.11.13",
    "es-toolkit": "^1.30.1",
    "nanoid": "^5.0.9",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1"
  }
}
```

### packages/shared/src/utils/cn.ts

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### packages/shared/src/utils/index.ts

```typescript
export * from './cn'
```

### packages/shared/src/index.ts

```typescript
export * from './utils'
```

---

## 初始化命令

```bash
# 1. 创建项目目录
mkdir universal-app && cd universal-app

# 2. 初始化 pnpm
pnpm init

# 3. 创建目录结构
mkdir -p apps/web apps/mobile packages/{api,db,auth,shared,ui,config}

# 4. 初始化 Git
git init

# 5. 安装根依赖
pnpm add -D -w @biomejs/biome turbo typescript husky lint-staged \
  @commitlint/cli @commitlint/config-conventional commitizen cz-git \
  @changesets/cli

# 6. 初始化 Husky
pnpm exec husky init

# 7. 配置 Git hooks
echo "pnpm exec lint-staged" > .husky/pre-commit
echo "pnpm exec commitlint --edit \$1" > .husky/commit-msg

# 8. 初始化各个包 (按照上面的配置)
# ...

# 9. 安装所有依赖
pnpm install

# 10. 生成 Prisma Client
pnpm db:generate

# 11. 启动开发
pnpm dev
```

---

## 开发命令

```bash
# 全量开发
pnpm dev

# 只启动 Web
pnpm dev:web

# 只启动 Mobile
pnpm dev:mobile

# 构建
pnpm build

# 代码检查
pnpm check

# 代码检查并修复
pnpm check:fix

# 运行测试
pnpm test

# E2E 测试
pnpm test:e2e

# 数据库操作
pnpm db:generate    # 生成 Prisma Client
pnpm db:push        # 推送 Schema 到数据库
pnpm db:studio      # 打开 Prisma Studio

# Git 提交 (交互式)
pnpm commit
```

---

## 环境变量

### .env.example

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/universal_app"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (可选，用于实时同步)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

---

## 下一步

1. 根据此文档创建项目结构
2. 按需添加更多业务模块
3. 配置 CI/CD (GitHub Actions)
4. 部署 (Vercel + EAS Build)
