'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('max-w-7xl mx-auto px-4 pt-20 pb-16', className)}
    >
      {children}
    </motion.main>
  )
}
