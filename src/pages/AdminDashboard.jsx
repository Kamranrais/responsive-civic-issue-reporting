import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { useReports } from '../hooks/useReports'
import { useAuth } from '../hooks/useAuth'
import { StatusBadge, SeverityBadge, CategoryBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { SectionLoader } from '../components/ui/Spinner'
import {
  CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG, DEPARTMENTS,
  formatDate, timeAgo, distanceMeters
} from '../lib/utils'
import toast from 'react-hot-toast'

const STATUS_FLOW = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved']

const PIE_COLORS = ['#3b82f6', '#eab308', '#a855f7', '#f97316', '#22c55e', '#94a3b8']

function StatCard({ label, value, sub, icon, color = 'navy' }) {
  const colors = {
    navy:   'from-navy-900 to-navy-800',
    saffron:'from-saffron-500 to-saffron-600',
    green:  'from-green-500 to-green-600',
    red:    'from-red-500 to-red-600',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl p-5`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-3xl font-bold mb-0.5">{value}</div>
      <div className="text-sm font-medium opacity-90">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const { isAdmin } = useAuth()
  const { fetchAll, updateReport, loading } = useReports()
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState({ category: '', severity: '', status: '', search: '' })
  const [selectedReport, setSelectedReport] = useState(null)
  const [actionModal, setActionModal] = useState(false)
  const [actionForm, setActionForm] = useState({ status: '', department: '', note: '' })
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'reports'

  useEffect(() => { load() }, [filters])

  async function load() {
    const data = await fetchAll(filters)
    setReports(data || [])
  }

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = reports.length
    const resolved   = reports.filter(r => r.status === 'resolved').length
    const pending    = reports.filter(r => ['submitted', 'under_review'].includes(r.status)).length
    const critical   = reports.filter(r => r.severity === 'critical').length
    const inProgress = reports.filter(r => r.status === 'in_progress').length
    const avgResMs   = (() => {
      const res = reports.filter(r => r.resolved_at && r.created_at)
      if (!res.length) return null
      const avg = res.reduce((sum, r) => sum + (new Date(r.resolved_at) - new Date(r.created_at)), 0) / res.length
      return Math.round(avg / (1000 * 60 * 60 * 24))
    })()
    return { total, resolved, pending, critical, inProgress, avgResMs }
  }, [reports])

  // ─── Chart data ───────────────────────────────────────────────────────────
  const categoryChartData = useMemo(() =>
    Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => ({
      name: cfg.label,
      count: reports.filter(r => r.category === val).length,
    })).filter(d => d.count > 0),
  [reports])

  const statusChartData = useMemo(() =>
    Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({
      name: cfg.label,
      value: reports.filter(r => r.status === val).length,
    })).filter(d => d.value > 0),
  [reports])

  // ─── Duplicate detection (within 100m, same category) ─────────────────────
  const duplicates = useMemo(() => {
    const groups = []
    const checked = new Set()
    reports.forEach((r1, i) => {
      if (checked.has(r1.id) || !r1.lat) return
      const group = [r1]
      reports.forEach((r2, j) => {
        if (i === j || !r2.lat || r2.category !== r1.category) return
        const dist = distanceMeters(r1.lat, r1.lng, r2.lat, r2.lng)
        if (dist < 150) { group.push(r2); checked.add(r2.id) }
      })
      if (group.length > 1) groups.push(group)
      checked.add(r1.id)
    })
    return groups
  }, [reports])

  // ─── Update report action ─────────────────────────────────────────────────
  async function handleAction() {
    if (!actionForm.status) { toast.error('Select a status.'); return }
    setUpdating(true)
    const updates = {
      status: actionForm.status,
      ...(actionForm.department && { department: actionForm.department, assigned_to: actionForm.department }),
      ...(actionForm.status === 'resolved' && { resolved_at: new Date().toISOString() }),
    }
    const updated = await updateReport(selectedReport.id, updates)
    setUpdating(false)
    if (updated) {
      toast.success('Report updated!')
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r))
      setActionModal(false)
      setSelectedReport(null)
    } else {
      toast.error('Update failed.')
    }
  }

  // ─── Overdue reports (> 7 days in submitted/under_review) ─────────────────
  const overdueReports = reports.filter(r => {
    if (!['submitted', 'under_review'].includes(r.status)) return false
    const days = (Date.now() - new Date(r.created_at)) / (1000 * 60 * 60 * 24)
    return days > 7
  })

  const TAB_CLS = (t) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t ? 'bg-navy-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage civic issue reports and track resolutions</p>
        </div>
        <div className="flex gap-2">
          <button className={TAB_CLS('overview')} onClick={() => setActiveTab('overview')}>📊 Overview</button>
          <button className={TAB_CLS('reports')} onClick={() => setActiveTab('reports')}>📋 Reports</button>
        </div>
      </div>

      {/* Alerts */}
      {stats.critical > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-semibold text-red-800">Safety Alert: {stats.critical} critical issue{stats.critical > 1 ? 's' : ''} require immediate attention</p>
            <p className="text-red-600 text-sm">These have been flagged as potential safety hazards. Please prioritize review.</p>
          </div>
        </div>
      )}
      {overdueReports.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-semibold text-amber-800">{overdueReports.length} report{overdueReports.length > 1 ? 's' : ''} overdue (no action for &gt;7 days)</p>
            <p className="text-amber-600 text-sm">Citizens are waiting. Please review and assign these reports.</p>
          </div>
        </div>
      )}
      {duplicates.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🔁</span>
          <div>
            <p className="font-semibold text-purple-800">{duplicates.length} potential duplicate group{duplicates.length > 1 ? 's' : ''} detected</p>
            <p className="text-purple-600 text-sm">Reports within 150 m of each other in the same category may be duplicates.</p>
          </div>
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Reports"  value={stats.total}      icon="📋" color="navy" />
            <StatCard label="Pending Review" value={stats.pending}     icon="⏳" color="saffron" sub="Submitted or under review" />
            <StatCard label="Resolved"       value={stats.resolved}    icon="✅" color="green"   sub={stats.avgResMs != null ? `Avg ${stats.avgResMs}d resolution` : 'Avg resolution time —'} />
            <StatCard label="Critical Issues" value={stats.critical}   icon="🚨" color="red"    sub="Require immediate attention" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Category bar chart */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Reports by Category</h3>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryChartData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1a2e5a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
              )}
            </div>

            {/* Status pie chart */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Status Distribution</h3>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusChartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
              )}
            </div>
          </div>

          {/* Recent critical / unresolved */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">🚨 Recent Critical &amp; Unresolved Reports</h3>
            {reports.filter(r => r.severity === 'critical' && r.status !== 'resolved').length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No critical unresolved reports — great job!</p>
            ) : (
              <div className="space-y-3">
                {reports.filter(r => r.severity === 'critical' && r.status !== 'resolved').slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.complaint_id} · {timeAgo(r.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <Button size="sm" variant="outline" onClick={() => { setSelectedReport(r); setActionForm({ status: r.status, department: r.department || '', note: '' }); setActionModal(true) }}>
                        Act
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <>
          {/* Filters */}
          <div className="card p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                placeholder="Search title, ID, address…"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
              <Select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.icon} {c.label}</option>)}
              </Select>
              <Select value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
                <option value="">All Severities</option>
                {Object.entries(SEVERITY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </Select>
              <Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </Select>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Showing {reports.length} report{reports.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <SectionLoader />
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>No reports match your filters.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Report</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Severity</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Location</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map(report => {
                      const isDuplicate = duplicates.some(g => g.some(r => r.id === report.id))
                      const isOverdue = overdueReports.some(r => r.id === report.id)
                      return (
                        <tr key={report.id} className={`hover:bg-gray-50 transition-colors ${report.severity === 'critical' ? 'bg-red-50/50' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {report.image_url ? (
                                <img src={report.image_url} alt="" className="h-10 w-10 object-cover rounded-lg flex-shrink-0" />
                              ) : (
                                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                                  {CATEGORY_CONFIG[report.category]?.icon || '📋'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate max-w-[180px]">{report.title}</div>
                                <div className="text-xs text-gray-400 font-mono">{report.complaint_id}</div>
                                <div className="flex gap-1 mt-0.5">
                                  {isDuplicate && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">🔁 Duplicate</span>}
                                  {isOverdue && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">⏰ Overdue</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <CategoryBadge category={report.category} />
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <SeverityBadge severity={report.severity} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={report.status} />
                            {report.department && (
                              <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{report.department}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                            <div className="max-w-[160px] truncate">{report.address?.split(',').slice(-3).join(',').trim() || '—'}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                            {formatDate(report.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link to={`/report/${report.id}`} className="btn-ghost text-xs px-2 py-1">View</Link>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1"
                                onClick={() => {
                                  setSelectedReport(report)
                                  setActionForm({ status: report.status, department: report.department || '', note: '' })
                                  setActionModal(true)
                                }}
                              >
                                Manage
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Action Modal ─────────────────────────────────────────────────── */}
      <Modal open={actionModal} onClose={() => setActionModal(false)} title="Manage Report">
        {selectedReport && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-900 text-sm mb-1">{selectedReport.title}</p>
              <p className="text-xs text-gray-500 font-mono">{selectedReport.complaint_id}</p>
              <div className="flex gap-2 mt-2">
                <CategoryBadge category={selectedReport.category} />
                <SeverityBadge severity={selectedReport.severity} />
              </div>
            </div>

            <Select
              label="Update Status"
              value={actionForm.status}
              onChange={e => setActionForm(f => ({ ...f, status: e.target.value }))}
            >
              {STATUS_FLOW.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </Select>

            <div>
              <label className="label">Assign to Department</label>
              <select
                className="input-field bg-white"
                value={actionForm.department}
                onChange={e => setActionForm(f => ({ ...f, department: e.target.value }))}
              >
                <option value="">— Unassigned —</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {actionForm.status === 'resolved' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
                ✅ Marking as resolved will record the resolution timestamp.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setActionModal(false)}>Cancel</Button>
              <Button loading={updating} className="flex-1" onClick={handleAction}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
