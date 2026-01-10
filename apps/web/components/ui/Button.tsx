'use client'

import { cn } from '@app/shared'
import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd'
import { motion } from 'framer-motion'
import { forwardRef } from 'react'

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  isLoading?: boolean
}

const variantStyles = {
  primary:
    'bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white border-[var(--primary-500)]',
  secondary:
    'bg-transparent hover:bg-[var(--gray-100)] text-[var(--text-primary)] border-[var(--gray-300)]',
  ghost: 'bg-transparent hover:bg-[var(--gray-100)] text-[var(--text-primary)] border-transparent',
  danger: 'bg-[var(--error)] hover:bg-red-600 text-white border-[var(--error)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, className, children, disabled, ...props }, ref) => {
    const antType = variant === 'primary' ? 'primary' : variant === 'danger' ? 'primary' : 'default'

    return (
      <motion.div
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <AntButton
          ref={ref}
          type={antType}
          loading={isLoading}
          disabled={disabled}
          danger={variant === 'danger'}
          className={cn(
            'inline-flex items-center justify-center gap-2',
            'font-medium rounded-[var(--radius-md)]',
            'transition-all duration-200',
            variantStyles[variant],
            className
          )}
          {...props}
        >
          {children}
        </AntButton>
      </motion.div>
    )
  }
)

Button.displayName = 'Button'

export default Button
