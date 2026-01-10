# QuickNote 架构文档

## 概述

QuickNote 是一个基于 Next.js 15 的全栈 Web 应用，采用 Turborepo Monorepo 架构管理多个包。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript 5.7 |
| 包管理 | pnpm 9 + Turborepo |
| 数据库 | PostgreSQL + Prisma ORM |
| API | tRPC (端到端类型安全) |
| 状态管理 | TanStack Query |
| UI 组件 | Ant Design 5.x |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| 国际化 | next-intl |
| 代码规范 | Biome |

## 目录结构

```
quick-note/
├── apps/
│   └── web/                    # Next.js 前端应用
│       ├── app/                # App Router 页面
│       │   ├── [locale]/       # 国际化路由
│       │   │   ├── page.tsx           # 首页
│       │   │   ├── login/             # 登录
│       │   │   ├── register/          # 注册
│       │   │   ├── time-blocks/       # 时间块
│       │   │   └── daily-question/    # 每日问答
│       │   └── api/            # API Routes
│       │       ├── trpc/       # tRPC 端点
│       │       └── health/     # 健康检查
│       ├── components/         # React 组件
│       │   ├── ui/             # 基础 UI 组件
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Loading.tsx
│       │   │   ├── Skeleton.tsx
│       │   │   ├── EmptyState.tsx
│       │   │   └── animations/     # 动画组件
│       │   ├── language-switcher.tsx
│       │   └── theme-switcher.tsx
│       ├── hooks/              # 自定义 Hooks
│       │   ├── useAuth.ts
│       │   ├── useTimeBlocks.ts
│       │   ├── useQuestion.ts
│       │   └── ...
│       └── lib/                # 工具库
│           ├── trpc/           # tRPC 客户端
│           └── i18n/           # 国际化配置
│
├── packages/
│   ├── api/                    # tRPC API 定义
│   │   └── src/
│   │       ├── routers/        # API 路由
│   │       ├── services/       # 业务逻辑
│   │       └── trpc.ts         # tRPC 配置
│   │
│   ├── db/                     # 数据库
│   │   └── prisma/
│   │       ├── schema.prisma   # 数据模型
│   │       └── seed.ts         # 种子数据
│   │
│   └── shared/                 # 共享代码
│       └── src/
│           ├── utils/          # 工具函数
│           ├── constants/      # 常量
│           └── types/          # 类型定义
│
├── .github/workflows/          # CI/CD 配置
├── docker/                     # Docker 配置
└── docs/                       # 文档
```

## 架构分层

```
┌─────────────────────────────────────────┐
│  展示层 (Presentation)                   │
│  - React 组件                            │
│  - 页面路由                              │
│  - UI 组件库                             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  逻辑层 (Logic)                          │
│  - Custom Hooks                          │
│  - 状态管理 (TanStack Query)             │
│  - tRPC Client                           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  API 层 (API)                            │
│  - tRPC Routers                          │
│  - Input 验证 (Zod)                      │
│  - 中间件 (Auth)                         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  业务层 (Business)                       │
│  - Services (业务逻辑)                   │
│  - AI 服务集成                           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  数据层 (Data)                           │
│  - Prisma ORM                            │
│  - PostgreSQL                            │
└─────────────────────────────────────────┘
```

## 数据模型

### User (用户)
- id: 唯一标识
- email: 邮箱
- password: 密码哈希
- name: 用户名

### TimeBlockCategory (时间块分类)
- id: 唯一标识
- name: 分类名 (longTerm, work, study, rest, exercise)
- label: 显示标签
- color: 颜色

### TimeBlock (时间块)
- id: 唯一标识
- userId: 用户 ID
- date: 日期
- startTime: 开始时间
- endTime: 结束时间
- categoryId: 分类 ID
- note: 备注

### DailyQuestion (每日问题)
- id: 唯一标识
- question: 问题内容
- category: 分类

### QuestionAnswer (问题回答)
- id: 唯一标识
- userId: 用户 ID
- questionId: 问题 ID
- answer: 回答内容
- date: 回答日期

## 包依赖关系

```
@app/web ──────┬──► @app/api ──► @app/db
               │
               └──► @app/shared
```

## 性能优化

### 前端优化
- React Query 缓存 (staleTime: 60s, gcTime: 5min)
- 代码分割和动态导入
- 图片优化 (AVIF, WebP)
- 字体优化 (next/font)

### 构建优化
- Turborepo 增量构建缓存
- Tree-shaking (Ant Design, Framer Motion)
- SWC 编译器

### Bundle 优化
- optimizePackageImports 配置
- Ant Design 图标按需导入
