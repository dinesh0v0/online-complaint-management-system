import { LoaderCircle, ShieldCheck } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { routeForRole } from '../lib/utils'
import { Panel } from './Panel'

function LoadingScreen({ label }) {
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Panel className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <LoaderCircle className="animate-spin" size={24} />
        </div>
        <h1 className="font-display text-2xl text-ink">Preparing your workspace</h1>
        <p className="mt-2 text-sm text-muted">{label}</p>
      </Panel>
    </div>
  )
}

export function RouteGuard({ allowedRole, children }) {
  const { loading, session, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen label="Verifying your secure session." />
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  if (!profile) {
    return <LoadingScreen label="Loading your access permissions." />
  }

  if (allowedRole && profile.role !== allowedRole) {
    return <Navigate to={routeForRole(profile.role)} replace />
  }

  return children
}

export function AuthRoute({ children }) {
  const { loading, session, profile } = useAuth()

  if (loading) {
    return <LoadingScreen label="Checking whether a session is already active." />
  }

  if (session && profile) {
    return <Navigate to={routeForRole(profile.role)} replace />
  }

  return children
}

export function AccessNotice() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-strong">
      <ShieldCheck size={16} />
      <span>Role-based access is enforced at both UI and API levels.</span>
    </div>
  )
}
