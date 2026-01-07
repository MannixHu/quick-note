# CLAUDE.md - AI 快速参考文档

> 本文档用于 AI 快速理解项目结构和技术栈

## 项目概述

**快记 (QuickNote)** - 跨平台快速记录服务 (Web + Android + Mac)

### 核心功能

1. **时间块记录** - 类似 iOS "时间块" App，点击时间格快速生成如 "10:00-11:00 #longTerm" 的文本
2. **每日问答** - AI 生成的深度思考问题，帮助用户反思成长
3. **实时同步** - 手机端更改立即同步到电脑端/Web 端
4. **用户认证** - 账号密码登录、短信验证码登录、忘记密码

### 数据模型

- `User` - 用户 (支持邮箱+密码、手机+验证码登录)
- `TimeBlockCategory` - 时间块分类 (longTerm, work, study, rest, exercise)
- `TimeBlock` - 时间块记录 (日期、开始时间、结束时间、分类)
- `DailyQuestion` - 每日问题库
- `QuestionAnswer` - 用户回答记录
- `SmsVerification` - 短信验证码

## 技术栈速查

```
框架: Next.js 15 (Web) + Expo 52 (React Native)
语言: TypeScript 5.7
包管理: pnpm 9 + Turborepo
数据库: PostgreSQL + Prisma ORM
API: tRPC (端到端类型安全)
AI: OpenRouter / DeepSeek (每日问题生成)
状态: Zustand + TanStack Query
UI: Ant Design (Web) + React Native Paper (Mobile)
样式: Tailwind CSS + NativeWind
表单: React Hook Form + Zod
认证: NextAuth.js
代码规范: Biome (lint + format)
测试: Vitest + Playwright + Jest
```

## 目录结构

```
universal-app/
├── apps/
│   ├── web/                 # Next.js 15 Web 应用
│   │   ├── app/             # App Router 页面
│   │   │   ├── api/         # API Routes
│   │   │   │   ├── trpc/    # tRPC 端点
│   │   │   │   └── health/  # 健康检查
│   │   │   ├── layout.tsx   # 根布局
│   │   │   └── page.tsx     # 首页
│   │   ├── lib/
│   │   │   └── trpc/        # tRPC 客户端配置
│   │   └── components/      # Web 专用组件
│   │
│   └── mobile/              # Expo React Native 应用
│       ├── app/             # Expo Router 页面
│       │   ├── _layout.tsx  # 根布局
│       │   └── index.tsx    # 首页
│       ├── lib/
│       │   └── trpc/        # tRPC 客户端配置
│       └── components/      # RN 专用组件
│
├── packages/
│   ├── api/                 # tRPC API 定义
│   │   └── src/
│   │       ├── trpc.ts      # tRPC 初始化
│   │       ├── routers/     # API 路由
│   │       │   ├── user.ts
│   │       │   └── post.ts
│   │       └── index.ts     # 导出 appRouter
│   │
│   ├── db/                  # Prisma 数据库
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       └── index.ts     # Prisma Client 导出
│   │
│   └── shared/              # 共享代码
│       └── src/
│           ├── utils/       # 工具函数 (cn, date, id)
│           ├── constants/   # 常量
│           └── types/       # 类型定义
│
├── docker/                  # Docker 配置
│   └── nginx/               # Nginx 配置
│
├── biome.json               # Biome 配置
├── turbo.json               # Turborepo 配置
├── docker-compose.yml       # 开发环境 Docker
├── docker-compose.prod.yml  # 生产环境 Docker
└── Dockerfile               # 生产镜像构建
```

## 关键文件路径

| 用途 | 路径 |
|------|------|
| **tRPC 路由定义** | `packages/api/src/routers/*.ts` |
| **Prisma Schema** | `packages/db/prisma/schema.prisma` |
| **Web 页面** | `apps/web/app/**/*.tsx` |
| **Mobile 页面** | `apps/mobile/app/**/*.tsx` |
| **共享工具** | `packages/shared/src/utils/*.ts` |
| **类型定义** | `packages/shared/src/types/index.ts` |

## 常用命令

```bash
# 开发
pnpm dev                  # 启动所有应用
pnpm dev:web              # 只启动 Web
pnpm dev:mobile           # 只启动 Mobile

# 构建
pnpm build                # 构建所有

# 代码检查
pnpm check                # Biome 检查
pnpm check:fix            # Biome 检查并修复

# 数据库
pnpm db:generate          # 生成 Prisma Client
pnpm db:push              # 推送 Schema 到数据库
pnpm db:migrate           # 运行迁移
pnpm db:studio            # 打开 Prisma Studio

# 测试
pnpm test                 # 运行测试
pnpm test:e2e             # E2E 测试

# Docker
docker-compose up -d      # 启动开发环境 (PostgreSQL, Redis)
```

## 代码模式

### 添加新 API 端点

