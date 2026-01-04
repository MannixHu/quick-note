# CLAUDE.md - AI 快速参考文档

> 本文档用于 AI 快速理解项目结构和技术栈

## 项目概述

**Universal App** - 跨平台全栈应用 (Web + Android)

## 技术栈速查

```
框架: Next.js 15 (Web) + Expo 52 (React Native)
语言: TypeScript 5.7
包管理: pnpm 9 + Turborepo
数据库: PostgreSQL + Prisma ORM
API: tRPC (端到端类型安全)
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

# 可选
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

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
