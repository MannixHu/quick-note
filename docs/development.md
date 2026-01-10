# QuickNote 开发指南

## 快速开始

### 环境要求

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Docker (可选，用于开发环境)

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-repo/quick-note.git
cd quick-note

# 2. 安装依赖
pnpm install

# 3. 启动数据库 (使用 Docker)
docker-compose up -d

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置 DATABASE_URL 等

# 5. 初始化数据库
pnpm db:push
pnpm db:generate

# 6. 启动开发服务器
pnpm dev
```

### 环境变量

```bash
# 必需
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quicknote
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# AI 服务 (可选)
AI_PROVIDER=openrouter  # 或 deepseek
OPENROUTER_API_KEY=your-key
DEEPSEEK_API_KEY=your-key
AI_MODEL=anthropic/claude-3.5-sonnet
```

---

## 开发命令

### 日常开发

```bash
pnpm dev              # 启动开发服务器 (所有包)
pnpm dev:web          # 只启动 Web 应用
pnpm build            # 构建所有包
pnpm clean            # 清理构建产物
```

### 代码检查

```bash
pnpm check            # 运行 Biome 检查
pnpm check:fix        # 检查并自动修复
pnpm type-check       # TypeScript 类型检查
```

### 数据库

```bash
pnpm db:generate      # 生成 Prisma Client
pnpm db:push          # 推送 Schema (开发用)
pnpm db:migrate       # 运行迁移 (生产用)
pnpm db:studio        # 打开 Prisma Studio
pnpm db:seed          # 填充种子数据
```

### 测试

```bash
pnpm test             # 运行单元测试
pnpm test:e2e         # 运行 E2E 测试
pnpm test:e2e:ui      # E2E 测试 (UI 模式)
```

---

## 项目结构

```
quick-note/
├── apps/
│   └── web/                 # Next.js Web 应用
│       ├── app/             # App Router
│       ├── components/      # React 组件
│       ├── hooks/           # 自定义 Hooks
│       └── lib/             # 工具库
│
├── packages/
│   ├── api/                 # tRPC API
│   ├── db/                  # Prisma 数据库
│   └── shared/              # 共享代码
│
├── docs/                    # 文档
├── docker/                  # Docker 配置
└── .github/workflows/       # CI/CD
```

---

## 开发流程

### 添加新功能

1. **创建数据模型** (如需要)
   ```bash
   # 编辑 packages/db/prisma/schema.prisma
   pnpm db:push
   pnpm db:generate
   ```

2. **添加 API 端点**
   ```typescript
   // packages/api/src/routers/example.ts
   export const exampleRouter = createTRPCRouter({
     list: publicProcedure.query(async ({ ctx }) => {
       return ctx.prisma.example.findMany()
     }),
   })
   ```

3. **注册路由**
   ```typescript
   // packages/api/src/index.ts
   export const appRouter = createTRPCRouter({
     example: exampleRouter,
   })
   ```

4. **创建页面**
   ```typescript
   // apps/web/app/[locale]/example/page.tsx
   export default function ExamplePage() {
     return <div>Example</div>
   }
   ```

5. **使用 API**
   ```typescript
   const { data } = trpc.example.list.useQuery()
   ```

### Git 工作流

```bash
# 功能分支
git checkout -b feature/my-feature

# 提交代码
git add .
git commit -m "feat: add my feature"

# 推送并创建 PR
git push -u origin feature/my-feature
```

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试
- `chore:` 构建/工具

---

## 代码规范

### TypeScript

- 使用严格模式 (`strict: true`)
- 避免使用 `any`
- 优先使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型和工具类型

### React

- 使用函数组件和 Hooks
- 组件文件使用 PascalCase
- Hook 文件使用 camelCase，以 `use` 开头
- 优先使用 Server Components

### 样式

- 使用 Tailwind CSS 工具类
- 复杂样式使用 CSS Modules 或 globals.css
- 避免内联样式

### 导入顺序

```typescript
// 1. React/Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. 第三方库
import { motion } from 'framer-motion'
import { Button } from 'antd'

// 3. 内部模块
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui'

// 4. 类型
import type { User } from '@/types'

// 5. 样式
import styles from './styles.module.css'
```

---

## 调试技巧

### tRPC 调试

```typescript
// 查看请求
const { data, error, isLoading } = trpc.example.list.useQuery(
  undefined,
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  }
)
```

### Prisma 调试

```bash
# 启用查询日志
DATABASE_URL="..." npx prisma studio

# 查看生成的 SQL
# 在 schema.prisma 中添加:
# generator client {
#   provider = "prisma-client-js"
#   log      = ["query"]
# }
```

### React Query 调试

```typescript
// 安装 React Query Devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// 在开发环境显示
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

---

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t quicknote .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  quicknote
```

### Docker Compose

```bash
# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 手动部署

```bash
# 构建
pnpm build

# 启动
pnpm start
```

---

## 常见问题

### Q: Prisma Client 类型不更新?

```bash
pnpm db:generate
# 重启 TypeScript 服务器
```

### Q: 构建失败，找不到模块?

```bash
# 清理缓存
pnpm clean
rm -rf node_modules/.cache
pnpm install
pnpm build
```

### Q: tRPC 类型推断失败?

确保:
1. `packages/api` 已构建
2. TypeScript 版本一致
3. 重启 IDE

### Q: 热更新不工作?

```bash
# 清理 Next.js 缓存
rm -rf apps/web/.next
pnpm dev
```

---

## 性能优化建议

### 前端

- 使用 `React.memo()` 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 优化计算
- 图片使用 `next/image` 自动优化
- 代码分割和懒加载

### 后端

- 使用 Prisma `select` 只查询需要的字段
- 添加数据库索引
- 使用 React Query 缓存减少请求

### 构建

- 使用 Turborepo 缓存
- 配置 `optimizePackageImports`
- 启用 SWC 编译器
