'use client'

import { type HTMLMotionProps, type Variants, motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.4,
  className,
  ...props
}: FadeInProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
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

export default FadeIn
