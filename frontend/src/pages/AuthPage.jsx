import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AccessNotice } from '../components/RouteGuard'
import { LogoPlaceholder } from '../components/LogoPlaceholder'
import { Panel } from '../components/Panel'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { routeForRole } from '../lib/utils'

const MotionDiv = motion.div

const initialState = {
  full_name: '',
  email: '',
  password: '',
}

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('sign-in')
  const [form, setForm] = useState(initialState)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const nextPath = useMemo(() => location.state?.from?.pathname, [location.state])

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'sign-in') {
        const response = await signIn({
          email: form.email,
          password: form.password,
        })

        navigate(nextPath || routeForRole(response.profile.role), { replace: true })
        return
      }

      const response = await signUp(form)

      if (response.profile && response.session) {
        navigate(routeForRole(response.profile.role), { replace: true })
        return
      }

      setMessage(response.message)
      setMode('sign-in')
      setForm((current) => ({ ...current, password: '' }))
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-12 pt-6">
      <div className="container">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-line/70 bg-surface/80 p-4 shadow-panel backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-4">
            <LogoPlaceholder className="h-14 w-14" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">Secure entry point</p>
              <h1 className="font-display text-2xl text-ink">Citizen and admin access</h1>
            </div>
          </Link>
          <ThemeToggle />
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <Panel className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent-strong">
                <ShieldCheck size={16} />
                <span>Two protected portal routes</span>
              </div>

              <h2 className="font-display text-4xl leading-tight text-ink">Log in once. Land in the right workspace automatically.</h2>
              <p className="text-base leading-8 text-muted">
                Citizens are routed to personal case tracking. Accounts marked as <code>admin</code> inside Supabase are routed to the police operations board.
              </p>

              <AccessNotice />

              <div className="grid gap-4 pt-2 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-line/70 bg-canvas/60 p-5">
                  <p className="text-sm font-semibold text-ink">Citizen portal</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Submit new complaints, attach evidence, and follow live status movement.</p>
                </div>
                <div className="rounded-[1.4rem] border border-line/70 bg-canvas/60 p-5">
                  <p className="text-sm font-semibold text-ink">Admin portal</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Sort the full queue, inspect complaint detail, and keep investigation notes internal.</p>
                </div>
              </div>

              {!isSupabaseConfigured ? (
                <div className="rounded-[1.4rem] border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                  Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> before using this portal.
                </div>
              ) : null}
            </Panel>
          </MotionDiv>

          <MotionDiv initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Authentication</p>
                  <h2 className="mt-2 font-display text-3xl text-ink">{mode === 'sign-in' ? 'Welcome back' : 'Create a citizen account'}</h2>
                </div>
                <div className="inline-flex rounded-full border border-line/70 bg-canvas/60 p-1">
                  {[
                    { value: 'sign-in', label: 'Sign in' },
                    { value: 'sign-up', label: 'Sign up' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setMode(option.value)
                        setError('')
                        setMessage('')
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        mode === option.value ? 'bg-accent text-white shadow' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {mode === 'sign-up' ? (
                  <label className="block text-sm font-medium text-ink">
                    Full name
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-2xl border border-line/70 bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                      placeholder="Your full name"
                    />
                  </label>
                ) : null}

                <label className="block text-sm font-medium text-ink">
                  Email address
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-line/70 bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                    placeholder="name@example.com"
                  />
                </label>

                <label className="block text-sm font-medium text-ink">
                  Password
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="mt-2 w-full rounded-2xl border border-line/70 bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                    placeholder="At least 8 characters"
                  />
                </label>

                {error ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                ) : null}

                {message ? (
                  <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{message}</div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || !isSupabaseConfigured}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-semibold text-white shadow transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LockKeyhole size={18} />
                  <span>{submitting ? 'Please wait...' : mode === 'sign-in' ? 'Sign in securely' : 'Create account'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </Panel>
          </MotionDiv>
        </div>
      </div>
    </div>
  )
}
