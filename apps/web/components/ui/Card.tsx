'use client'

import { cn } from '@app/shared'
import { Card as AntCard, type CardProps as AntCardProps } from 'antd'
import { type HTMLMotionProps, motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface CardProps extends Omit<AntCardProps, 'title'> {
  hoverable?: boolean
  glass?: boolean
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn('mb-4', className)}>{children}</div>
)

const CardBody = ({ children, className }: CardBodyProps) => (
  <div className={cn('', className)}>{children}</div>
)

const CardFooter = ({ children, className }: CardFooterProps) => (
  <div className={cn('mt-4 pt-4 border-t border-[var(--gray-200)]', className)}>{children}</div>
)

export const Card = ({
  children,
  className,
  hoverable = false,
  glass = false,
  ...props
}: CardProps) => {
  const motionProps: HTMLMotionProps<'div'> = hoverable
    ? {
        whileHover: { y: -4, boxShadow: 'var(--shadow-xl)' },
        transition: { duration: 0.2 },
      }
    : {}

  return (
    <motion.div {...motionProps}>
      <AntCard
        className={cn(
          'rounded-[var(--radius-lg)]',
          'border border-[var(--gray-200)]',
          'transition-all duration-200',
          glass && 'glass',
          hoverable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </AntCard>
    </motion.div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
