'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface TeamFlagProps {
  logoUrl: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
}

export function TeamFlag({ logoUrl, name, size = 'md', className }: TeamFlagProps) {
  const px = sizes[size]
  return (
    <div
      className={cn('relative shrink-0 rounded-full overflow-hidden bg-bg-elevated', className)}
      style={{ width: px, height: px }}
    >
      <Image
        src={logoUrl}
        alt={name}
        width={px}
        height={px}
        className="object-contain p-0.5"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement
          target.style.display = 'none'
        }}
        unoptimized
      />
    </div>
  )
}
