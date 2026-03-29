import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card hover={false} className="max-w-lg text-center p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">404 Error</p>
        <h1 className="mt-3 font-display text-4xl text-ink font-bold">Page Not Found</h1>
        <p className="mt-4 text-base leading-7 text-text-muted">The route you are looking for does not exist or you do not have permission to view it.</p>
        <div className="mt-8">
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
