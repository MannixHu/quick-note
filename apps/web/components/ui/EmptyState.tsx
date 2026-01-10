'use client'

import { cn } from '@app/shared/utils/cn'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode | string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export const EmptyState = ({
  icon = '📭',
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4"
      >
        {typeof icon === 'string' ? (
          <span className="text-5xl" role="img" aria-hidden>
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
        className="text-lg font-semibold text-[var(--text-primary)] mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-[var(--text-secondary)] max-w-sm mb-6"
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
