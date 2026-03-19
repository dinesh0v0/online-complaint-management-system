import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowRight, Paperclip } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Panel } from '../components/Panel'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import {
  ACCEPTED_EVIDENCE_TYPES,
  COMPLAINT_CATEGORIES,
  EVIDENCE_BUCKET,
  MAX_EVIDENCE_SIZE,
} from '../lib/constants'
import { supabase } from '../lib/supabase'
import { prettyFileSize, sanitizeFileName } from '../lib/utils'

const initialForm = {
  title: '',
  category: COMPLAINT_CATEGORIES[0],
  description: '',
  incident_date: new Date().toISOString().slice(0, 10),
}

export function NewComplaintPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!ACCEPTED_EVIDENCE_TYPES.includes(selectedFile.type)) {
      setError('Evidence must be a JPG, PNG, WEBP, or PDF file.')
      event.target.value = ''
      return
    }

    if (selectedFile.size > MAX_EVIDENCE_SIZE) {
      setError('Evidence must be 10 MB or smaller.')
      event.target.value = ''
      return
    }

    setError('')
    setFile(selectedFile)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!session?.access_token || !session?.user?.id || !supabase) {
      setError('The secure session is not ready yet. Please sign in again.')
      return
    }

    setSubmitting(true)
    setError('')

    let uploadedPath = null

    try {
      if (file) {
        const filePath = `${session.user.id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
        const { error: uploadError } = await supabase.storage.from(EVIDENCE_BUCKET).upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        })

        if (uploadError) {
          throw uploadError
        }

        uploadedPath = filePath
      }

      await api.createComplaint(session.access_token, {
        ...form,
        evidence_bucket: EVIDENCE_BUCKET,
        evidence_path: uploadedPath,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['citizen-complaints'] }),
        queryClient.invalidateQueries({ queryKey: ['citizen-complaint-stats'] }),
      ])

      navigate('/portal')
    } catch (submitError) {
      if (uploadedPath) {
        await supabase.storage.from(EVIDENCE_BUCKET).remove([uploadedPath])
      }

      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">Complaint intake</p>
        <h2 className="mt-2 font-display text-4xl text-ink">Submit a new complaint</h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
          Provide clear facts, the date of the incident, and any supporting evidence. Large files stay blocked automatically to protect the upload flow.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Complaint title
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-line/70 bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                placeholder="Short, clear title"
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-line/70 bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
              >
                {COMPLAINT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-ink">
            Detailed description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={7}
              className="mt-2 w-full rounded-2xl border border-line/70 bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
              placeholder="Describe what happened, where it happened, and any useful context for investigators."
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Incident date
              <input
                type="date"
                name="incident_date"
                value={form.incident_date}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-line/70 bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              Evidence upload
              <input
                type="file"
                accept={ACCEPTED_EVIDENCE_TYPES.join(',')}
                onChange={handleFileChange}
                className="mt-2 block w-full rounded-2xl border border-dashed border-line/80 bg-canvas/70 px-4 py-3 text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </label>
          </div>

          {file ? (
            <div className="flex items-center gap-3 rounded-2xl border border-line/70 bg-canvas/60 px-4 py-3 text-sm text-muted">
              <Paperclip size={18} />
              <span>
                {file.name} - {prettyFileSize(file.size)}
              </span>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-4 text-sm font-semibold text-white shadow transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{submitting ? 'Submitting complaint...' : 'Submit complaint'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </Panel>

      <div className="space-y-6">
        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Submission checklist</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
            <li>- Use a specific title that helps triage the complaint quickly.</li>
            <li>- Write the timeline in plain language and include locations when relevant.</li>
            <li>- Upload only JPG, PNG, WEBP, or PDF evidence up to 10 MB.</li>
            <li>- After submission, the dashboard begins tracking status changes automatically.</li>
          </ul>
        </Panel>

        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">What happens next</p>
          <h3 className="mt-2 font-display text-2xl text-ink">Pending / Investigation / Resolved</h3>
          <p className="mt-4 text-sm leading-8 text-muted">
            Police admins receive the complaint in the central operations board, where they can inspect evidence, add internal notes, and advance the case status.
          </p>
        </Panel>
      </div>
    </div>
  )
}
