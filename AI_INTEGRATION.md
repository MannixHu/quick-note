# AI 每日问题生成 - 使用指南

## 快速开始

### 1. 配置 AI 服务（二选一）

#### 方案 A: OpenRouter（推荐）
支持 Claude, GPT-4, Gemini 等多种模型，一个 API 全搞定。

```bash
# 1. 注册并获取 API Key
# 访问 https://openrouter.ai/keys

# 2. 配置环境变量
AI_PROVIDER="openrouter"
OPENROUTER_API_KEY="sk-or-v1-xxx"
AI_MODEL="anthropic/claude-3.5-sonnet"  # 可选
```

#### 方案 B: DeepSeek（国产）
高性价比，中文友好。

```bash
# 1. 注册并获取 API Key
# 访问 https://platform.deepseek.com

# 2. 配置环境变量
AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY="sk-xxx"
AI_MODEL="deepseek-chat"  # 可选
```

### 2. 使用 API

#### 检查配置状态
```typescript
const status = await trpc.dailyQuestion.checkAIStatus.query()
console.log(status)
// { configured: true, provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet' }
```

#### 批量生成问题
```typescript
// 生成 10 个问题
const result = await trpc.dailyQuestion.generateAIQuestions.mutate({
  count: 10,
  categories: ['reflection', 'growth', 'planning']  // 可选
})

console.log(result)
// {
//   success: true,
//   count: 10,
//   questions: [
//     { question: "...", category: "reflection" },
//     ...
//   ]
// }
```

#### 获取今日问题（智能版）
```typescript
// 普通模式 - 从数据库随机选择
const question1 = await trpc.dailyQuestion.getTodayQuestionWithAI.query({
  userId: 'user_xxx',
  usePersonalization: false
})

// 个性化模式 - AI 基于用户历史回答生成
const question2 = await trpc.dailyQuestion.getTodayQuestionWithAI.query({
  userId: 'user_xxx',
  usePersonalization: true  // 需要用户有历史回答
})

console.log(question2)
// {
//   question: { question: "...", category: "..." },
//   answer: null,
//   source: 'ai'  // 'ai' 或 'database' 或 'existing'
// }
```

## 工作原理

### 智能降级
```
用户请求问题
    ↓
是否已有今日问题？
    ├─ 是 → 直接返回
    ↓
AI 是否配置？
    ├─ 否 → 数据库随机选择
    ↓
是否启用个性化？
    ├─ 否 → 数据库随机选择
    ├─ 是 → 用户是否有历史？
              ├─ 否 → 数据库随机选择
              ├─ 是 → AI 生成个性化问题
```

### 成本优化

- ✅ 已有问题直接返回（0 成本）
- ✅ AI 生成的问题自动保存到数据库（复用）
- ✅ 失败自动降级到数据库（高可用）
- ✅ 只在需要时调用 AI（按需）

## 费用估算

### OpenRouter (Claude 3.5 Sonnet)
- 价格: $3 / 1M tokens
- 单次生成: ~500 tokens = $0.0015 (约 ¥0.01)
- 月生成 1000 题: $1.5 (约 ¥10)

### DeepSeek
- 价格: ¥0.1 / 1M tokens
- 单次生成: ~500 tokens = ¥0.00005
- 月生成 1000 题: ¥0.05

## 常见问题

### Q: AI 未配置会怎样？
A: 自动降级到数据库预设问题，不影响功能。

### Q: 个性化问题如何生成？
A: AI 分析用户最近 5 次回答，生成延续性问题。新用户使用数据库问题。

### Q: 生成的问题会保存吗？
A: 会。AI 生成的问题自动保存到数据库，下次可以复用。

### Q: 如何切换 AI 提供商？
A: 修改 `AI_PROVIDER` 环境变量，重启应用即可。

### Q: 支持其他 AI 模型吗？
A: 支持。通过 `AI_MODEL` 指定：
- OpenRouter: `anthropic/claude-3.5-sonnet`, `openai/gpt-4`, `google/gemini-pro` 等
- DeepSeek: `deepseek-chat`, `deepseek-coder` 等

## 进阶配置

### 自定义 Prompt
编辑 `packages/api/src/services/ai.ts` 中的 prompt 内容。

### 调整生成参数
修改 `temperature`（创造性）和 `max_tokens`（长度）：

```typescript
body: JSON.stringify({
  model: this.defaultModel,
  messages: [...],
  temperature: 0.8,  // 0-1，越高越有创意
  max_tokens: 2000   // 最大 token 数
})
```

## 开发测试

```bash
# 1. 配置测试 API Key
echo 'AI_PROVIDER="openrouter"' >> .env
echo 'OPENROUTER_API_KEY="sk-or-v1-..."' >> .env

# 2. 启动开发服务器
pnpm dev

# 3. 测试 API（在浏览器控制台或 API 客户端）
```

## 生产环境建议

1. **设置请求限流** - 防止 API 成本失控
2. **监控错误率** - 及时发现 AI 服务问题
3. **缓存策略** - 相同问题不重复生成
4. **回退机制** - AI 失败时使用数据库问题

## 相关文件

- AI 服务: `packages/api/src/services/ai.ts`
- API 路由: `packages/api/src/routers/dailyQuestion.ts`
- 环境配置: `.env.example`
- 数据模型: `packages/db/prisma/schema.prisma`
