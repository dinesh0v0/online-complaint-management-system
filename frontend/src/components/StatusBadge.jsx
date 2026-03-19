import { formatStatus } from '../lib/utils'

const styles = {
  pending: 'border-warning/30 bg-warning/10 text-warning',
  under_investigation: 'border-accent/30 bg-accent/10 text-accent-strong',
  resolved: 'border-success/30 bg-success/10 text-success',
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status] || 'border-line bg-surface text-ink'}`}
    >
      {formatStatus(status)}
    </span>
  )
}
