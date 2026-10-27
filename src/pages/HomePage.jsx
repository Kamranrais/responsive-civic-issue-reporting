import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { IS_DEMO } from '../lib/demo'

const STATS = [
  { label: 'Reports Submitted', value: '12,847' },
  { label: 'Issues Resolved',   value: '9,203'  },
  { label: 'Cities Active',     value: '38'      },
  { label: 'Avg Resolution',    value: '4.2 days'},
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '📸',
    title: 'Photograph the Issue',
    desc: 'Take a photo of any public problem — pothole, garbage, broken light, or waterlogging.',
  },
  {
    step: '02',
    icon: '📍',
    title: 'Add Location',
    desc: 'GPS auto-detects your location. You can fine-tune by clicking on the map.',
  },
  {
    step: '03',
    icon: '🤖',
    title: 'AI Pre-fills Details',
    desc: 'Gemini AI suggests the category and severity. Review and confirm before submitting.',
  },
  {
    step: '04',
    icon: '📋',
    title: 'Track Your Complaint',
    desc: 'Get a unique complaint ID and follow status updates from Submitted to Resolved.',
  },
]

const ISSUE_TYPES = [
  { icon: '🕳️', label: 'Potholes',        color: 'bg-red-50 border-red-200'    },
  { icon: '🗑️', label: 'Garbage',         color: 'bg-yellow-50 border-yellow-200' },
  { icon: '💧', label: 'Waterlogging',    color: 'bg-cyan-50 border-cyan-200'   },
  { icon: '💡', label: 'Street Lights',   color: 'bg-amber-50 border-amber-200' },
  { icon: '🏗️', label: 'Infrastructure', color: 'bg-purple-50 border-purple-200'},
  { icon: '📋', label: 'Other Issues',    color: 'bg-gray-50 border-gray-200'   },
]

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      {/* Demo banner */}
      {IS_DEMO && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
          <p className="text-amber-800 text-sm font-medium">
            ⚠️ <strong>Demo Mode:</strong> No Supabase credentials detected. All data is stored locally in your browser only.
            Add your credentials in <code className="bg-amber-100 px-1 rounded">.env</code> to enable live features.
          </p>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-saffron-500/20 border border-saffron-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-saffron-400 text-sm font-medium">🇮🇳 Civic Technology for India</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              One Photo.<br />
              One Report.<br />
              <span className="text-saffron-400">A Better India.</span>
            </h1>
            <p className="text-navy-200 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              JanSight empowers every citizen to photograph public problems and report them to the
              right authorities. Together, we build cleaner, safer communities.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/report" className="btn-secondary text-base px-7 py-3">
                  📸 Report an Issue
                </Link>
              ) : (
                <button onClick={() => navigate('/register')} className="btn-secondary text-base px-7 py-3">
                  🚀 Get Started Free
                </button>
              )}
              <Link to="/map" className="btn-outline border-white text-white hover:bg-white/10 text-base px-7 py-3">
                🗺️ View Live Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-saffron-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl font-bold">{s.value}</div>
                <div className="text-saffron-100 text-sm mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="section-title mb-2">What Can You Report?</h2>
          <p className="text-gray-500">Any public infrastructure issue that affects your daily life</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {ISSUE_TYPES.map(t => (
            <div key={t.label} className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 ${t.color} cursor-default`}>
              <span className="text-4xl">{t.icon}</span>
              <span className="text-sm font-medium text-gray-700 text-center">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">How It Works</h2>
            <p className="text-gray-500">From photo to resolution in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -translate-x-4 z-0" />
                )}
                <div className="card p-6 relative z-10">
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <div className="text-xs font-bold text-saffron-500 mb-1 uppercase tracking-wider">Step {step.step}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-navy-900 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to Make a Difference?</h2>
          <p className="text-navy-200 mb-8 max-w-xl mx-auto">
            Every report you submit helps your community. Join thousands of active citizens
            already using JanSight.
          </p>
          {user ? (
            <Link to="/report" className="btn-secondary text-base px-8 py-3">
              📸 Report an Issue Now
            </Link>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => navigate('/register')} className="btn-secondary text-base px-8 py-3">
                Create Free Account
              </button>
              <button onClick={() => navigate('/login')} className="btn-outline border-white text-white hover:bg-white/10 text-base px-8 py-3">
                Login
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
