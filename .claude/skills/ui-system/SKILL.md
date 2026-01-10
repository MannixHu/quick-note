---
name: ui-system
description: 现代化 UI 设计规范。当创建组件、实现 UI、或用户提到"设计"、"样式"、"组件"时自动激活。
---

# UI Design System

## 设计风格
- **Glassmorphism** - 毛玻璃卡片效果
- **Micro-interactions** - Framer Motion 微动效
- **Mobile-first** - 响应式设计

## 技术栈
- Ant Design 组件库
- Tailwind CSS 样式
- Framer Motion 动效

## 设计规范

### 颜色
```
Primary: purple-500 ~ purple-600
Success: green-500
Warning: orange-500
Error: red-500
Background: gradient-mesh (紫色渐变网格)
```

### 圆角
```
卡片: rounded-xl (12px) 或 rounded-2xl (16px)
按钮: rounded-lg (8px) 或 rounded-xl
输入框: rounded-lg
```

### 毛玻璃效果
```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Dark mode */
.dark .glass {
  background: rgba(0, 0, 0, 0.5);
}
```

### 阴影
```
卡片悬浮: shadow-lg shadow-primary-500/20
按钮: shadow-md shadow-primary-500/30
```

### 动效
```tsx
// 入场动画
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>

// 悬浮效果
<motion.div
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
/>
```

### 间距
```
页面内边距: px-4 md:px-6
卡片内边距: p-4 md:p-6
元素间距: gap-3 或 gap-4
```

### 响应式断点
```
sm: 640px  - 手机横屏
md: 768px  - 平板
lg: 1024px - 桌面
```

## 组件模式

### 卡片
```tsx
<Card className="glass !rounded-xl md:!rounded-2xl">
  <motion.div whileHover={{ boxShadow: '0 15px 40px -10px rgba(0,0,0,0.1)' }}>
    {/* 内容 */}
  </motion.div>
</Card>
```

### 按钮
```tsx
<Button
  variant="primary"
  className="!rounded-xl shadow-md shadow-primary-500/30"
>
  操作 →
</Button>
```

### 页面过渡
```tsx
<PageTransition>
  <FadeIn delay={0.1}>
    {/* Header */}
  </FadeIn>
  <SlideUp delay={0.2}>
    {/* Content */}
  </SlideUp>
</PageTransition>
```

## 禁止事项
- ❌ 不使用纯直角 (除非特殊需求)
- ❌ 不使用过重的阴影
- ❌ 不使用过于鲜艳的纯色块
- ❌ 避免无动效的状态切换
