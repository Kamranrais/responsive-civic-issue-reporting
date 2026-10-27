import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, IS_DEMO } from '../lib/supabase'
import { demoAuth } from '../lib/demo'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO) {
      const demoUser = demoAuth.getUser()
      setUser(demoUser)
      setLoading(false)
      return
    }

    // Real Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Login ─────────────────────────────────────────────────────────────────
  async function login(email, password) {
    if (IS_DEMO) {
      const u = demoAuth.login(email, password)
      setUser(u)
      return { user: u, error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { user: data?.user, error }
  }

  // ─── Register ──────────────────────────────────────────────────────────────
  async function register(email, password, fullName) {
    if (IS_DEMO) {
      const u = demoAuth.login(email, password, fullName)
      setUser(u)
      return { user: u, error: null }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { user: data?.user, error }
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    if (IS_DEMO) {
      demoAuth.logout()
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  // ─── Profile helpers ───────────────────────────────────────────────────────
  const isAdmin = IS_DEMO
    ? user?.role === 'admin'
    : user?.user_metadata?.role === 'admin'

  const displayName = IS_DEMO
    ? user?.full_name
    : user?.user_metadata?.full_name || user?.email

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, displayName, IS_DEMO }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
