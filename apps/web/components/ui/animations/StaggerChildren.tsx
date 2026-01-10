'use client'

import { type Variants, motion } from 'framer-motion'
import { Children, type ReactNode } from 'react'

export interface StaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
  duration?: number
  className?: string
  as?: 'div' | 'ul' | 'ol' | 'section'
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const StaggerChildren = ({
  children,
  staggerDelay = 0.1,
  duration = 0.4,
  className,
  as: Component = 'div',
}: StaggerChildrenProps) => {
  const MotionComponent = motion[Component]

  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {Children.map(children, (child) => (
        <motion.div variants={itemVariants} transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}>
          {child}
        </motion.div>
      ))}
    </MotionComponent>
  )
}

// Alias for backwards compatibility
export const StaggerList = StaggerChildren

export default StaggerChildren
