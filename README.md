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

```bash
pnpm test              # 运行单元测试
pnpm test:ui           # 测试 UI 界面
pnpm test:coverage     # 生成覆盖率报告
pnpm test:e2e          # 运行 E2E 测试
pnpm test:e2e:ui       # E2E 测试 UI
```

## 文档

- [AI 开发参考](./CLAUDE.md)
