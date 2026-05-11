import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, BookOpen, FileQuestion, Download, TrendingUp, Shield, ArrowRight, Plus } from 'lucide-react'
import { analyticsAPI } from '@/api/axios'

function StatCard({ icon: Icon, label, value, delta, color = '#F5A623', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {delta && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            +{delta}
          </span>
        )}
      </div>
      <p className="font-display font-800 text-3xl text-ice-100 mb-1">{value ?? '—'}</p>
      <p className="text-xs text-ice-500 font-mono uppercase tracking-wider">{label}</p>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: () => analyticsAPI.overview().then((r) => r.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })

  const { data: topContent } = useQuery({
    queryKey: ['admin-top-content'],
    queryFn: () => analyticsAPI.topContent().then((r) => r.data.content),
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <p className="section-label">Admin Panel</p>
          </div>
          <h1 className="font-display font-800 text-3xl text-ice-100">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/notes/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Upload Note
          </Link>
          <Link to="/admin/pyqs/new" className="btn-ghost text-sm">
            <Plus className="w-4 h-4" /> Upload PYQ
          </Link>
        </div>
      </motion.div>

      {/* ── Stats Grid ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Users}        label="Total Users"     value={overview?.totalUsers}     delta={overview?.newUsersToday}    delay={0.05} />
        <StatCard icon={Download}     label="Total Downloads" value={overview?.totalDownloads}  delta={overview?.downloadsToday}   delay={0.1}  color="#8B5CF6" />
        <StatCard icon={BookOpen}     label="Total Notes"     value={overview?.totalNotes}                                        delay={0.15} color="#10B981" />
        <StatCard icon={FileQuestion} label="Total PYQs"      value={overview?.totalPYQs}                                         delay={0.2}  color="#F59E0B" />
      </div>

      {/* ── Secondary Stats ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Active Users (24h)',  value: overview?.activeUsers24h,  color: '#4ade80' },
          { label: 'Premium Subscribers', value: overview?.premiumUsers,    color: '#F5A623' },
          { label: 'Revenue This Month',  value: overview?.revenueThisMonth ? `₹${overview.revenueThisMonth.toLocaleString('en-IN')}` : '—', color: '#60A5FA' },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            className="rounded-2xl p-5"
            style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-xs text-ice-500 font-mono uppercase tracking-wider mb-2">{label}</p>
            <p className="font-display font-800 text-2xl" style={{ color }}>{value ?? '—'}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Nav ────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-10">
        <h2 className="font-display font-600 text-ice-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/admin/notes',      icon: BookOpen,     label: 'Manage Notes',      desc: 'Upload, edit, delete' },
            { to: '/admin/pyqs',       icon: FileQuestion, label: 'Manage PYQs',       desc: 'Year-wise papers' },
            { to: '/admin/users',      icon: Users,        label: 'Manage Users',       desc: 'Roles, suspend, delete' },
            { to: '/admin/categories', icon: TrendingUp,   label: 'Categories',        desc: 'Branches, semesters, subjects' },
          ].map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to}
              className="card flex items-center gap-3 group hover:border-amber-400/20 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)' }}>
                <Icon className="w-5 h-5 text-amber-400/70 group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-600 text-sm text-ice-100">{label}</p>
                <p className="text-xs text-ice-500">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ice-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Top Content ──────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <h2 className="font-display font-600 text-ice-100 mb-4">Top Content This Week</h2>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-3 text-xs font-mono text-ice-600 uppercase tracking-wider"
               style={{ background: '#0A0A12', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Subject</div>
            <div className="col-span-2 text-right">Views</div>
          </div>

          {topContent ? (
            topContent.slice(0, 10).map((item, i) => (
              <div key={item._id}
                   className="grid grid-cols-12 px-4 py-3.5 text-sm items-center transition-colors hover:bg-white/[0.02]"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="col-span-1 font-mono text-ice-600">{i + 1}</div>
                <div className="col-span-5 text-ice-100 font-display font-500 truncate pr-4">{item.title}</div>
                <div className="col-span-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={item.type === 'note'
                          ? { background: 'rgba(245,166,35,0.1)', color: '#F5A623' }
                          : { background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}>
                    {item.type}
                  </span>
                </div>
                <div className="col-span-2 text-ice-500 text-xs truncate">{item.subject?.name}</div>
                <div className="col-span-2 text-right font-mono text-ice-300">{item.downloadCount?.toLocaleString()}</div>
              </div>
            ))
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 px-4 py-3.5 gap-4">
                <div className="col-span-1 skeleton h-3 rounded" />
                <div className="col-span-5 skeleton h-3 rounded" />
                <div className="col-span-2 skeleton h-3 rounded" />
                <div className="col-span-2 skeleton h-3 rounded" />
                <div className="col-span-2 skeleton h-3 rounded" />
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
