# 快记 (QuickNote)

Web 端快速记录服务 - 时间块 + 每日问答

## 技术栈

- **Web**: Next.js 15 + Ant Design + Tailwind CSS
- **API**: tRPC + Prisma + PostgreSQL
- **AI**: OpenRouter / DeepSeek (问题生成)
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
│   └── web/        # Next.js Web 应用
├── packages/
│   ├── api/        # tRPC API 定义
│   ├── db/         # Prisma 数据库
│   └── shared/     # 共享代码
└── docker/         # Docker 配置
```

## 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建
pnpm check        # 代码检查
pnpm test         # 测试
```

## 文档

- [AI 开发参考](./CLAUDE.md)
