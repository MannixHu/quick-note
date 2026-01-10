'use client'

import { cn } from '@app/shared/utils/cn'
import { Spin } from 'antd'
import { motion } from 'framer-motion'

export interface LoadingProps {
  size?: 'small' | 'default' | 'large'
  text?: string
  fullScreen?: boolean
  className?: string
}

export const Loading = ({
  size = 'default',
  text,
  fullScreen = false,
  className,
}: LoadingProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('flex flex-col items-center justify-center gap-3', className)}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
      >
        <Spin size={size} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-[var(--text-secondary)]"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)]">
        {content}
      </div>
    )
  }

  return content
}

export default Loading
