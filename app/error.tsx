'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <h2 className="text-xl font-bold text-text-primary">Something went wrong</h2>
      <p className="text-text-secondary text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
