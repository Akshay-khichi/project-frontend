import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '@/components/common/Navbar'
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/routes/ProtectedRoute'
import { useStore } from '@/store/useStore'
import { authAPI, setAccessToken } from '@/api/axios'
import { Loader2 } from 'lucide-react'

// Lazy imports
const Landing        = lazy(() => import('@/pages/Landing'))
const Login          = lazy(() => import('@/pages/Login'))
const Dashboard      = lazy(() => import('@/pages/Dashboard'))
const Notes          = lazy(() => import('@/pages/Notes'))
const NoteDetail     = lazy(() => import('@/pages/NoteDetail'))
const PYQs           = lazy(() => import('@/pages/PYQs'))
const PYQDetail      = lazy(() => import('@/pages/PYQDetail'))
const Premium        = lazy(() => import('@/pages/Premium'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminNotes     = lazy(() => import('@/pages/admin/AdminNotes'))
const AdminUsers     = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminPYQs      = lazy(() => import('@/pages/admin/AdminPYQs'))
const ContentUploadForm = lazy(() => import('@/components/admin/ContentUploadForm'))

function PageWrapper({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
      {children}
    </motion.div>
  )
}

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7DD3FC, #38BDF8)' }}>
          <Loader2 className="w-6 h-6 text-sky-950 animate-spin" />
        </div>
        <p className="text-ice-500 text-sm font-mono">Loading EduVault…</p>
      </div>
    </div>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ paddingTop: '64px' }}>
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-64px)] sticky top-16 pt-6 pb-8 px-4" style={{ borderRight: '1px solid rgba(255,255,255,0.04)', background: '#0A0A12' }}>
          <p className="text-xs font-mono text-ice-600 uppercase tracking-widest mb-4 px-2">Admin</p>
          {[
            { to: '/admin', label: 'Dashboard' },
            { to: '/admin/notes', label: 'Notes' },
            { to: '/admin/pyqs', label: 'PYQs' },
            { to: '/admin/users', label: 'Users' },
            { to: '/admin/categories', label: 'Categories' },
          ].map(({ to, label }) => (
            <a key={to} href={to} className="block px-3 py-2.5 rounded-xl text-sm font-body text-ice-400 hover:text-ice-100 hover:bg-white/5 transition-all mb-1">{label}</a>
          ))}
        </aside>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const { setAuth, setSubscription, user } = useStore()
  const [bootstrapping, setBootstrapping] = useState(true)

  // Runs EXACTLY ONCE on mount
  useEffect(() => {
    let isActive = true
    
    // SAFETY: Force stop loading after 2 seconds if auth request hangs
    const safetyTimeout = setTimeout(() => {
      if (isActive) {
        console.warn('Auth bootstrap timed out. Proceeding without auth.')
        setBootstrapping(false)
      }
    }, 2000)

    const bootstrap = async () => {
      try {
        const { data } = await authAPI.me()
        if (!isActive) return
        
        const userData = data.data || data
        const accessToken = data.accessToken || userData.accessToken
        
        if (accessToken) setAccessToken(accessToken)
        setAuth({ user: userData.user || userData, token: accessToken || 'cookie_based' })
        
        if (userData.premium) {
          setSubscription({
            status: userData.premium.status,
            expiry: userData.premium.expiry,
            plan: 'premium'
          })
        }
      } catch (err) {
        // Not authenticated - stay on public routes, do nothing
        console.log('Not authenticated (normal):', err.message)
      } finally {
        if (isActive) {
          setBootstrapping(false)
          clearTimeout(safetyTimeout)
        }
      }
    }

    bootstrap()
    return () => { isActive = false; clearTimeout(safetyTimeout) }
  }, [])

  const noNavbar = location.pathname === '/login'
  
  if (bootstrapping) return <AppLoader />

  return (
    <div className="min-h-screen bg-ink-900" onContextMenu={(e) => e.preventDefault()}>
      {!noNavbar && <Navbar />}
      <Suspense fallback={<AppLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/* ── Home / Landing Page (Public) ───────── */}
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />

            {/* ── Auth Routes ───────────────────────── */}
            <Route path="/login" element={<GuestRoute><PageWrapper><Login /></PageWrapper></GuestRoute>} />
            
            {/* ── App Routes (Protected) ────────────── */}
            <Route path="/dashboard" element={<ProtectedRoute><div style={{ paddingTop: '64px' }}><PageWrapper><Dashboard /></PageWrapper></div></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><div style={{ paddingTop: '64px' }}><PageWrapper><Notes /></PageWrapper></div></ProtectedRoute>} />
            <Route path="/notes/:subject" element={<ProtectedRoute><div style={{ paddingTop: '64px' }}><PageWrapper><Notes /></PageWrapper></div></ProtectedRoute>} />
            <Route path="/notes/:subject/:chapterId" element={<ProtectedRoute><div style={{ paddingTop: '64px' }}><PageWrapper><NoteDetail /></PageWrapper></div></ProtectedRoute>} />
            <Route path="/pyqs" element={<ProtectedRoute><div style={{ paddingTop: '64px' }}><PageWrapper><PYQs /></PageWrapper></div></ProtectedRoute>} />
            <Route path="/pyqs/:subject" element={<ProtectedRoute><div style={{ paddingTop: '64px' }}><PageWrapper><PYQs /></PageWrapper></div></ProtectedRoute>} />
            <Route path="/pyqs/:subject/:paperId" element={<ProtectedRoute><div style={{ paddingTop: '64px' }}><PageWrapper><PYQDetail /></PageWrapper></div></ProtectedRoute>} />
            <Route path="/premium" element={<div style={{ paddingTop: '64px' }}><PageWrapper><Premium /></PageWrapper></div>} />

            {/* ─ Admin Routes ──────────────────────── */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><PageWrapper><AdminDashboard /></PageWrapper></AdminLayout></AdminRoute>} />
            <Route path="/admin/notes" element={<AdminRoute><AdminLayout><PageWrapper><AdminNotes /></PageWrapper></AdminLayout></AdminRoute>} />
            <Route path="/admin/notes/new" element={<AdminRoute><AdminLayout><PageWrapper><ContentUploadForm mode="note" /></PageWrapper></AdminLayout></AdminRoute>} />
            <Route path="/admin/pyqs" element={<AdminRoute><AdminLayout><PageWrapper><AdminPYQs /></PageWrapper></AdminLayout></AdminRoute>} />
            <Route path="/admin/pyqs/new" element={<AdminRoute><AdminLayout><PageWrapper><ContentUploadForm mode="pyq" /></PageWrapper></AdminLayout></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminLayout><PageWrapper><AdminUsers /></PageWrapper></AdminLayout></AdminRoute>} />

            {/* ── 404 ─────────────────────────────── */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-center px-4" style={{ paddingTop: '64px' }}><div><p className="font-display font-800 text-7xl text-amber-400 mb-4">404</p><p className="text-ice-400 mb-6">This page doesn't exist.</p><a href="/" className="btn-primary">Go Home</a></div></div>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  )
}