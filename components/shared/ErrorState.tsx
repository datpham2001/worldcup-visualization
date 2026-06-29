import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message = 'Failed to load data. Please try again.' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
      <AlertCircle className="w-8 h-8 text-accent-red" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
