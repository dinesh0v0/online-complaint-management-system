import clsx from 'clsx'

import { STATUS_LABELS } from './constants'

export function cn(...inputs) {
  return clsx(inputs)
}

export function formatDate(value, options = {}) {
  if (!value) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(value))
}

export function formatStatus(status) {
  return STATUS_LABELS[status] || status
}

export function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-{2,}/g, '-')
}

export function prettyFileSize(bytes) {
  if (!bytes) {
    return '0 KB'
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function routeForRole(role) {
  return role === 'admin' ? '/admin' : '/portal'
}
