// ─── Demo Mode Detection ─────────────────────────────────────────────────────
// Demo mode is active when Supabase credentials are absent or VITE_DEMO_MODE=true
export const IS_DEMO =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === ''

// ─── localStorage keys ───────────────────────────────────────────────────────
const KEYS = {
  USER:    'jansight_demo_user',
  REPORTS: 'jansight_demo_reports',
}

// ─── Demo Store Helpers ──────────────────────────────────────────────────────
function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or blocked — silently ignore
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const demoAuth = {
  getUser() {
    return read(KEYS.USER)
  },
  login(email, password, fullName) {
    const user = {
      id: 'demo-user-' + btoa(email).slice(0, 8),
      email,
      full_name: fullName || email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'citizen',
      created_at: new Date().toISOString(),
    }
    write(KEYS.USER, user)
    return user
  },
  logout() {
    localStorage.removeItem(KEYS.USER)
  },
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export const demoReports = {
  getAll() {
    return read(KEYS.REPORTS) || SAMPLE_REPORTS
  },
  getByUser(userId) {
    return this.getAll().filter(r => r.user_id === userId)
  },
  getById(id) {
    return this.getAll().find(r => r.id === id)
  },
  create(report) {
    const all = this.getAll()
    const newReport = {
      ...report,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    write(KEYS.REPORTS, [newReport, ...all])
    return newReport
  },
  update(id, updates) {
    const all = this.getAll()
    const idx = all.findIndex(r => r.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() }
    write(KEYS.REPORTS, all)
    return all[idx]
  },
}

// ─── Sample Data ─────────────────────────────────────────────────────────────
const SAMPLE_REPORTS = [
  {
    id: 'demo-001',
    complaint_id: 'JS-2024-001',
    user_id: 'demo-user-abc123',
    title: 'Large pothole on main road',
    description: 'Deep pothole causing danger to vehicles near Connaught Place roundabout.',
    category: 'pothole',
    severity: 'high',
    status: 'in_progress',
    lat: 28.6315,
    lng: 77.2167,
    address: 'Connaught Place, New Delhi, Delhi 110001',
    image_url: null,
    ai_analysis: { category: 'pothole', severity: 'high', confidence: 0.91, description: 'Large road surface damage' },
    department: 'PWD',
    assigned_to: 'South Delhi Division',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'demo-002',
    complaint_id: 'JS-2024-002',
    user_id: 'demo-user-xyz789',
    title: 'Overflowing garbage bins',
    description: 'Garbage bins outside market overflowing for 3 days, causing stench and hygiene issues.',
    category: 'garbage',
    severity: 'medium',
    status: 'assigned',
    lat: 19.0760,
    lng: 72.8777,
    address: 'Dadar Market, Mumbai, Maharashtra 400014',
    image_url: null,
    ai_analysis: { category: 'garbage', severity: 'medium', confidence: 0.88, description: 'Waste overflow at collection point' },
    department: 'Sanitation',
    assigned_to: 'Zone 4 Sanitation Team',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'demo-003',
    complaint_id: 'JS-2024-003',
    user_id: 'demo-user-abc123',
    title: 'Street light not working',
    description: 'Three consecutive streetlights on the stretch are non-functional creating safety hazard at night.',
    category: 'streetlight',
    severity: 'high',
    status: 'submitted',
    lat: 12.9716,
    lng: 77.5946,
    address: 'MG Road, Bengaluru, Karnataka 560001',
    image_url: null,
    ai_analysis: { category: 'streetlight', severity: 'high', confidence: 0.94, description: 'Non-functional streetlights' },
    department: null,
    assigned_to: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'demo-004',
    complaint_id: 'JS-2024-004',
    user_id: 'demo-user-pqr456',
    title: 'Severe waterlogging after rain',
    description: 'Knee-deep water stagnating on road, vehicles getting stuck, mosquito breeding risk.',
    category: 'waterlogging',
    severity: 'critical',
    status: 'under_review',
    lat: 22.5726,
    lng: 88.3639,
    address: 'Park Street, Kolkata, West Bengal 700016',
    image_url: null,
    ai_analysis: { category: 'waterlogging', severity: 'critical', confidence: 0.96, description: 'Critical flood-level waterlogging' },
    department: null,
    assigned_to: null,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'demo-005',
    complaint_id: 'JS-2024-005',
    user_id: 'demo-user-mno321',
    title: 'Damaged footpath tiles',
    description: 'Broken pavement tiles creating tripping hazard for pedestrians, especially elderly.',
    category: 'infrastructure',
    severity: 'medium',
    status: 'resolved',
    lat: 17.3850,
    lng: 78.4867,
    address: 'Banjara Hills Road 12, Hyderabad, Telangana 500034',
    image_url: null,
    ai_analysis: { category: 'infrastructure', severity: 'medium', confidence: 0.82, description: 'Damaged pavement infrastructure' },
    department: 'GHMC',
    assigned_to: 'Road Maintenance Cell',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-006',
    complaint_id: 'JS-2024-006',
    user_id: 'demo-user-abc123',
    title: 'Broken manhole cover',
    description: 'Manhole cover missing on busy road, posing serious risk to two-wheelers.',
    category: 'infrastructure',
    severity: 'critical',
    status: 'in_progress',
    lat: 13.0827,
    lng: 80.2707,
    address: 'Anna Salai, Chennai, Tamil Nadu 600002',
    image_url: null,
    ai_analysis: { category: 'infrastructure', severity: 'critical', confidence: 0.93, description: 'Open manhole — safety critical' },
    department: 'CMWSSB',
    assigned_to: 'Emergency Response Team',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'demo-007',
    complaint_id: 'JS-2024-007',
    user_id: 'demo-user-xyz789',
    title: 'Illegal dumping site near school',
    description: 'Construction debris dumped illegally near school gate causing breathing issues.',
    category: 'garbage',
    severity: 'high',
    status: 'submitted',
    lat: 23.0225,
    lng: 72.5714,
    address: 'Navrangpura, Ahmedabad, Gujarat 380009',
    image_url: null,
    ai_analysis: { category: 'garbage', severity: 'high', confidence: 0.87, description: 'Illegal waste dumping' },
    department: null,
    assigned_to: null,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'demo-008',
    complaint_id: 'JS-2024-008',
    user_id: 'demo-user-pqr456',
    title: 'Road cave-in due to water leak',
    description: 'Underground pipe leak causing road to cave in, traffic disruption.',
    category: 'infrastructure',
    severity: 'critical',
    status: 'assigned',
    lat: 26.8467,
    lng: 80.9462,
    address: 'Hazratganj, Lucknow, Uttar Pradesh 226001',
    image_url: null,
    ai_analysis: { category: 'infrastructure', severity: 'critical', confidence: 0.95, description: 'Road cave-in — critical infrastructure' },
    department: 'Jal Sansthan',
    assigned_to: 'Emergency Repair Unit',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
]
