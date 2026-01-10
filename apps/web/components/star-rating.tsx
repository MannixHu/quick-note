'use client'

import { StarFilled, StarOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface StarRatingProps {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

const sizeMap = {
  small: 'text-lg',
  medium: 'text-2xl',
  large: 'text-3xl',
}

const labels = ['', '不太喜欢', '一般', '还不错', '喜欢', '非常喜欢']

export function StarRating({
  value = 0,
  onChange,
  disabled = false,
  size = 'medium',
  showLabel = true,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const displayValue = hoverValue || value

  const handleClick = (rating: number) => {
    if (disabled) return
    onChange?.(rating)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={disabled}
            className={`${sizeMap[size]} transition-colors ${
              disabled ? 'cursor-default' : 'cursor-pointer'
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            whileHover={disabled ? {} : { scale: 1.2 }}
            whileTap={disabled ? {} : { scale: 0.9 }}
          >
            {star <= displayValue ? (
              <StarFilled className="text-yellow-400" />
            ) : (
              <StarOutlined className="text-gray-300 dark:text-gray-600" />
            )}
          </motion.button>
        ))}
      </div>
      {showLabel && displayValue > 0 && (
        <motion.span
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {labels[displayValue]}
        </motion.span>
      )}
    </div>
  )
}

export default StarRating
