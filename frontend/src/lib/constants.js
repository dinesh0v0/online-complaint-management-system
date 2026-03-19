export const COMPLAINT_CATEGORIES = [
  'Cybercrime',
  'Theft',
  'Public Safety',
  'Harassment',
  'Fraud',
  'Property Damage',
  'Traffic Incident',
  'Other',
]

export const STATUS_ORDER = ['pending', 'under_investigation', 'resolved']

export const STATUS_LABELS = {
  pending: 'Pending',
  under_investigation: 'Under Investigation',
  resolved: 'Resolved',
}

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export const ACCEPTED_EVIDENCE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export const MAX_EVIDENCE_SIZE = 10 * 1024 * 1024

export const EVIDENCE_BUCKET = import.meta.env.VITE_EVIDENCE_BUCKET || 'complaint-evidence'
