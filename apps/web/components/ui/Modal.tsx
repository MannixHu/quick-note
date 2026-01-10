'use client'

import { cn } from '@app/shared'
import { Modal as AntModal, type ModalProps as AntModalProps } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'

export interface ModalProps extends AntModalProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeWidths = {
  sm: 400,
  md: 520,
  lg: 720,
  xl: 1000,
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

export const Modal = ({ children, className, size = 'md', open, ...props }: ModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <AntModal
          open={open}
          width={sizeWidths[size]}
          className={cn('rounded-[var(--radius-xl)]', className)}
          modalRender={(modal) => (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {modal}
            </motion.div>
          )}
          maskClosable
          centered
          {...props}
        >
          {children}
        </AntModal>
      )}
    </AnimatePresence>
  )
}

export default Modal
