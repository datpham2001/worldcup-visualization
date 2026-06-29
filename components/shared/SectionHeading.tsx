import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  className?: string
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-6 bg-accent-gold rounded-full" />
        <h2 className="text-xl font-bold text-text-primary tracking-tight">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm text-text-muted ml-4">{subtitle}</p>
      )}
    </div>
  )
}
