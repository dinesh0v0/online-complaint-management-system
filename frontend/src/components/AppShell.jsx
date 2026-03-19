import { LogOut, Plus, Shield, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { LogoPlaceholder } from './LogoPlaceholder'
import { ThemeToggle } from './ThemeToggle'

const shellConfig = {
  citizen: {
    title: 'Citizen Portal',
    subtitle: 'Track submitted reports, watch status changes, and send new complaints with evidence.',
    icon: UserRound,
    links: [
      { to: '/portal', label: 'Dashboard' },
      { to: '/portal/new', label: 'New Complaint', icon: Plus },
    ],
  },
  admin: {
    title: 'Police Admin Portal',
    subtitle: 'Monitor all complaints, move cases through investigation stages, and log internal notes.',
    icon: Shield,
    links: [{ to: '/admin', label: 'Operations Board' }],
  },
}

export function AppShell({ portal }) {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const config = shellConfig[portal]
  const Icon = config.icon

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="container pt-6">
        <div className="rounded-[2rem] border border-line/70 bg-surface/80 p-4 shadow-panel backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <LogoPlaceholder className="h-14 w-14" />
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                  <Icon size={14} />
                  <span>{config.title}</span>
                </div>
                <h1 className="mt-3 font-display text-3xl text-ink">{config.subtitle}</h1>
                <p className="mt-2 text-sm text-muted">Signed in as {profile?.full_name || 'User'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <ThemeToggle />
              <div className="flex flex-wrap items-center justify-end gap-2">
                {config.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/portal' || link.to === '/admin'}
                    className={({ isActive }) =>
                      `rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-accent text-white shadow'
                          : 'border border-line/70 bg-white/70 text-muted hover:text-ink dark:bg-white/5'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/70 px-4 py-2 text-sm font-semibold text-muted transition hover:text-ink dark:bg-white/5"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mt-8">
        <Outlet />
      </main>
    </div>
  )
}
