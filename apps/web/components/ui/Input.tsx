'use client'

import { cn } from '@app/shared/utils/cn'
import { Input as AntInput, type InputProps as AntInputProps, type InputRef } from 'antd'
import { motion } from 'framer-motion'
import { forwardRef, useId, useState } from 'react'

export interface InputProps extends AntInputProps {
  error?: string
  label?: string
}

export const Input = forwardRef<InputRef, InputProps>(
  ({ error, label, className, onFocus, onBlur, id: propId, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const generatedId = useId()
    const inputId = propId ?? generatedId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <motion.div
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.15 }}
        >
          <AntInput
            ref={ref}
            id={inputId}
            status={error ? 'error' : undefined}
            className={cn(
              'rounded-[var(--radius-md)]',
              'border-[var(--gray-300)]',
              'transition-all duration-200',
              'focus:border-[var(--primary-500)]',
              error && 'border-[var(--error)]',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-[var(--error)]"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
