import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReports } from '../hooks/useReports'
import { StatusBadge, SeverityBadge, CategoryBadge } from '../components/ui/Badge'
import { SectionLoader } from '../components/ui/Spinner'
import { formatDate, timeAgo } from '../lib/utils'

export default function MyReportsPage() {
  const { user } = useAuth()
  const { fetchByUser, loading } = useReports()
  const [reports, setReports] = useState([])

  useEffect(() => {
    if (user) fetchByUser(user.id).then(setReports)
  }, [user])

  if (loading) return <SectionLoader />

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Reports</h1>
          <p className="text-gray-500 text-sm mt-1">{reports.length} complaint{reports.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <Link to="/report" className="btn-primary text-sm">
          + New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-medium text-gray-600 mb-2">No reports yet</h3>
          <p className="text-sm mb-6">Be the first to report an issue in your area.</p>
          <Link to="/report" className="btn-primary">📸 Report an Issue</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <Link
              key={report.id}
              to={`/report/${report.id}`}
              className="card p-5 flex gap-4 hover:shadow-md transition-shadow block"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                {report.image_url ? (
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                    🏗️
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 leading-snug">{report.title}</h3>
                  <StatusBadge status={report.status} />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <CategoryBadge category={report.category} />
                  <SeverityBadge severity={report.severity} />
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>ID: <code className="font-mono">{report.complaint_id}</code></span>
                  <span>·</span>
                  <span>{timeAgo(report.created_at)}</span>
                  {report.address && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-[200px]">📍 {report.address.split(',').slice(-3).join(',').trim()}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
