import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { Navbar } from './components/layout/Navbar'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

import HomePage         from './pages/HomePage'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import ReportPage       from './pages/ReportPage'
import MyReportsPage    from './pages/MyReportsPage'
import ReportDetailPage from './pages/ReportDetailPage'
import MapPage          from './pages/MapPage'
import AdminDashboard   from './pages/AdminDashboard'

function NotFoundPage() {
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  )
}

// Map page needs Navbar but not Footer (full-screen map)
function MapLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <MapPage />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Auth pages — full page, no layout */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* App pages with layout */}
          <Route path="/"   element={<Layout><HomePage /></Layout>} />
          <Route path="/map" element={<MapLayout />} />

          <Route path="/report" element={
            <Layout>
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            </Layout>
          } />

          <Route path="/report/:id" element={
            <Layout>
              <ProtectedRoute>
                <ReportDetailPage />
              </ProtectedRoute>
            </Layout>
          } />

          <Route path="/my-reports" element={
            <Layout>
              <ProtectedRoute>
                <MyReportsPage />
              </ProtectedRoute>
            </Layout>
          } />

          <Route path="/admin" element={
            <Layout>
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            </Layout>
          } />

          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
