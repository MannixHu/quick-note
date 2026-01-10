'use client'

import { useState } from 'react'

interface StarRatingProps {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const sizeMap = {
  small: 'text-lg',
  medium: 'text-2xl',
  large: 'text-3xl',
}

export function StarRating({
  value = 0,
  onChange,
  disabled = false,
  size = 'medium',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const displayValue = hoverValue || value

  const handleClick = (rating: number) => {
    if (disabled) return
    onChange?.(rating)
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`${sizeMap[size]} transition-opacity ${
            disabled ? 'cursor-default opacity-50' : 'cursor-pointer hover:opacity-80'
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        >
          {star <= displayValue ? '⭐️' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default StarRating
