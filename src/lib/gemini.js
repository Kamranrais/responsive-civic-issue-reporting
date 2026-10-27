import { IS_DEMO } from './demo'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// ─── Mock Response for Demo Mode / No API Key ─────────────────────────────
const MOCK_CATEGORIES = ['pothole', 'garbage', 'waterlogging', 'streetlight', 'infrastructure', 'other']
const MOCK_SEVERITIES = ['low', 'medium', 'high', 'critical']

function mockAnalysis(imageFile) {
  // Deterministic mock based on filename characters
  const seed = imageFile ? imageFile.name.charCodeAt(0) || 0 : 42
  const catIdx = seed % MOCK_CATEGORIES.length
  const sevIdx = seed % MOCK_SEVERITIES.length
  return {
    category: MOCK_CATEGORIES[catIdx],
    severity: MOCK_SEVERITIES[sevIdx],
    confidence: 0.72 + (seed % 28) / 100,
    description: 'AI analysis unavailable in demo mode. Please review and confirm the category and severity.',
    is_mock: true,
  }
}

// ─── Convert image file to base64 ────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Main Analysis Function ───────────────────────────────────────────────────
export async function analyzeImage(imageFile) {
  if (IS_DEMO || !GEMINI_API_KEY) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200))
    return mockAnalysis(imageFile)
  }

  try {
    const base64 = await fileToBase64(imageFile)
    const mimeType = imageFile.type || 'image/jpeg'

    const body = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: `You are an AI assistant for a civic issue reporting system in India.

Analyze this image and return a JSON object with:
- "category": one of ["pothole", "garbage", "waterlogging", "streetlight", "infrastructure", "other"]
- "severity": one of ["low", "medium", "high", "critical"]
  - low: minor inconvenience
  - medium: moderate impact on public use
  - high: significant hazard or disruption
  - critical: immediate safety risk (e.g., open manhole, flooding, collapsed structure)
- "confidence": float 0–1 representing your confidence
- "description": 1–2 sentence human-readable description of the issue you see
- "is_safety_critical": boolean — true if this requires urgent attention

Respond ONLY with valid JSON. No markdown, no explanation.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 256,
      },
    }

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini API error: ${response.status} — ${err}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    
    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      category: parsed.category ?? 'other',
      severity: parsed.severity ?? 'medium',
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
      description: parsed.description ?? '',
      is_safety_critical: parsed.is_safety_critical ?? false,
      is_mock: false,
    }
  } catch (err) {
    console.warn('Gemini analysis failed, falling back to mock:', err.message)
    return { ...mockAnalysis(imageFile), error: err.message }
  }
}
