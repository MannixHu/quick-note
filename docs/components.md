# QuickNote 组件文档

## UI 组件库

所有 UI 组件位于 `apps/web/components/ui/` 目录下。

### Button

带动画效果的按钮组件。

```typescript
import { Button } from '@/components/ui'

// 使用
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="danger">危险按钮</Button>
<Button isLoading>加载中</Button>
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | 按钮样式 |
| isLoading | `boolean` | `false` | 加载状态 |
| children | `ReactNode` | - | 按钮内容 |

---

### Card

玻璃态卡片组件。

```typescript
import { Card } from '@/components/ui'

<Card
  title="卡片标题"
  hoverable
  className="custom-class"
>
  卡片内容
</Card>
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `ReactNode` | - | 卡片标题 |
| hoverable | `boolean` | `false` | 悬停效果 |
| glass | `boolean` | `true` | 玻璃态背景 |

---

### Loading

加载指示器组件。

```typescript
import { Loading } from '@/components/ui'

<Loading size="small" />
<Loading size="default" text="加载中..." />
<Loading fullScreen />
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| size | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| text | `string` | - | 加载文字 |
| fullScreen | `boolean` | `false` | 全屏模式 |

---

### Skeleton

骨架屏组件，用于加载状态占位。

```typescript
import { Skeleton, SkeletonText, SkeletonCard, TimeBlockGridSkeleton } from '@/components/ui'

// 基础骨架
<Skeleton width={200} height={20} />

// 文本骨架
<SkeletonText lines={3} />

// 卡片骨架
<SkeletonCard />

// 时间块网格骨架
<TimeBlockGridSkeleton />

// 问题卡片骨架
<QuestionCardSkeleton />

// 统计骨架
<StatsSkeleton />
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'text' \| 'circular' \| 'rectangular'` | `'rectangular'` | 形状 |
| width | `string \| number` | - | 宽度 |
| height | `string \| number` | - | 高度 |
| animate | `boolean` | `true` | 动画效果 |

---

### EmptyState

空状态组件，显示无数据时的提示。

```typescript
import { EmptyState, Button } from '@/components/ui'

<EmptyState
  icon="🎯"
  title="还没有时间块"
  description="开始记录你的时间，让每一刻都有意义"
  action={<Button onClick={handleCreate}>创建第一个</Button>}
  variant="fun"
/>
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| icon | `ReactNode \| string` | `'📭'` | 图标或 emoji |
| title | `string` | - | 标题 |
| description | `string` | - | 描述文字 |
| action | `ReactNode` | - | 操作按钮 |
| variant | `'default' \| 'compact' \| 'fun'` | `'default'` | 样式变体 |

---

## 动画组件

位于 `apps/web/components/ui/animations/` 目录。

### PageTransition

页面过渡动画包装器。

```typescript
import { PageTransition } from '@/components/ui'

export default function Page() {
  return (
    <PageTransition>
      <main>页面内容</main>
    </PageTransition>
  )
}
```

---

### FadeIn

淡入动画组件。

```typescript
import { FadeIn } from '@/components/ui'

<FadeIn delay={0.2}>
  <div>淡入的内容</div>
</FadeIn>
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| delay | `number` | `0` | 延迟时间 (秒) |
| duration | `number` | `0.4` | 动画时长 (秒) |

---

### SlideUp

向上滑入动画组件。

```typescript
import { SlideUp } from '@/components/ui'

<SlideUp delay={0.3}>
  <div>滑入的内容</div>
</SlideUp>
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| delay | `number` | `0` | 延迟时间 (秒) |
| duration | `number` | `0.5` | 动画时长 (秒) |
| distance | `number` | `20` | 滑动距离 (px) |

---

### StaggerChildren

子元素交错动画容器。

```typescript
import { StaggerChildren } from '@/components/ui'

<StaggerChildren staggerDelay={0.1}>
  <div>第一个</div>
  <div>第二个</div>
  <div>第三个</div>
</StaggerChildren>
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| staggerDelay | `number` | `0.1` | 子元素间隔 (秒) |

---

## 自定义 Hooks

位于 `apps/web/hooks/` 目录。

### useAuth

认证状态管理 Hook。

```typescript
import { useAuth } from '@/hooks/useAuth'

function Component() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <LoginButton onClick={() => login(email, password)} />
  }

  return <div>欢迎, {user?.name}</div>
}
```

**Returns:**
| 属性 | 类型 | 说明 |
|------|------|------|
| user | `User \| null` | 当前用户 |
| isAuthenticated | `boolean` | 是否已登录 |
| login | `(email, password) => Promise` | 登录方法 |
| logout | `() => void` | 登出方法 |

---

### useTimeBlocks

时间块操作 Hook。

```typescript
import { useTimeBlocks } from '@/hooks/useTimeBlocks'

function Component() {
  const {
    blocks,
    categories,
    isLoading,
    createBlock,
    deleteBlock,
    createCategory
  } = useTimeBlocks('user-id', '2024-01-10')
}
```

---

### useQuestion

每日问答 Hook。

```typescript
import { useQuestion } from '@/hooks/useQuestion'

function Component() {
  const {
    question,
    history,
    isLoading,
    submitAnswer,
    getNextQuestion
  } = useQuestion('user-id')
}
```

---

### useLocalStorage

本地存储 Hook。

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage'

function Component() {
  const [value, setValue] = useLocalStorage('key', 'defaultValue')
}
```

---

### useMediaQuery

媒体查询 Hook。

```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery'

function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
}
```

---

### useDebounce

防抖 Hook。

```typescript
import { useDebounce } from '@/hooks/useDebounce'

function Component() {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    // 使用防抖后的值进行搜索
    search(debouncedValue)
  }, [debouncedValue])
}
```

---

## CSS 工具类

### 动画类
- `.animate-fade-in` - 淡入
- `.animate-slide-up` - 向上滑入
- `.animate-scale-in` - 缩放进入
- `.animate-shimmer` - 闪烁效果
- `.animate-float` - 浮动效果

### 视觉效果类
- `.glass` - 玻璃态背景
- `.gradient-mesh` - 渐变网格背景
- `.gradient-text` - 渐变文字
- `.gradient-primary/warm/cool/sunset` - 预设渐变

### 交互类
- `.interactive-scale` - 悬停缩放
- `.interactive-lift` - 悬停抬起
- `.card-hover` - 卡片悬停效果
- `.card-glow` - 卡片发光效果
- `.btn-glow` - 按钮发光效果

### 其他
- `.custom-scrollbar` - 自定义滚动条
- `.focus-ring` - 焦点环
