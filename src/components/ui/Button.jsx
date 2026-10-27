import { forwardRef } from 'react'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  outline:   'btn-outline',
  ghost:     'btn-ghost',
  danger:    'inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: '',
  lg: 'text-base px-6 py-3',
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, loading, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
})
