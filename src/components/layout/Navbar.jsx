import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

export function Navbar() {
  const { user, logout, isAdmin, displayName, IS_DEMO } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
      isActive ? 'bg-navy-900 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-navy-900 flex items-center justify-center">
              <span className="text-white text-lg font-bold">JS</span>
            </div>
            <div>
              <span className="font-bold text-navy-900 text-lg leading-none block">JanSight</span>
              <span className="text-xs text-saffron-600 font-medium leading-none">Civic Reports</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/map" className={navLinkClass}>Map</NavLink>
            {user && <NavLink to="/report" className={navLinkClass}>Report Issue</NavLink>}
            {user && <NavLink to="/my-reports" className={navLinkClass}>My Reports</NavLink>}
            {user && isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {IS_DEMO && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium border border-amber-200">
                Demo Mode
              </span>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 max-w-[140px] truncate">
                  👤 {displayName}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Register</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {IS_DEMO && (
            <div className="text-xs bg-amber-100 text-amber-800 px-3 py-2 rounded-lg font-medium border border-amber-200 mb-2">
              ⚠️ Demo Mode — data stored locally only
            </div>
          )}
          <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/map" className={navLinkClass} onClick={() => setMenuOpen(false)}>Map</NavLink>
          {user && <NavLink to="/report" className={navLinkClass} onClick={() => setMenuOpen(false)}>Report Issue</NavLink>}
          {user && <NavLink to="/my-reports" className={navLinkClass} onClick={() => setMenuOpen(false)}>My Reports</NavLink>}
          {user && isAdmin && <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Admin Dashboard</NavLink>}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                <span className="text-sm text-gray-500 px-3">👤 {displayName}</span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => { navigate('/login'); setMenuOpen(false) }} className="w-full justify-start">Login</Button>
                <Button size="sm" onClick={() => { navigate('/register'); setMenuOpen(false) }} className="w-full">Register</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
