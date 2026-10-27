import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import { useReports } from '../hooks/useReports'
import { StatusBadge, SeverityBadge, CategoryBadge } from '../components/ui/Badge'
import { Select } from '../components/ui/Input'
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from '../lib/utils'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SEVERITY_COLORS = {
  low:      '#22c55e',
  medium:   '#eab308',
  high:     '#f97316',
  critical: '#ef4444',
}

export default function MapPage() {
  const { fetchAll, loading } = useReports()
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState({ category: '', severity: '' })

  useEffect(() => {
    fetchAll(filters).then(setReports)
  }, [filters])

  const activeReports = reports.filter(r => r.lat && r.lng)

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap shadow-sm z-10">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <Select
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          className="w-44"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
          ))}
        </Select>
        <Select
          value={filters.severity}
          onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
          className="w-40"
        >
          <option value="">All Severities</option>
          {Object.entries(SEVERITY_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </Select>
        <span className="text-xs text-gray-400 ml-auto">
          {loading ? 'Loading…' : `${activeReports.length} report${activeReports.length !== 1 ? 's' : ''} on map`}
        </span>

        {/* Legend */}
        <div className="flex items-center gap-3 ml-4">
          {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
            <div key={sev} className="flex items-center gap-1 text-xs text-gray-600">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{sev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          />
          {activeReports.map(report => (
            <CircleMarker
              key={report.id}
              center={[report.lat, report.lng]}
              radius={report.severity === 'critical' ? 14 : report.severity === 'high' ? 11 : 8}
              pathOptions={{
                color: SEVERITY_COLORS[report.severity] || '#94a3b8',
                fillColor: SEVERITY_COLORS[report.severity] || '#94a3b8',
                fillOpacity: 0.75,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  {report.image_url && (
                    <img
                      src={report.image_url}
                      alt={report.title}
                      className="w-full h-28 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="font-semibold text-gray-900 text-sm mb-2 leading-snug">{report.title}</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <CategoryBadge category={report.category} />
                    <SeverityBadge severity={report.severity} />
                  </div>
                  <StatusBadge status={report.status} />
                  {report.address && (
                    <p className="text-xs text-gray-400 mt-2 leading-snug">{report.address}</p>
                  )}
                  <Link
                    to={`/report/${report.id}`}
                    className="block mt-2 text-xs text-navy-700 font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
