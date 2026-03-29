import { LoaderCircle, ShieldCheck } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { routeForRole } from '../lib/utils'
import { Card } from './ui/Card'

function LoadingScreen({ label }) {
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card hover={false} className="max-w-md text-center p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LoaderCircle className="animate-spin" size={32} />
        </div>
        <h1 className="font-display font-bold text-2xl text-text">Preparing your workspace</h1>
        <p className="mt-2 text-sm text-text-muted">{label}</p>
      </Card>
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
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
      <ShieldCheck size={16} />
      <span>Role-based access is enforced securely.</span>
    </div>
  )
}