1. 在 `packages/api/src/routers/` 创建新文件
2. 定义 router:
```typescript
// packages/api/src/routers/example.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'

export const exampleRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.example.findMany()
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.example.create({ data: input })
    }),
})
```
3. 在 `packages/api/src/index.ts` 注册:
```typescript
import { exampleRouter } from './routers/example'

export const appRouter = createTRPCRouter({
  // ...existing routers
  example: exampleRouter,
})
```

### 添加新数据模型

1. 编辑 `packages/db/prisma/schema.prisma`
2. 运行 `pnpm db:push` 或 `pnpm db:migrate`
3. 运行 `pnpm db:generate`

### 添加新 Web 页面

```typescript
// apps/web/app/example/page.tsx
export default function ExamplePage() {
  return <div>Example</div>
}
```

### 添加新 Mobile 页面

```typescript
// apps/mobile/app/example.tsx
import { View, Text } from 'react-native'

export default function ExampleScreen() {
  return (
    <View>
      <Text>Example</Text>
    </View>
  )
}
```

### 使用 tRPC 查询数据

```typescript
// Web 或 Mobile 组件中
import { trpc } from '@/lib/trpc/client'

function MyComponent() {
  const { data, isLoading } = trpc.user.list.useQuery()
  const createMutation = trpc.user.create.useMutation()

  // ...
}
```

### 表单处理

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    // ...
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

## 包依赖关系

```
@app/web ──────┬──► @app/api ──► @app/db
               │
               └──► @app/shared

@app/mobile ───┬──► @app/api (类型)
               │
               └──► @app/shared
```

## 环境变量

```bash
# 必需
DATABASE_URL=postgresql://user:pass@localhost:5432/db
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# AI Provider (可选 - 用于每日问题生成)
AI_PROVIDER=openrouter  # 或 deepseek
OPENROUTER_API_KEY=your-key  # 如果使用 OpenRouter
DEEPSEEK_API_KEY=your-key    # 如果使用 DeepSeek
AI_MODEL=anthropic/claude-3.5-sonnet  # 可选，指定模型

# 可选
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## AI 每日问题生成

项目支持使用 AI 自动生成深度思考问题，替代预设的问题库。

### 配置 AI 服务

1. **选择提供商**

   - **OpenRouter** (推荐) - 一个 API 访问所有模型（Claude, GPT-4, etc.）
     - 注册: https://openrouter.ai
     - 获取 API Key，设置 `OPENROUTER_API_KEY`

   - **DeepSeek** - 国产高性价比模型
     - 注册: https://platform.deepseek.com
     - 获取 API Key，设置 `DEEPSEEK_API_KEY`

2. **配置环境变量**

   ```bash
   # .env 文件
   AI_PROVIDER="openrouter"
   OPENROUTER_API_KEY="your-api-key-here"

   # 可选: 指定模型（默认 anthropic/claude-3.5-sonnet）
   AI_MODEL="anthropic/claude-3.5-sonnet"
   ```

### API 使用方法

```typescript
// 1. 检查 AI 服务状态
const status = await trpc.dailyQuestion.checkAIStatus.query()
// { configured: true, provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet' }

// 2. 批量生成问题到数据库
const result = await trpc.dailyQuestion.generateAIQuestions.mutate({
  count: 10,  // 生成 10 个问题
  categories: ['reflection', 'growth']  // 可选，指定类别
})
// { success: true, count: 10, questions: [...] }

// 3. 获取今日问题（支持 AI 个性化）
const todayQ = await trpc.dailyQuestion.getTodayQuestionWithAI.query({
  userId: 'user_xxx',
  usePersonalization: true  // 基于用户历史回答生成个性化问题
})
// { question: {...}, source: 'ai' | 'database' }
```

### 工作机制

1. **降级策略**: AI 未配置或失败时，自动降级到数据库预设问题
2. **个性化**: 基于用户最近 5 次回答历史，生成针对性问题
3. **去重**: AI 生成的问题自动保存到数据库，避免重复
4. **成本优化**: 只在需要时调用 AI，已有问题直接从数据库读取

### 费用参考

- **OpenRouter**: Claude 3.5 Sonnet 约 $3/百万 token
- **DeepSeek**: deepseek-chat 约 ¥0.1/百万 token

生成一个问题约消耗 500 tokens，成本极低。


## AI 开发注意事项

1. **类型安全**: 所有代码必须通过 TypeScript 严格模式
2. **tRPC**: API 使用 tRPC，修改后端会自动影响前端类型
3. **Prisma**: 数据库操作通过 Prisma Client，修改 schema 后需要 generate
4. **Biome**: 代码格式化使用 Biome，不是 ESLint + Prettier
5. **Monorepo**: 使用 pnpm workspace，包之间通过 `workspace:*` 引用
6. **样式**: Web 用 Tailwind + Ant Design，Mobile 用 NativeWind + Paper
7. **路由**: Web 用 Next.js App Router，Mobile 用 Expo Router

## 测试文件位置

- 单元测试: 与源文件同目录，`*.test.ts(x)`
- E2E 测试 (Web): `apps/web/e2e/`
- E2E 测试 (Mobile): `apps/mobile/.maestro/`
