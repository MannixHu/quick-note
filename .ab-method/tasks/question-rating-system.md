# Task: 每日问答评分推荐系统

## 概述

实现每日问答的评分推荐系统，让用户可以对问题进行评分，系统根据评分推荐更多类似问题，同时保留一定比例的非偏好问题防止信息茧房。

## 目标

1. 用户可以对问题进行评分（喜欢/不喜欢 或 1-5 星）
2. 系统根据用户评分历史推荐更多类似问题
3. 保留 20-30% 的非偏好问题，防止信息茧房
4. 支持问题分类/标签，便于推荐算法

## 任务分解

### Mission 1: 数据库模型设计 [pending]
- 设计 QuestionRating 模型（用户对问题的评分）
- 为 DailyQuestion 添加分类/标签字段
- 创建数据库迁移
- 预估时间: 1-2 小时

### Mission 2: 后端 API 开发 [pending]
- 创建评分 CRUD 接口
- 实现获取用户评分历史接口
- 添加问题分类管理接口
- 预估时间: 2-3 小时

### Mission 3: 推荐算法实现 [pending]
- 基于用户评分历史分析偏好
- 实现相似问题推荐逻辑
- 添加随机非偏好问题（20-30%）防止信息茧房
- 预估时间: 2-3 小时

### Mission 4: 前端 UI 开发 [pending]
- 添加问题评分组件（星级或点赞）
- 显示评分状态和反馈
- 集成推荐 API
- 预估时间: 2-3 小时

### Mission 5: 测试与优化 [pending]
- 编写单元测试
- 端到端测试
- 性能优化
- 预估时间: 1-2 小时

## 技术设计

### 数据模型

```prisma
// 问题评分
model QuestionRating {
  id         String   @id @default(cuid())
  userId     String
  questionId String
  rating     Int      // 1-5 或 -1/1 (dislike/like)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  question   DailyQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
}

// 更新 DailyQuestion 添加标签
model DailyQuestion {
  // ... existing fields
  tags       String[] // 问题标签，用于推荐
}
```

### 推荐算法

```
1. 获取用户高评分问题的标签分布
2. 计算每个标签的偏好权重
3. 选择问题时:
   - 70-80% 基于偏好标签加权随机选择
   - 20-30% 完全随机选择（防止信息茧房）
4. 排除最近已回答的问题
```

## 状态

- 创建时间: 2026-01-10
- 当前 Mission: 未开始
- 总进度: 0/5
