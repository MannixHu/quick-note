'use client'

import { cn } from '@app/shared/utils/cn'
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

export default Skeleton
