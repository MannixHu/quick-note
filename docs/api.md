# QuickNote API 文档

## 概述

QuickNote 使用 tRPC 构建端到端类型安全的 API。所有 API 端点通过 `/api/trpc` 访问。

## 认证

使用 Cookie-based 认证。登录成功后，服务器设置 `auth-token` cookie。

## API 路由

### Auth Router (`auth.*`)

#### `auth.register`
注册新用户

**Input:**
```typescript
{
  email: string      // 邮箱
  password: string   // 密码 (最少 6 位)
  name?: string      // 用户名 (可选)
}
```

**Output:**
```typescript
{
  id: string
  email: string
  name: string | null
}
```

#### `auth.login`
用户登录

**Input:**
```typescript
{
  email: string
  password: string
}
```

**Output:**
```typescript
{
  user: {
    id: string
    email: string
    name: string | null
  }
}
```

---

### TimeBlock Router (`timeBlock.*`)

#### `timeBlock.getCategories`
获取用户的时间块分类

**Input:**
```typescript
{
  userId: string
}
```

**Output:**
```typescript
Array<{
  id: string
  name: string
  label: string
  color: string
}>
```

#### `timeBlock.getByDate`
获取指定日期的时间块

**Input:**
```typescript
{
  userId: string
  date: string   // YYYY-MM-DD 格式
}
```

**Output:**
```typescript
Array<{
  id: string
  startTime: string
  endTime: string
  category: {
    id: string
    name: string
    label: string
    color: string
  }
  note: string | null
}>
```

#### `timeBlock.quickCreate`
快速创建时间块

**Input:**
```typescript
{
  userId: string
  categoryId: string
  date: string       // YYYY-MM-DD 格式
  hour: number       // 0-23
}
```

**Output:**
```typescript
{
  id: string
  startTime: string
  endTime: string
  category: { ... }
}
```

#### `timeBlock.delete`
删除时间块

**Input:**
```typescript
{
  id: string
}
```

#### `timeBlock.createCategory`
创建新分类

**Input:**
```typescript
{
  userId: string
  name: string
  label: string
  color: string
}
```

---

### DailyQuestion Router (`dailyQuestion.*`)

#### `dailyQuestion.getRandomQuestion`
获取随机问题

**Input:**
```typescript
{
  userId: string
}
```

**Output:**
```typescript
{
  id: string
  question: string
  category: string | null
}
```

#### `dailyQuestion.answerQuestionNew`
回答问题

**Input:**
```typescript
{
  userId: string
  questionId: string
  answer: string
}
```

**Output:**
```typescript
{
  id: string
  date: Date
  question: { question: string }
  answer: string
}
```

#### `dailyQuestion.getAnswerHistory`
获取回答历史

**Input:**
```typescript
{
  userId: string
  limit?: number   // 默认 30
}
```

**Output:**
```typescript
Array<{
  id: string
  date: Date
  question: { question: string }
  answer: string
}>
```

#### `dailyQuestion.generateAIQuestions`
AI 生成问题 (需要配置 AI 服务)

**Input:**
```typescript
{
  count?: number          // 生成数量，默认 5
  aiConfig: {
    provider: 'openrouter' | 'deepseek'
    apiKey: string
    model?: string
  }
}
```

#### `dailyQuestion.pingAI`
测试 AI 服务连接

**Input:**
```typescript
{
  aiConfig: {
    provider: 'openrouter' | 'deepseek'
    apiKey: string
  }
}
```

**Output:**
```typescript
{
  success: boolean
  latency?: number
  error?: string
}
```

---

## 客户端使用

### React 组件中使用

```typescript
import { trpc } from '@/lib/trpc/client'

function MyComponent() {
  // 查询
  const { data, isLoading } = trpc.timeBlock.getByDate.useQuery({
    userId: 'user-id',
    date: '2024-01-10'
  })

  // 变更
  const mutation = trpc.timeBlock.quickCreate.useMutation()

  const handleCreate = () => {
    mutation.mutate({
      userId: 'user-id',
      categoryId: 'category-id',
      date: '2024-01-10',
      hour: 10
    })
  }

  return (...)
}
```

### 错误处理

tRPC 错误包含以下信息：

```typescript
{
  data: {
    code: string      // 错误代码 (如 'UNAUTHORIZED', 'CONFLICT')
  }
  message: string     // 错误消息
}
```

常见错误代码：
- `UNAUTHORIZED`: 未授权/登录失败
- `CONFLICT`: 冲突 (如邮箱已注册)
- `NOT_FOUND`: 资源不存在
- `BAD_REQUEST`: 请求参数错误
