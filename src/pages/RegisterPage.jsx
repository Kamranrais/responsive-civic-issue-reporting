import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullName.trim()) { toast.error('Please enter your full name.'); return }
    if (!form.email)           { toast.error('Please enter your email.'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return }

    setLoading(true)
    const { user, error } = await register(form.email, form.password, form.fullName)
    setLoading(false)

    if (error) { toast.error(error.message || 'Registration failed.'); return }
    toast.success('Account created! Welcome to JanSight 🎉')
    navigate('/')
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of active citizens</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            placeholder="Rahul Sharma"
            autoComplete="name"
            required
          />
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
            placeholder="At least 6 characters"
            autoComplete="new-password"
            hint="Minimum 6 characters"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
            By creating an account, you agree to use this platform responsibly. False reports may be removed.
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-navy-700 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
