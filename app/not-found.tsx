import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <span className="font-display text-8xl text-text-muted">404</span>
      <h1 className="text-2xl font-bold text-text-primary">Page not found</h1>
      <p className="text-text-secondary">The page you are looking for does not exist.</p>
      <Link href="/" className="text-accent-blue hover:underline mt-2">Return home</Link>
    </div>
  )
}
