import { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  { label, error, hint, className = '', ...props },
  ref
) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input ref={ref} className={`input-field ${error ? 'border-red-400 focus:ring-red-400' : ''}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, error, className = '', children, ...props },
  ref
) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select ref={ref} className={`input-field bg-white ${error ? 'border-red-400' : ''}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        rows={4}
        className={`input-field resize-none ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})
