# Universal App

跨平台全栈应用骨架 - Web + Android

## 技术栈

- **Web**: Next.js 15 + Ant Design + Tailwind CSS
- **Mobile**: Expo (React Native) + React Native Paper + NativeWind
- **API**: tRPC + Prisma + PostgreSQL
- **状态**: Zustand + TanStack Query
- **代码规范**: Biome + Husky + Commitlint

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动数据库 (Docker)
docker-compose up -d

# 生成 Prisma Client
pnpm db:generate

# 推送数据库 Schema
pnpm db:push

# 启动开发服务器
pnpm dev
```

## 项目结构

```
├── apps/
│   ├── web/        # Next.js Web 应用
│   └── mobile/     # Expo React Native 应用
├── packages/
│   ├── api/        # tRPC API 定义
│   ├── db/         # Prisma 数据库
│   └── shared/     # 共享代码
└── docker/         # Docker 配置
```

## 开发命令

```bash
pnpm dev          # 启动所有应用
pnpm dev:web      # 只启动 Web
pnpm dev:mobile   # 只启动 Mobile
pnpm build        # 构建
pnpm check        # 代码检查
pnpm test         # 测试
```

## 文档

- [技术栈详情](./TECH_STACK.md)
- [AI 开发参考](./CLAUDE.md)
