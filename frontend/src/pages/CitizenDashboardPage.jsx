import { useEffect, useMemo, useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, Clock3, Eye, FileText, Plus, ShieldAlert } from 'lucide-react'
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'

import { MetricCard } from '../components/MetricCard'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { STATUS_LABELS } from '../lib/constants'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/utils'

const pieColors = ['#F59E0B', '#0F766E', '#16A34A']
const MotionDiv = motion.div

export function CitizenDashboardPage() {
  const { session, profile } = useAuth()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState('')

  const complaintsQuery = useQuery({
    queryKey: ['citizen-complaints'],
    queryFn: () => api.getMyComplaints(session.access_token),
    enabled: Boolean(session?.access_token),
    refetchInterval: 15000,
  })

  const statsQuery = useQuery({
    queryKey: ['citizen-complaint-stats'],
    queryFn: () => api.getMyComplaintStats(session.access_token),
    enabled: Boolean(session?.access_token),
    refetchInterval: 15000,
  })

  useEffect(() => {
    if (!supabase || !session?.user?.id) {
      return undefined
    }

    const channel = supabase
      .channel(`citizen-complaints-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `citizen_id=eq.${session.user.id}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['citizen-complaints'] })
          void queryClient.invalidateQueries({ queryKey: ['citizen-complaint-stats'] })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient, session?.user?.id])

  const complaints = complaintsQuery.data || []
  const stats = statsQuery.data

  const pieData = useMemo(
    () =>
      Object.entries(stats?.counts || {})
        .filter(([key]) => key !== 'total')
        .map(([key, value]) => ({ name: STATUS_LABELS[key], value })),
    [stats?.counts],
  )

  const handleOpenEvidence = async (complaint) => {
    if (!complaint.evidence_path || !supabase) {
      setFeedback('No evidence file is attached to this complaint.')
      return
    }

    const { data, error } = await supabase.storage
      .from(complaint.evidence_bucket)
      .createSignedUrl(complaint.evidence_path, 1800)

    if (error) {
      setFeedback(error.message)
      return
    }

    setFeedback('')
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-strong">Real-time complaint tracking</p>
          <h2 className="mt-2 font-display text-4xl text-ink">Welcome, {profile?.full_name?.split(' ')[0] || 'Citizen'}</h2>
          <p className="mt-2 text-base text-muted">Your complaints refresh automatically when case status changes arrive.</p>
        </div>

        <Link
          to="/portal/new"
          className="inline-flex items-center gap-2 self-start rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow"
        >
          <Plus size={16} />
          <span>Submit complaint</span>
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileText} label="Total complaints" value={stats?.counts?.total || 0} detail="All cases filed from this account." />
        <MetricCard icon={Clock3} label="Pending" value={stats?.counts?.pending || 0} detail="Waiting for review." tone="warning" />
        <MetricCard
          icon={Activity}
          label="Under investigation"
          value={stats?.counts?.under_investigation || 0}
          detail="Currently being worked on."
        />
        <MetricCard icon={ShieldAlert} label="Resolved" value={stats?.counts?.resolved || 0} detail="Closed with final status." tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Submission trend</p>
              <h3 className="mt-2 font-display text-2xl text-ink">Recent activity</h3>
            </div>
            <span className="rounded-full border border-success/30 bg-success/10 px-3 py-2 text-xs font-semibold text-success">
              Live sync active
            </span>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.submissions_over_time || []}>
                <defs>
                  <linearGradient id="citizenArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#758297" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#758297" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0F766E" strokeWidth={3} fill="url(#citizenArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Status mix</p>
          <h3 className="mt-2 font-display text-2xl text-ink">Case distribution</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={102} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-line/70 bg-canvas/60 px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                  <span className="font-medium text-ink">{entry.name}</span>
                </div>
                <span className="font-semibold text-muted">{entry.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Complaint list</p>
            <h3 className="mt-2 font-display text-2xl text-ink">Submitted cases</h3>
          </div>
          {feedback ? <p className="text-sm text-danger">{feedback}</p> : null}
        </div>

        <div className="mt-6 grid gap-4">
          {complaints.length ? (
            complaints.map((complaint, index) => (
              <MotionDiv
                key={complaint.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[1.5rem] border border-line/70 bg-canvas/60 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-display text-2xl text-ink">{complaint.title}</h4>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p className="mt-2 text-sm font-medium text-accent-strong">{complaint.category}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{complaint.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {complaint.evidence_path ? (
                      <button
                        type="button"
                        onClick={() => void handleOpenEvidence(complaint)}
                        className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/80 px-4 py-2 text-sm font-semibold text-muted transition hover:text-ink dark:bg-white/5"
                      >
                        <Eye size={16} />
                        <span>View evidence</span>
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted">
                  <span className="rounded-full bg-white/70 px-3 py-2 dark:bg-white/5">Incident: {formatDate(complaint.incident_date)}</span>
                  <span className="rounded-full bg-white/70 px-3 py-2 dark:bg-white/5">Submitted: {formatDate(complaint.submitted_at)}</span>
                  <span className="rounded-full bg-white/70 px-3 py-2 dark:bg-white/5">Updated: {formatDate(complaint.updated_at)}</span>
                </div>
              </MotionDiv>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-line/80 bg-canvas/60 p-10 text-center">
              <h4 className="font-display text-2xl text-ink">No complaints submitted yet</h4>
              <p className="mt-3 text-sm leading-7 text-muted">Start by filing your first complaint to activate your dashboard timeline and status charts.</p>
              <Link
                to="/portal/new"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow"
              >
                <Plus size={16} />
                <span>New complaint</span>
              </Link>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
