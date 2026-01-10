'use client'

import { cn } from '@app/shared'
import { type HTMLMotionProps, motion } from 'framer-motion'

export interface SkeletonProps extends Omit<HTMLMotionProps<'div'>, 'animate'> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export const Skeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animate = true,
  style: propStyle,
  ...props
}: SkeletonProps) => {
  const baseStyles = cn(
    'bg-[var(--gray-200)]',
    animate && 'animate-shimmer',
    variant === 'circular' && 'rounded-full',
    variant === 'text' && 'rounded-[var(--radius-sm)]',
    variant === 'rectangular' && 'rounded-[var(--radius-md)]',
    className
  )

  const style = {
    ...propStyle,
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1em' : undefined),
  }

  return (
    <motion.div
      className={baseStyles}
      style={style}
      initial={{ opacity: 0.6 }}
      animate={animate ? { opacity: [0.6, 0.8, 0.6] } : undefined}
      transition={animate ? { duration: 1.5, repeat: Number.POSITIVE_INFINITY } : undefined}
      {...props}
    />
  )
}

// Preset skeleton components
export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} variant="text" height={16} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
)

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('p-6 rounded-[var(--radius-lg)] border border-[var(--gray-200)]', className)}>
    <Skeleton height={24} width="40%" className="mb-4" />
    <SkeletonText lines={3} />
    <div className="flex gap-2 mt-4">
      <Skeleton height={32} width={80} />
      <Skeleton height={32} width={80} />
    </div>
  </div>
)

// Feature-specific skeleton components
export const TimeBlockGridSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('glass rounded-xl md:rounded-2xl overflow-hidden', className)}>
    <div className="grid grid-cols-[50px_1fr] md:grid-cols-[60px_1fr]">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="contents">
          <div className="flex h-10 md:h-12 items-center justify-end border-b border-r border-gray-200/50 dark:border-gray-700/50 pr-2 md:pr-3">
            <Skeleton width={40} height={16} />
          </div>
          <div className="h-10 md:h-12 border-b border-gray-200/50 dark:border-gray-700/50 px-2 md:px-4 flex items-center">
            <Skeleton width="30%" height={20} />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const QuestionCardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('glass rounded-xl md:rounded-2xl p-6', className)}>
    <div className="flex items-center gap-2 mb-6">
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton width={100} height={20} />
      <div className="ml-auto">
        <Skeleton width={80} height={16} />
      </div>
    </div>
    <Skeleton height={24} className="mb-4" />
    <Skeleton height={100} className="mb-4" />
    <div className="flex gap-2">
      <Skeleton width={100} height={40} />
      <Skeleton width={100} height={40} />
    </div>
  </div>
)

export const StatsSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('glass rounded-xl md:rounded-2xl p-4 md:p-6', className)}>
    <Skeleton width="40%" height={24} className="mb-4" />
    <div className="text-center mb-6">
      <Skeleton width={80} height={48} className="mx-auto mb-2" />
      <Skeleton width={60} height={16} className="mx-auto" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton width={60} height={16} />
          </div>
          <Skeleton width={30} height={16} />
        </div>
      ))}
    </div>
  </div>
)

export default Skeleton
