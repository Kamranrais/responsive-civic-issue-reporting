import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useReports } from '../hooks/useReports'
import { StatusBadge, SeverityBadge, CategoryBadge } from '../components/ui/Badge'
import { SectionLoader } from '../components/ui/Spinner'
import { formatDateTime, STATUS_CONFIG } from '../lib/utils'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_ORDER = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved']

export default function ReportDetailPage() {
  const { id } = useParams()
  const { fetchById, loading } = useReports()
  const [report, setReport] = useState(null)

  useEffect(() => {
    fetchById(id).then(setReport)
  }, [id])

  if (loading) return <SectionLoader />
  if (!report) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-gray-500">Report not found.</p>
      <Link to="/my-reports" className="btn-primary mt-4 inline-flex">← My Reports</Link>
    </div>
  )

  const currentStatusIdx = STATUS_ORDER.indexOf(report.status)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/my-reports" className="text-sm text-navy-700 hover:underline flex items-center gap-1 mb-6">
        ← Back to My Reports
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1 font-mono">Complaint ID: {report.complaint_id}</p>
            <h1 className="text-xl font-bold text-gray-900">{report.title}</h1>
          </div>
          <StatusBadge status={report.status} />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <CategoryBadge category={report.category} />
          <SeverityBadge severity={report.severity} />
        </div>
        {report.description && (
          <p className="text-gray-600 text-sm leading-relaxed">{report.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Submitted on {formatDateTime(report.created_at)}
          {report.department && ` · Assigned to ${report.department}`}
        </p>
      </div>

      {/* Photo */}
      {report.image_url && (
        <div className="card p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">📸 Photo Evidence</h2>
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full rounded-xl object-cover max-h-80"
          />
        </div>
      )}

      {/* AI Analysis */}
      {report.ai_analysis && (
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">🤖 AI Analysis</h2>
          <div className="text-sm text-gray-600 leading-relaxed mb-3">{report.ai_analysis.description}</div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Category: <strong className="text-gray-700 capitalize">{report.ai_analysis.category}</strong></span>
            <span>·</span>
            <span>Severity: <strong className="text-gray-700 capitalize">{report.ai_analysis.severity}</strong></span>
            {!report.ai_analysis.is_mock && (
              <>
                <span>·</span>
                <span>Confidence: <strong className="text-gray-700">{Math.round(report.ai_analysis.confidence * 100)}%</strong></span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Status timeline */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">📋 Status Timeline</h2>
        <div className="relative">
          {STATUS_ORDER.map((s, i) => {
            const cfg = STATUS_CONFIG[s]
            const done = i <= currentStatusIdx
            const current = i === currentStatusIdx
            return (
              <div key={s} className="flex gap-4 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    done ? (current ? `${cfg.bg} ${cfg.text}` : 'bg-green-500 text-white') : 'bg-gray-200 text-gray-400'
                  }`}>
                    {done && !current ? '✓' : i + 1}
                  </div>
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-1 ${i < currentStatusIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="pb-2">
                  <div className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{cfg.label}</div>
                  {current && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Last updated {formatDateTime(report.updated_at)}
                    </div>
                  )}
                  {s === 'resolved' && report.resolved_at && (
                    <div className="text-xs text-green-600 mt-0.5 font-medium">
                      ✅ Resolved on {formatDateTime(report.resolved_at)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Map */}
      {report.lat && report.lng && (
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">📍 Location</h2>
          <div className="text-xs text-gray-500 mb-2">{report.address}</div>
          <div className="rounded-xl overflow-hidden h-48">
            <MapContainer center={[report.lat, report.lng]} zoom={15} className="h-full w-full" zoomControl={false}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap'
              />
              <Marker position={[report.lat, report.lng]}>
                <Popup>{report.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  )
}
