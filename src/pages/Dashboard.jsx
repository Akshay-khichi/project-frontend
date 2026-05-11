import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen, FileQuestion, Sparkles, Clock, Bookmark,
  TrendingUp, ArrowRight, Crown, AlertTriangle, Zap
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { notesAPI, pyqsAPI, bookmarksAPI } from '@/api/axios'

function StatCard({ icon: Icon, label, value, color = '#F5A623', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-ice-500 font-mono uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="font-display font-700 text-2xl text-ice-100">{value ?? '—'}</p>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, subscriptionStatus, subscriptionExpiry, subscriptionPlan, isPremiumUser } = useStore()

  const premium  = isPremiumUser()
  const daysLeft = subscriptionExpiry
    ? Math.max(0, Math.ceil((new Date(subscriptionExpiry) - new Date()) / 86400000))
    : null

  const { data: recentNotes } = useQuery({
    queryKey: ['notes', { sort: '-createdAt', limit: 4 }],
    queryFn:  () => notesAPI.list({ sort: '-createdAt', limit: 4 }).then((r) => r.data.notes),
    staleTime: 5 * 60 * 1000,
  })

  const { data: recentPYQs } = useQuery({
    queryKey: ['pyqs', { sort: '-createdAt', limit: 4 }],
    queryFn:  () => pyqsAPI.list({ sort: '-createdAt', limit: 4 }).then((r) => r.data.pyqs),
    staleTime: 5 * 60 * 1000,
  })

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn:  () => bookmarksAPI.list().then((r) => r.data.bookmarks),
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="section-label mb-2">Welcome back</p>
        <h1 className="font-display font-800 text-3xl sm:text-4xl text-ice-100">
          {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-ice-400 mt-1">Here's your study overview</p>
      </motion.div>

      {/* ── Subscription Banner ──────────────────── */}
      {premium ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.04))',
            border: '1px solid rgba(245,166,35,0.25)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)' }}>
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-display font-600 text-amber-400">Premium Active</p>
              <p className="text-xs text-ice-400 mt-0.5">
                {subscriptionPlan === 'yearly' ? 'Yearly' : 'Monthly'} plan ·{' '}
                {daysLeft !== null ? `${daysLeft} days remaining` : 'Active'}
              </p>
            </div>
          </div>
          <span className="badge-premium text-xs">
            <Sparkles className="w-3 h-3" />
            Full Access
          </span>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="font-display font-600 text-ice-100">Free Plan</p>
              <p className="text-xs text-ice-400 mt-0.5">Units 1 & 2 only · Upgrade for full access</p>
            </div>
          </div>
          <Link to="/premium" className="btn-primary text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade Now
          </Link>
        </motion.div>
      )}

      {/* ── Stats ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={BookOpen}    label="Available Notes"  value={recentNotes ? '5,000+' : '—'} delay={0.05} />
        <StatCard icon={FileQuestion}label="PYQ Papers"       value={recentPYQs  ? '2,000+' : '—'} delay={0.1} />
        <StatCard icon={Bookmark}    label="Bookmarks"        value={bookmarks?.length ?? 0}         delay={0.15} />
        <StatCard icon={Zap}         label="Access Level"     value={premium ? 'Premium' : 'Free'}   color={premium ? '#F5A623' : '#6670A0'} delay={0.2} />
      </div>

      {/* ── Quick Access ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-600 text-ice-100">Recent Notes</h2>
            <Link to="/notes" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotes ? (
              recentNotes.slice(0, 4).map((note) => (
                <Link
                  key={note._id}
                  to={`/notes/${note._id}`}
                  className="card flex items-center gap-3 group hover:no-underline"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.12)' }}>
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-500 text-ice-100 truncate">{note.title}</p>
                    <p className="text-xs text-ice-500 mt-0.5">{note.subject?.name} · Unit {note.unitNumber}</p>
                  </div>
                  {note.unitNumber > 2 && !premium && (
                    <span className="badge-premium text-[10px] flex-shrink-0">Premium</span>
                  )}
                </Link>
              ))
            ) : (
              [1,2,3,4].map((i) => (
                <div key={i} className="card flex items-center gap-3">
                  <div className="skeleton w-9 h-9 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <div className="skeleton h-3 w-3/4 mb-2" />
                    <div className="skeleton h-2.5 w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent PYQs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-600 text-ice-100">Recent PYQs</h2>
            <Link to="/pyqs" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPYQs ? (
              recentPYQs.slice(0, 4).map((pyq) => (
                <Link
                  key={pyq._id}
                  to={`/pyqs/${pyq._id}`}
                  className="card flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.12)' }}>
                    <FileQuestion className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-500 text-ice-100 truncate">{pyq.title}</p>
                    <p className="text-xs text-ice-500 mt-0.5">{pyq.subject?.name} · {pyq.year} · {pyq.examType}</p>
                  </div>
                  {!premium && <span className="badge-premium text-[10px] flex-shrink-0">Premium</span>}
                </Link>
              ))
            ) : (
              [1,2,3,4].map((i) => (
                <div key={i} className="card flex items-center gap-3">
                  <div className="skeleton w-9 h-9 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <div className="skeleton h-3 w-3/4 mb-2" />
                    <div className="skeleton h-2.5 w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
