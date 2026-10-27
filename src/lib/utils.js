import { v4 as uuidv4 } from 'uuid'

// ─── Complaint ID Generator ───────────────────────────────────────────────────
export function generateComplaintId() {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 900000 + 100000)
  return `JS-${year}-${random}`
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export function formatDate(dateString, options = {}) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatDateTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(dateString) {
  if (!dateString) return ''
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (seconds < 60) return 'just now'
  const intervals = [
    { label: 'year',   secs: 31536000 },
    { label: 'month',  secs: 2592000  },
    { label: 'day',    secs: 86400    },
    { label: 'hour',   secs: 3600     },
    { label: 'minute', secs: 60       },
  ]
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

// ─── Status Helpers ───────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  submitted:    { label: 'Submitted',    color: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500'   },
  under_review: { label: 'Under Review', color: 'amber',  bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-500'  },
  assigned:     { label: 'Assigned',     color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  in_progress:  { label: 'In Progress',  color: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  resolved:     { label: 'Resolved',     color: 'green',  bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
  closed:       { label: 'Closed',       color: 'gray',   bg: 'bg-gray-100',   text: 'text-gray-800',   dot: 'bg-gray-500'   },
}

// ─── Category Helpers ─────────────────────────────────────────────────────────
export const CATEGORY_CONFIG = {
  pothole:        { label: 'Pothole',        icon: '🕳️',  color: 'red'    },
  garbage:        { label: 'Garbage',        icon: '🗑️',  color: 'yellow' },
  waterlogging:   { label: 'Waterlogging',   icon: '💧',  color: 'cyan'   },
  streetlight:    { label: 'Street Light',   icon: '💡',  color: 'amber'  },
  infrastructure: { label: 'Infrastructure', icon: '🏗️',  color: 'purple' },
  other:          { label: 'Other',          icon: '📋',  color: 'gray'   },
}

export const SEVERITY_CONFIG = {
  low:      { label: 'Low',      bg: 'bg-green-100',  text: 'text-green-700'  },
  medium:   { label: 'Medium',   bg: 'bg-yellow-100', text: 'text-yellow-700' },
  high:     { label: 'High',     bg: 'bg-orange-100', text: 'text-orange-700' },
  critical: { label: 'Critical', bg: 'bg-red-100',    text: 'text-red-700'    },
}

export const DEPARTMENTS = [
  'PWD (Public Works Department)',
  'Sanitation Department',
  'BWSSB / Jal Board',
  'Municipal Corporation',
  'Electricity Department',
  'Traffic Police',
  'NHAI',
  'GHMC',
  'CMWSSB',
  'Emergency Response Unit',
]

// ─── File Validation ──────────────────────────────────────────────────────────
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE_MB = 5

export function validateImage(file) {
  if (!file) return 'Please select an image.'
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed.'
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.`
  }
  return null
}

// ─── Distance (Haversine) ─────────────────────────────────────────────────────
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── UUID ─────────────────────────────────────────────────────────────────────
export { uuidv4 }
