import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReports } from '../hooks/useReports'
import { useGeolocation } from '../hooks/useGeolocation'
import { analyzeImage } from '../lib/gemini'
import { validateImage, CATEGORY_CONFIG, SEVERITY_CONFIG, DEPARTMENTS } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import toast from 'react-hot-toast'

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STEPS = ['Photo', 'Location', 'Details', 'Confirm']

// ─── Location Map Click Handler ───────────────────────────────────────────────
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) })
  return null
}

export default function ReportPage() {
  const { user } = useAuth()
  const { createReport } = useReports()
  const geo = useGeolocation()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    severity: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  // ─── Step 1: Photo ──────────────────────────────────────────────────────────
  function handleFileSelect(file) {
    const err = validateImage(file)
    if (err) { setImageError(err); return }
    setImageError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  // ─── Step 2 → 3: Analyze image ─────────────────────────────────────────────
  async function analyzeAndProceed() {
    if (!geo.coords) { toast.error('Please set a location first.'); return }
    setStep(2)
    setAnalyzing(true)
    try {
      const result = await analyzeImage(imageFile)
      setAiResult(result)
      setForm(f => ({
        ...f,
        category: f.category || result.category,
        severity: f.severity || result.severity,
        title: f.title || `${CATEGORY_CONFIG[result.category]?.label || 'Issue'} reported`,
      }))
    } catch (err) {
      toast.error('AI analysis failed — please fill in details manually.')
    } finally {
      setAnalyzing(false)
    }
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.title.trim()) { toast.error('Please add a title.'); return }
    if (!form.category)     { toast.error('Please select a category.'); return }
    if (!form.severity)     { toast.error('Please select a severity.'); return }
    if (!geo.coords)        { toast.error('Location is required.'); return }

    setSubmitting(true)
    try {
      const report = await createReport({
        imageFile,
        reportData: {
          user_id: user.id,
          title: form.title,
          description: form.description,
          category: form.category,
          severity: form.severity,
          lat: geo.coords.lat,
          lng: geo.coords.lng,
          address: geo.address,
          ai_analysis: aiResult,
        },
      })
      if (!report) throw new Error('Failed to submit report')
      setSubmitted(report)
      setStep(4) // success screen
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success screen ─────────────────────────────────────────────────────────
  if (step === 4 && submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h1>
        <p className="text-gray-500 mb-6">Your complaint has been registered successfully.</p>
        <div className="card p-6 mb-6 text-left">
          <div className="text-xs text-gray-500 mb-1">Complaint ID</div>
          <div className="text-2xl font-mono font-bold text-navy-900 mb-4">{submitted.complaint_id}</div>
          <div className="text-xs text-gray-500 mb-1">Category</div>
          <div className="text-sm font-medium mb-3 capitalize">{submitted.category}</div>
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Submitted
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          ⚠️ This report is stored in the civic system. It is NOT connected to real government departments unless authorized integrations are configured.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/my-reports')}>View My Reports</Button>
          <Button variant="outline" onClick={() => { setStep(0); setSubmitted(null); setImageFile(null); setImagePreview(null); setAiResult(null); setForm({ title:'', description:'', category:'', severity:'' }) }}>
            Submit Another Report
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 mb-1">Report a Civic Issue</h1>
        <p className="text-gray-500 text-sm">Help improve your community by reporting public problems</p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-navy-900 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-navy-900' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 0: Photo ── */}
      {step === 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">📸 Upload Photo</h2>
          
          {!imagePreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-navy-400 hover:bg-navy-50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input').click()}
            >
              <div className="text-5xl mb-3">📷</div>
              <p className="text-gray-600 font-medium mb-1">Drag & drop or click to upload</p>
              <p className="text-gray-400 text-sm">JPEG, PNG, WebP · Max 5 MB</p>
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => { if (e.target.files[0]) handleFileSelect(e.target.files[0]) }}
              />
            </div>
          ) : (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-xl object-cover max-h-72" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 shadow"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {imageError && <p className="text-red-600 text-sm mt-2">{imageError}</p>}

          {/* Camera capture on mobile */}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => {
                const inp = document.createElement('input')
                inp.type = 'file'
                inp.accept = 'image/*'
                inp.capture = 'environment'
                inp.onchange = e => { if (e.target.files[0]) handleFileSelect(e.target.files[0]) }
                inp.click()
              }}
              className="text-sm text-navy-700 font-medium underline"
            >
              📱 Use Camera
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <Button disabled={!imageFile} onClick={() => setStep(1)}>
              Next: Location →
            </Button>
          </div>
        </Card>
      )}

      {/* ── Step 1: Location ── */}
      {step === 1 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">📍 Set Location</h2>

          <Button
            variant="outline"
            onClick={geo.locateUser}
            loading={geo.locating}
            className="mb-4 w-full sm:w-auto"
          >
            📡 Auto-Detect GPS
          </Button>

          {geo.gpsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
              {geo.gpsError}
            </div>
          )}

          <p className="text-xs text-gray-500 mb-2">Or click on the map to set location manually:</p>

          <div className="rounded-xl overflow-hidden border border-gray-200 h-64 sm:h-80">
            <MapContainer
              center={geo.coords ? [geo.coords.lat, geo.coords.lng] : [20.5937, 78.9629]}
              zoom={geo.coords ? 14 : 5}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
              />
              <MapClickHandler onMapClick={geo.setManualCoords} />
              {geo.coords && <Marker position={[geo.coords.lat, geo.coords.lng]} />}
            </MapContainer>
          </div>

          {geo.coords && (
            <div className="mt-3 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
              ✅ <strong>Location set:</strong> {geo.address || `${geo.coords.lat.toFixed(5)}, ${geo.coords.lng.toFixed(5)}`}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
            <Button disabled={!geo.coords} onClick={analyzeAndProceed}>
              Next: AI Analysis →
            </Button>
          </div>
        </Card>
      )}

      {/* ── Step 2: Details (AI-assisted) ── */}
      {step === 2 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">🤖 Issue Details</h2>

          {analyzing ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Spinner size="lg" className="text-navy-900" />
              <p className="text-gray-600 font-medium">AI is analyzing your photo…</p>
              <p className="text-gray-400 text-sm">This takes a few seconds</p>
            </div>
          ) : (
            <>
              {/* AI suggestion banner */}
              {aiResult && (
                <div className={`rounded-xl p-4 mb-5 border ${aiResult.is_mock ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{aiResult.is_mock ? '⚠️' : '🤖'}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-0.5">
                        {aiResult.is_mock ? 'Demo Mode — Mock Analysis' : `AI Analysis (${Math.round(aiResult.confidence * 100)}% confidence)`}
                      </p>
                      <p className="text-sm text-gray-600">{aiResult.description}</p>
                      {!aiResult.is_mock && aiResult.is_safety_critical && (
                        <p className="text-xs text-red-700 font-medium mt-1">⚠️ Safety-critical issue detected — will be prioritized for review</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Title *"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Large pothole on MG Road"
                  maxLength={120}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Category *"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Select category…</option>
                    {Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
                    ))}
                  </Select>

                  <Select
                    label="Severity *"
                    value={form.severity}
                    onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                  >
                    <option value="">Select severity…</option>
                    {Object.entries(SEVERITY_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>{cfg.label}</option>
                    ))}
                  </Select>
                </div>

                <Textarea
                  label="Description (optional)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Add any additional details about the issue…"
                  rows={3}
                />
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                <Button onClick={() => setStep(3)}>Review & Submit →</Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 3 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">✅ Review & Submit</h2>

          <div className="space-y-4">
            {imagePreview && (
              <img src={imagePreview} alt="Issue" className="w-full rounded-xl object-cover max-h-48" />
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Title</div>
                <div className="font-medium text-gray-900">{form.title}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Category</div>
                <div className="font-medium capitalize">{CATEGORY_CONFIG[form.category]?.icon} {CATEGORY_CONFIG[form.category]?.label}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Severity</div>
                <div className="font-medium capitalize">{SEVERITY_CONFIG[form.severity]?.label}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Location</div>
                <div className="font-medium text-gray-600 text-xs leading-snug">{geo.address || `${geo.coords?.lat?.toFixed(4)}, ${geo.coords?.lng?.toFixed(4)}`}</div>
              </div>
            </div>

            {form.description && (
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Description</div>
                <div className="text-sm text-gray-700">{form.description}</div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              ⚠️ By submitting, you confirm this is a real civic issue. This report is not automatically sent to government departments without authorized integration.
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>← Edit</Button>
            <Button loading={submitting} onClick={handleSubmit}>
              🚀 Submit Report
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
