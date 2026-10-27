import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, IS_DEMO } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields.'); return }
    setLoading(true)
    const { user, error } = await login(form.email, form.password)
    setLoading(false)
    if (error) { toast.error(error.message || 'Login failed.'); return }
    toast.success('Welcome back!')
    navigate(from, { replace: true })
  }

  // Quick demo shortcuts
  function loginAsAdmin() { setForm({ email: 'admin@jansight.in', password: 'demo1234' }) }
  function loginAsCitizen() { setForm({ email: 'citizen@jansight.in', password: 'demo1234' }) }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-navy-900 flex items-center justify-center">
              <span className="text-white text-xl font-bold">JS</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-navy-900 text-xl">JanSight</div>
              <div className="text-xs text-saffron-600">Civic Reports</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {IS_DEMO && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm font-medium mb-2">⚠️ Demo Mode — Quick Login</p>
            <p className="text-amber-700 text-xs mb-3">Click below to auto-fill credentials. Any email/password works in demo mode.</p>
            <div className="flex gap-2">
              <button onClick={loginAsCitizen} className="flex-1 text-xs bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors font-medium">
                👤 Login as Citizen
              </button>
              <button onClick={loginAsAdmin} className="flex-1 text-xs bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors font-medium">
                🔑 Login as Admin
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-navy-700 font-medium hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
