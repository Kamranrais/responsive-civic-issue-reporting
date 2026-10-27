export function Card({ className = '', children, ...props }) {
  return (
    <div className={`card p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
}
