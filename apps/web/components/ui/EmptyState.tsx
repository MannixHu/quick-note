'use client'

import { cn } from '@app/shared'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode | string
  title: string
  description?: string
  action?: ReactNode
  className?: string
  variant?: 'default' | 'compact' | 'fun'
}

export const EmptyState = ({
  icon = '📭',
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) => {
  const isCompact = variant === 'compact'
  const isFun = variant === 'fun'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isCompact ? 'py-6 px-4' : 'py-12 px-6',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={
          isFun
            ? {
                scale: 1,
                y: [0, -8, 0],
              }
            : { scale: 1 }
        }
        transition={
          isFun
            ? {
                scale: { duration: 0.3, delay: 0.1 },
                y: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
              }
            : { duration: 0.3, delay: 0.1 }
        }
        className={cn('mb-4', isFun && 'drop-shadow-lg')}
      >
        {typeof icon === 'string' ? (
          <span
            className={cn('block', isCompact ? 'text-4xl' : 'text-5xl', isFun && 'text-6xl')}
            role="img"
            aria-hidden
          >
            {icon}
          </span>
        ) : (
          icon
        )}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'font-semibold text-gray-900 dark:text-gray-100 mb-2',
          isCompact ? 'text-base' : 'text-lg'
        )}
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'text-gray-500 dark:text-gray-400 max-w-sm',
            isCompact ? 'text-sm mb-4' : 'text-sm mb-6'
          )}
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}

export default EmptyState
