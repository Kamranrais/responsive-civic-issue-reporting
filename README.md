# JanSight (जन दृष्टि)
> *"One Photo. One Report. A Better India."*

**JanSight** is a modern, responsive, mobile-first civic issue reporting web platform designed for Indian citizens and municipal administrators. Citizens can photograph civic problems (potholes, garbage dumps, waterlogging, broken streetlights, broken footpaths) and report them with accurate GPS locations and Gemini AI-powered classification. Municipal administrators can prioritize safety-critical issues, detect duplicates, assign tasks to departments, and track resolution lifecycles.

---

## 🚀 Features

### 👤 Citizen Experience
- **Mobile-First Responsive Interface**: Clean Indian civic-tech theme (Navy `#1A2E5A` and Saffron `#F97316`).
- **One-Click & Camera Photo Upload**: Upload or take photos of civic issues with automated client-side validation (types, size limits).
- **Dual Location Picking**: Automatic high-accuracy GPS geotagging + interactive OpenStreetMap / Leaflet pin placement with Nominatim reverse-geocoding.
- **Gemini AI Vision Analysis**: Automatic detection of issue category, severity rating (Low, Medium, High, Critical), confidence score, and contextual summary before submission.
- **Unique Complaint Tracking**: Generates official formatted Complaint IDs (e.g., `JS-2024-XXXXXX`).
- **Live Status Timeline**: Transparent 5-stage progress tracker (`Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved`).
- **Interactive City Map**: Real-time Leaflet map displaying active community issues with color-coded severity markers.
- **User Dashboard**: Track all personal complaints and resolution updates.

### 🛡️ Admin Dashboard
- **Real-time Civic Metrics**: Total complaints, pending triage, resolved count, and critical safety hazards.
- **Visual Analytics**: Interactive Recharts graphs showing category breakdown and status distribution.
- **Geospatial Duplicate Detection**: Automatically flags potential duplicate reports within 150 meters in the same category to prevent redundant municipal dispatch.
- **Safety Hazard Escalation**: Highlights safety-critical issues (deep potholes, electrical hazards, severe waterlogging) for immediate municipal attention.
- **Department Assignment**: Assigns complaints to simulated civic departments (PWD, Sanitation, Jal Board, Electricity, GHMC, CMWSSB, etc.).
- **Resolution Tracking**: Records timestamps upon resolution and monitors overdue complaints (>7 days without action).

### ⚡ Zero-Config Demo Mode
If Supabase or Gemini API keys are not provided, JanSight **automatically boots into Demo Mode**:
- Pre-populated with realistic civic reports across Delhi, Mumbai, Bengaluru, Kolkata, and Hyderabad.
- Built-in mock authentication with instant 1-click **Citizen** and **Admin** login buttons.
- LocalStorage persistence for user reports and status updates.
- Simulated AI analysis fallback with simulated latency.
- Clear disclaimer indicating reports in demo mode do not connect to real government services.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS
- **Maps**: Leaflet, React-Leaflet, OpenStreetMap, Nominatim API
- **AI / Vision**: Google Gemini 1.5 Flash API (REST via client, structured JSON prompt)
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Charts & UI**: Recharts, Lucide-style SVG icons, React Hot Toast

---

## 📁 Project Structure

```
jansight/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example
├── public/
│   └── favicon.svg
├── supabase/
│   ├── schema.sql         # Tables, Enums, Triggers, and RLS policies
│   └── seed.sql           # Realistic Indian civic demo data
└── src/
    ├── main.jsx           # App entry point
    ├── App.jsx            # Router and auth-guarded routing
    ├── index.css          # Tailwind styles and Leaflet fixes
    ├── components/
    │   ├── auth/          # ProtectedRoute guard
    │   ├── layout/        # Navbar, Footer, and Page Layout
    │   └── ui/            # Button, Input, Modal, Badges, Loaders
    ├── hooks/
    │   ├── useAuth.jsx    # Authentication context (Supabase + Demo)
    │   ├── useGeolocation.js # GPS + Nominatim reverse geocoding
    │   └── useReports.js  # CRUD operations & n8n webhook caller
    ├── lib/
    │   ├── demo.js        # LocalStorage demo data & mock storage
    │   ├── gemini.js      # Gemini 1.5 Flash vision integration
    │   ├── supabase.js    # Supabase client initializer
    │   └── utils.js       # Haversine distance, date formatters, configs
    └── pages/
        ├── HomePage.jsx       # Landing page & citizen call-to-action
        ├── LoginPage.jsx      # Login page with demo role shortcuts
        ├── RegisterPage.jsx   # Citizen registration
        ├── ReportPage.jsx     # 4-step wizard for filing complaints
        ├── ReportDetailPage.jsx # Timeline, photo & status details
        ├── MyReportsPage.jsx  # Citizen submitted complaints
        ├── MapPage.jsx        # Full-screen interactive civic map
        └── AdminDashboard.jsx # Municipal overview, triage & charts
```

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
cd jansight
npm install
```

### 2. Run in Demo Mode (No Setup Required)
To run immediately without setting up Supabase or Gemini:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
- Click **Sign In** -> Click **👤 Login as Citizen** or **🔑 Login as Admin** for instant role-based access.

---

## ☁️ Connecting Supabase & Gemini (Production Mode)

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the values:
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-google-ai-studio-gemini-key
VITE_N8N_WEBHOOK_URL=https://your-n8n.instance/webhook/civic-report # Optional
VITE_DEMO_MODE=false
```

### 2. Setup Database & Row Level Security
1. Go to your Supabase project's **SQL Editor**.
2. Run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Optional: Run [`supabase/seed.sql`](supabase/seed.sql) to populate initial sample reports.

### 3. Setup Supabase Storage
1. In the Supabase Dashboard, go to **Storage** and create a new bucket named `report-images`.
2. Toggle **Public bucket** to `ON`.
3. Add an RLS policy on `storage.objects` allowing authenticated users to upload images and public users to read them.

### 4. Admin Privileges
To promote a registered citizen account to Admin:
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<USER_UUID>';
```

---

## 🧪 Build for Production

```bash
npm run build
```
The compiled, production-ready assets will be created in the `dist/` directory.

---

## ⚖️ Disclaimer
*JanSight is a civic-tech demonstration platform. Reports filed in demo mode or without authorized governmental department integrations are simulated for training and testing purposes and do not represent direct communications with municipal authorities unless an authorized municipal API gateway is configured.*
# responsive-civic-issue-reporting
