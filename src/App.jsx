import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '@/components/common/Navbar'
// import DevToolsDetector from '@/components/security/DevToolsDetector'
// import { useSecurityGuards } from '@/hooks/useSecurityGuards'
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/routes/ProtectedRoute'
import { useStore } from '@/store/useStore'
import { authAPI, setAccessToken } from '@/api/axios'
import { Loader2 } from 'lucide-react'


// ── Lazy Pages ─────────────────────────────────────
const Landing      = lazy(() => import('@/pages/Landing'))
const Login        = lazy(() => import('@/pages/Login'))
const Dashboard    = lazy(() => import('@/pages/Dashboard'))
const Notes        = lazy(() => import('@/pages/Notes'))
const NoteDetail   = lazy(() => import('@/pages/NoteDetail'))
const PYQs         = lazy(() => import('@/pages/PYQs'))
const PYQDetail    = lazy(() => import('@/pages/PYQDetail'))
const Premium      = lazy(() => import('@/pages/Premium'))

// Admin
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminNotes     = lazy(() => import('@/pages/admin/AdminNotes'))
const AdminUsers     = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminPYQs      = lazy(() => import('@/pages/admin/AdminPYQs'))

// Upload form pages
const ContentUploadForm = lazy(() => import('@/components/admin/ContentUploadForm'))

// ── Page Transition Wrapper ─────────────────────────
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ── Full-screen Loading ─────────────────────────────
function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7DD3FC, #38BDF8)'
          }}
        >
          <Loader2 className="w-6 h-6 text-sky-950 animate-spin" />
        </div>

        <p className="text-ice-500 text-sm font-mono">
          Loading EduVault…
        </p>
      </div>
    </div>
  )
}


// ── Admin Layout ────────────────────────────────────
function AdminLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ paddingTop: '64px' }}>
      {/* Admin sidebar nav for desktop */}
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-64px)] sticky top-16 pt-6 pb-8 px-4"
               style={{ borderRight: '1px solid rgba(255,255,255,0.04)', background: '#0A0A12' }}>
          <p className="text-xs font-mono text-ice-600 uppercase tracking-widest mb-4 px-2">Admin</p>
          {[
            { to: '/admin',            label: 'Dashboard' },
            { to: '/admin/notes',      label: 'Notes' },
            { to: '/admin/pyqs',       label: 'PYQs' },
            { to: '/admin/users',      label: 'Users' },
            { to: '/admin/categories', label: 'Categories' },
          ].map(({ to, label }) => (
            <a key={to} href={to}
               className="block px-3 py-2.5 rounded-xl text-sm font-body text-ice-400 hover:text-ice-100 hover:bg-white/5 transition-all mb-1">
              {label}
            </a>
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

  // ── Apply global security guards ──────────────────
  // useSecurityGuards()

  // ── Bootstrap: verify session on mount ───────────
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Try to refresh token silently (uses HttpOnly cookie)
        const { data } = await authAPI.me()
        const { user: me, accessToken, subscription } = data

        setAccessToken(accessToken)
        setAuth({ user: me, token: accessToken })

        if (subscription) {
          setSubscription({
            status: subscription.status,
            expiry: subscription.expiry,
            plan:   subscription.plan,
          })
        }
      } catch (_) {
        // Not authenticated — stay on public route
      } finally {
        setBootstrapping(false)
      }
    }

    bootstrap()
  }, [])

  const isAdmin  = location.pathname.startsWith('/admin')
  const noNavbar = ['/login'].includes(location.pathname)

  if (bootstrapping) return <AppLoader />

  return (
    <div className="min-h-screen bg-ink-900" onContextMenu={(e) => e.preventDefault()}>
      {/* Global security overlay */}
      {/* <DevToolsDetector /> */}

      {/* Navigation */}
      {!noNavbar && <Navbar />}

      {/* Routes */}
      <Suspense fallback={<AppLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* ── Public ──────────────────────────── */}
<Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />

<Route path="/login" element={
  <GuestRoute>
    <PageWrapper><Login /></PageWrapper>
  </GuestRoute>
} />

<Route path="/premium" element={
  <div style={{ paddingTop: '64px' }}>
    <PageWrapper><Premium /></PageWrapper>
  </div>
} />

{/* ── Subject Selection Page (Homepage for notes) ──────────────── */}
{/* Subject selection page: /notes → shows Physics/Chemistry/Math cards */}
<Route path="/notes" element={
  <ProtectedRoute>
    <div style={{ paddingTop: '64px' }}>
      <PageWrapper><Notes /></PageWrapper>
    </div>
  </ProtectedRoute>
} />

{/* Chapter grid: /notes/:subject → shows chapters for selected subject */}
<Route path="/notes/:subject" element={
  <ProtectedRoute>
    <div style={{ paddingTop: '64px' }}>
      <PageWrapper><Notes /></PageWrapper>  {/* ← Same Notes component */}
    </div>
  </ProtectedRoute>
} />

{/* Chapter detail: /notes/:subject/:chapterId → PDF viewer */}
<Route path="/notes/:subject/:chapterId" element={
  <ProtectedRoute>
    <div style={{ paddingTop: '64px' }}>
      <PageWrapper><NoteDetail /></PageWrapper>
    </div>
  </ProtectedRoute>
} />

{/* Keep existing PYQ routes */}
{/* PYQs Routes */}
<Route path="/pyqs" element={
  <ProtectedRoute>
    <div style={{ paddingTop: '64px' }}>
      <PageWrapper><PYQs /></PageWrapper>
    </div>
  </ProtectedRoute>
} />

<Route path="/pyqs/:subject" element={
  <ProtectedRoute>
    <div style={{ paddingTop: '64px' }}>
      <PageWrapper><PYQs /></PageWrapper>
    </div>
  </ProtectedRoute>
} />

<Route path="/pyqs/:subject/:paperId" element={
  <ProtectedRoute>
    <div style={{ paddingTop: '64px' }}>
      <PageWrapper><PYQDetail /></PageWrapper>
    </div>
  </ProtectedRoute>
} />

            {/* ── Admin (role-gated) ───────────────── */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout><PageWrapper><AdminDashboard /></PageWrapper></AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/notes" element={
              <AdminRoute>
                <AdminLayout><PageWrapper><AdminNotes /></PageWrapper></AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/notes/new" element={
              <AdminRoute>
                <AdminLayout>
                  <PageWrapper>
                    <ContentUploadForm mode="note" />
                  </PageWrapper>
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/pyqs" element={
              <AdminRoute>
                <AdminLayout><PageWrapper><AdminPYQs /></PageWrapper></AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/pyqs/new" element={
              <AdminRoute>
                <AdminLayout>
                  <PageWrapper>
                    <ContentUploadForm mode="pyq" />
                  </PageWrapper>
                </AdminLayout>
              </AdminRoute>
            } />

            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminLayout><PageWrapper><AdminUsers /></PageWrapper></AdminLayout>
              </AdminRoute>
            } />

            {/* ── 404 ─────────────────────────────── */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ paddingTop: '64px' }}>
                <div>
                  <p className="font-display font-800 text-7xl text-amber-400 mb-4">404</p>
                  <p className="text-ice-400 mb-6">This page doesn't exist.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  )
}
