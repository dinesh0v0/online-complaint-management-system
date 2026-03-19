import { Link } from 'react-router-dom'

import { Panel } from '../components/Panel'

export function NotFoundPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Panel className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">404</p>
        <h1 className="mt-3 font-display text-4xl text-ink">This route is not available.</h1>
        <p className="mt-3 text-sm leading-7 text-muted">Use the home page to enter the citizen or admin portal.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow">
          Return home
        </Link>
      </Panel>
    </div>
  )
}
