export function Spinner({ className = '', size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <svg
      className={`animate-spin ${sizes[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="text-navy-900 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    </div>
  )
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner className="text-navy-900" />
    </div>
  )
}
