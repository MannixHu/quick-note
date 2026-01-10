'use client'

import { useState } from 'react'

interface StarRatingProps {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const sizeConfig = {
  small: { star: 12, gap: 1 },
  medium: { star: 14, gap: 2 },
  large: { star: 18, gap: 2 },
}

export function StarRating({
  value = 0,
  onChange,
  disabled = false,
  size = 'medium',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const displayValue = hoverValue || value
  const config = sizeConfig[size]

  const handleClick = (rating: number) => {
    if (disabled) return
    onChange?.(rating)
  }

  // 豆瓣风格：橙色 #fba026
  const activeColor = '#fba026'
  const inactiveColor = '#d8d8d8'

  return (
    <div
      className="inline-flex items-center"
      style={{ gap: config.gap }}
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={disabled ? 'cursor-default' : 'cursor-pointer'}
            style={{ padding: 0, border: 'none', background: 'none' }}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            aria-label={`${star} 星`}
          >
            <svg width={config.star} height={config.star} viewBox="0 0 10 10" aria-hidden="true">
              <path
                d="M5 0l1.12 3.45h3.63l-2.94 2.13 1.12 3.45L5 6.9 2.07 9.03l1.12-3.45L.25 3.45h3.63z"
                fill={isFilled ? activeColor : inactiveColor}
              />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

export default StarRating
