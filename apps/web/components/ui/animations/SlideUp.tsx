'use client'

import { type HTMLMotionProps, type Variants, motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface SlideUpProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export const SlideUp = ({
  children,
  delay = 0,
  duration = 0.5,
  distance = 20,
  className,
  ...props
}: SlideUpProps) => {
  const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: distance },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default SlideUp
