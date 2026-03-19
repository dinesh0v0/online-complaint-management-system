import { useEffect, useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ClipboardList, Eye, LineChart, Save, StickyNote, UsersRound } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { MetricCard } from '../components/MetricCard'
import { Panel } from '../components/Panel'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/constants'
import { supabase } from '../lib/supabase'
import { formatDate, formatStatus } from '../lib/utils'

const EMPTY_ARRAY = []

export function AdminDashboardPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selectedId, setSelectedId] = useState('')
  const [statusDraft, setStatusDraft] = useState('pending')
  const [noteDraft, setNoteDraft] = useState('')
  const [feedback, setFeedback] = useState('')

  const complaintsQuery = useQuery({
    queryKey: ['admin-complaints', statusFilter, sort],
    queryFn: () => api.getAdminComplaints(session.access_token, { status: statusFilter, sort }),
    enabled: Boolean(session?.access_token),
    refetchInterval: 15000,
  })

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(session.access_token),
    enabled: Boolean(session?.access_token),
    refetchInterval: 15000,
  })

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    const channel = supabase
      .channel('admin-complaints-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['admin-complaints'] })
          void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])

  const complaints = complaintsQuery.data ?? EMPTY_ARRAY
  const stats = statsQuery.data
  const selectedComplaint = complaints.find((complaint) => complaint.id === selectedId) || complaints[0] || null
  const activeStatusValue =
    selectedComplaint && selectedComplaint.id === selectedId ? statusDraft : selectedComplaint?.status || 'pending'

  const groupedComplaints = useMemo(() => {
    const groups = {}

    STATUS_ORDER.forEach((status) => {
      groups[status] = complaints.filter((complaint) => complaint.status === status)
    })

    return groups
  }, [complaints])

  const updateStatusMutation = useMutation({
    mutationFn: () => {
      if (!selectedComplaint?.id) {
        throw new Error('Select a complaint before saving changes.')
      }

      return api.updateComplaint(session.access_token, selectedComplaint.id, { status: activeStatusValue })
    },
    onSuccess: async (updatedComplaint) => {
      setFeedback('Status updated.')
      setSelectedId(updatedComplaint.id)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-complaints'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
      ])
    },
    onError: (mutationError) => setFeedback(mutationError.message),
  })

  const noteMutation = useMutation({
    mutationFn: () => {
      if (!selectedComplaint?.id) {
        throw new Error('Select a complaint before adding a note.')
      }

      return api.addComplaintNote(session.access_token, selectedComplaint.id, { note: noteDraft })
    },
    onSuccess: async (updatedComplaint) => {
      setFeedback('Internal note added.')
      setNoteDraft('')
      setSelectedId(updatedComplaint.id)
      await queryClient.invalidateQueries({ queryKey: ['admin-complaints'] })
    },
    onError: (mutationError) => setFeedback(mutationError.message),
  })

  const handleOpenEvidence = async (complaint) => {
    if (!complaint?.evidence_path || !supabase) {
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-strong">Command overview</p>
          <h2 className="mt-2 font-display text-4xl text-ink">Operations board</h2>
          <p className="mt-2 text-base text-muted">Scan complaint load, sort priorities, and update case progress from one board.</p>
        </div>
        {feedback ? <p className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm text-accent-strong">{feedback}</p> : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ClipboardList} label="Total complaints" value={stats?.counts?.total || 0} detail="Visible across the full system." />
        <MetricCard icon={AlertTriangle} label="Pending" value={stats?.counts?.pending || 0} detail="Awaiting initial action." tone="warning" />
        <MetricCard icon={LineChart} label="Under investigation" value={stats?.counts?.under_investigation || 0} detail="Active review pipeline." />
        <MetricCard icon={UsersRound} label="Resolved" value={stats?.counts?.resolved || 0} detail="Closed and documented." tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Category trend</p>
              <h3 className="mt-2 font-display text-2xl text-ink">Complaint categories</h3>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categories || []}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#c8d1de" opacity={0.3} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#758297" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#758297" />
                <Tooltip />
                <Bar dataKey="count" fill="#0F766E" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Board controls</p>
              <h3 className="mt-2 font-display text-2xl text-ink">Filter complaints</h3>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-full border border-line/70 bg-canvas/70 px-4 py-2 text-sm text-ink outline-none"
              >
                <option value="all">All statuses</option>
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-full border border-line/70 bg-canvas/70 px-4 py-2 text-sm text-ink outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="status">Sort by status</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="rounded-[1.5rem] border border-line/70 bg-canvas/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-xl text-ink">{STATUS_LABELS[status]}</h4>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-muted dark:bg-white/5">
                    {groupedComplaints[status]?.length || 0}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {groupedComplaints[status]?.map((complaint) => (
                    <button
                      key={complaint.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(complaint.id)
                        setStatusDraft(complaint.status)
                        setFeedback('')
                      }}
                      className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
                        selectedId === complaint.id
                          ? 'border-accent bg-accent/10 shadow'
                          : 'border-line/70 bg-white/80 hover:border-accent/40 dark:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-ink">{complaint.title}</p>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{complaint.category}</p>
                      <p className="mt-3 text-sm text-muted">{complaint.citizen?.full_name || 'Citizen'}</p>
                      <p className="mt-1 text-xs text-muted">{formatDate(complaint.submitted_at)}</p>
                    </button>
                  ))}

                  {!groupedComplaints[status]?.length ? (
                    <div className="rounded-[1.25rem] border border-dashed border-line/80 px-4 py-6 text-center text-sm text-muted">
                      No complaints in this column.
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        {selectedComplaint ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-3xl text-ink">{selectedComplaint.title}</h3>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-strong">{selectedComplaint.category}</p>
              <p className="mt-4 text-sm leading-8 text-muted">{selectedComplaint.description}</p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-line/70 bg-canvas/60 p-4 text-sm text-muted">
                  <p className="font-semibold text-ink">Citizen</p>
                  <p className="mt-2">{selectedComplaint.citizen?.full_name}</p>
                  <p>{selectedComplaint.citizen?.email}</p>
                </div>
                <div className="rounded-[1.4rem] border border-line/70 bg-canvas/60 p-4 text-sm text-muted">
                  <p className="font-semibold text-ink">Timeline</p>
                  <p className="mt-2">Incident: {formatDate(selectedComplaint.incident_date)}</p>
                  <p>Submitted: {formatDate(selectedComplaint.submitted_at)}</p>
                  <p>Updated: {formatDate(selectedComplaint.updated_at)}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleOpenEvidence(selectedComplaint)}
                  className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/80 px-4 py-2 text-sm font-semibold text-muted transition hover:text-ink dark:bg-white/5"
                >
                  <Eye size={16} />
                  <span>{selectedComplaint.evidence_path ? 'Open evidence' : 'No evidence attached'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-line/70 bg-canvas/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Status update</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={activeStatusValue}
                    onChange={(event) => {
                      setSelectedId(selectedComplaint.id)
                      setStatusDraft(event.target.value)
                    }}
                    className="w-full rounded-2xl border border-line/70 bg-white/80 px-4 py-3 text-sm text-ink outline-none dark:bg-white/5"
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => updateStatusMutation.mutate()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow disabled:opacity-60"
                  >
                    <Save size={16} />
                    <span>{updateStatusMutation.isPending ? 'Saving...' : 'Save status'}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-line/70 bg-canvas/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Internal notes</p>
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  rows={4}
                  placeholder="Add a note for investigators or case supervisors."
                  className="mt-4 w-full rounded-2xl border border-line/70 bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent dark:bg-white/5"
                />
                <button
                  type="button"
                  disabled={noteMutation.isPending || noteDraft.trim().length < 4}
                  onClick={() => noteMutation.mutate()}
                  className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-line/70 bg-white/80 px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink disabled:opacity-60 dark:bg-white/5"
                >
                  <StickyNote size={16} />
                  <span>{noteMutation.isPending ? 'Adding note...' : 'Add note'}</span>
                </button>

                <div className="mt-5 space-y-3">
                  {selectedComplaint.notes?.length ? (
                    selectedComplaint.notes.map((note) => (
                      <div key={note.id} className="rounded-2xl border border-line/70 bg-white/80 p-4 text-sm dark:bg-white/5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-ink">{note.author?.full_name || 'Admin note'}</p>
                          <p className="text-xs text-muted">{formatDate(note.created_at)}</p>
                        </div>
                        <p className="mt-3 leading-7 text-muted">{note.note}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-line/80 px-4 py-5 text-sm text-muted">
                      No internal notes recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-line/80 bg-canvas/60 p-10 text-center">
            <h3 className="font-display text-3xl text-ink">No complaint selected</h3>
            <p className="mt-3 text-sm leading-7 text-muted">Choose a complaint from the board to inspect citizen details, evidence, and note history.</p>
          </div>
        )}
      </Panel>
    </div>
  )
}
