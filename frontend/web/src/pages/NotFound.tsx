import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-4 px-6">
      <p className="text-8xl font-bold text-brand-500/20 select-none">404</p>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-muted-foreground max-w-xs">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Button variant="primary" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  )
}
