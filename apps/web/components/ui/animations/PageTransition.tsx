'use client'

import { AnimatePresence, type Variants, motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface PageTransitionProps {
  children: ReactNode
  className?: string
  mode?: 'wait' | 'sync' | 'popLayout'
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
  },
}

const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as const,
}

export const PageTransition = ({ children, className, mode = 'wait' }: PageTransitionProps) => {
  return (
    <AnimatePresence mode={mode}>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
