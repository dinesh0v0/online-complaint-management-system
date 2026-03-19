import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, BellRing, ShieldCheck, TimerReset } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { routeForRole } from '../lib/utils'
import { LogoPlaceholder } from '../components/LogoPlaceholder'
import { Panel } from '../components/Panel'
import { ThemeToggle } from '../components/ThemeToggle'

const MotionDiv = motion.div

const cards = [
  {
    title: 'Secure intake',
    body: 'Citizens submit structured evidence-backed reports while access stays role-gated end to end.',
    icon: ShieldCheck,
  },
  {
    title: 'Faster routing',
    body: 'Admins triage complaints from a single board and move cases across pending, active, and resolved stages.',
    icon: TimerReset,
  },
  {
    title: 'Visible progress',
    body: 'Dashboards surface volume, status movement, and category trends without overwhelming the workflow.',
    icon: BarChart3,
  },
]

export function HomePage() {
  const { profile, session } = useAuth()

  return (
    <div className="min-h-screen pb-14 pt-6">
      <div className="container">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-line/70 bg-surface/80 p-4 shadow-panel backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <LogoPlaceholder className="h-14 w-14 animate-float" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">Protected intake workspace</p>
              <h1 className="font-display text-2xl text-ink">Citizen reporting and police response in one flow</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              to={session && profile ? routeForRole(profile.role) : '/auth'}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow"
            >
              <span>{session && profile ? 'Open Portal' : 'Get Started'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <MotionDiv initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-semibold text-warning">
              <BellRing size={16} />
              <span>Styled for citizen clarity and admin speed</span>
            </div>
            <h2 className="mt-6 max-w-3xl font-display text-5xl leading-tight text-ink md:text-6xl">
              Report incidents, track updates, and manage resolutions without friction.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              The public-facing workspace keeps the submission process calm and guided, while the admin side gives investigators a
              focused board for triage, notes, and status control.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow transition hover:translate-y-[-1px]"
              >
                Citizen or Admin Sign In
              </Link>
              <a
                href="#workflow"
                className="rounded-full border border-line/70 bg-white/70 px-6 py-3 text-sm font-semibold text-muted transition hover:text-ink dark:bg-white/5"
              >
                View Workflow
              </a>
            </div>
          </MotionDiv>

          <MotionDiv initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.1 }}>
            <Panel className="relative overflow-hidden bg-gradient-to-br from-white/90 to-accent-soft/40 dark:from-white/10 dark:to-accent/10">
              <div className="absolute right-[-3rem] top-[-3rem] h-36 w-36 rounded-full bg-warning/20 blur-3xl" />
              <div className="absolute bottom-[-4rem] left-[-2rem] h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative space-y-6">
                <div className="rounded-[1.4rem] border border-white/60 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Live operations snapshot</p>
                      <p className="mt-2 font-display text-3xl text-ink">122 active complaints</p>
                    </div>
                    <div className="rounded-full bg-success/10 px-3 py-2 text-sm font-semibold text-success">+14 resolved today</div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-line/70 bg-canvas/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Pending</p>
                      <p className="mt-2 text-3xl font-bold text-ink">37</p>
                    </div>
                    <div className="rounded-2xl border border-line/70 bg-canvas/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Under review</p>
                      <p className="mt-2 text-3xl font-bold text-ink">54</p>
                    </div>
                    <div className="rounded-2xl border border-line/70 bg-canvas/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Resolved</p>
                      <p className="mt-2 text-3xl font-bold text-ink">31</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-line/70 bg-white/80 p-5 dark:bg-white/5">
                    <p className="text-sm font-semibold text-ink">Citizen experience</p>
                    <p className="mt-2 text-sm leading-7 text-muted">Simple reporting form, evidence upload, auto-refresh status tracking, and timeline cards.</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-line/70 bg-white/80 p-5 dark:bg-white/5">
                    <p className="text-sm font-semibold text-ink">Admin workspace</p>
                    <p className="mt-2 text-sm leading-7 text-muted">Kanban board, case details, internal notes, and category-level trend monitoring.</p>
                  </div>
                </div>
              </div>
            </Panel>
          </MotionDiv>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon

            return (
              <MotionDiv
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * index }}
              >
                <Panel>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-ink">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{card.body}</p>
                </Panel>
              </MotionDiv>
            )
          })}
        </section>

        <section id="workflow" className="mt-10 grid gap-5 lg:grid-cols-3">
          {['Submit complaint', 'Review and investigate', 'Close with visibility'].map((step, index) => (
            <Panel key={step} className="relative overflow-hidden">
              <div className="absolute right-4 top-4 text-5xl font-black text-line/70">0{index + 1}</div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">Workflow step</p>
              <h3 className="mt-4 font-display text-2xl text-ink">{step}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                {index === 0
                  ? 'Citizens enter title, category, narrative detail, incident date, and supporting evidence in one guided form.'
                  : index === 1
                    ? 'Admins filter cases, review attachments, record internal notes, and move the complaint into investigation.'
                    : 'Status changes feed back into the citizen dashboard so progress remains visible until the complaint is resolved.'}
              </p>
            </Panel>
          ))}
        </section>
      </div>
    </div>
  )
}
