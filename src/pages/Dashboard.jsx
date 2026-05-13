import { memo, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, FileQuestion, Sparkles, Clock, Bookmark,
  TrendingUp, ArrowRight, Crown, AlertCircle, Zap, RefreshCw, Lock
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { notesAPI, pyqsAPI, bookmarksAPI } from '@/api/axios'

/* ── Character Avatars ─────────────────────────────────────────────── */
const CHARACTER_AVATARS = [
  {
    name: 'hero',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M50 5 C25 5 5 25 5 50 C5 75 25 95 50 95 C75 95 95 75 95 50 C95 25 75 5 50 5 Z', fill: '#F87171', stroke: '#DC2626' },
      { d: 'M30 35 Q30 25 40 25 Q50 25 50 35 Q50 45 40 45 Q30 45 30 35', fill: '#1F2937' },
      { d: 'M60 35 Q60 25 70 25 Q80 25 80 35 Q80 45 70 45 Q60 45 60 35', fill: '#1F2937' },
      { d: 'M35 40 Q35 35 40 35 Q45 35 45 40 Q45 45 40 45 Q35 45 35 40', fill: '#F9FAFB' },
      { d: 'M65 40 Q65 35 70 35 Q75 35 75 40 Q75 45 70 45 Q65 45 65 40', fill: '#F9FAFB' },
      { d: 'M45 60 Q50 70 55 60', fill: 'none', stroke: '#DC2626', strokeWidth: 2 },
    ]
  },
  {
    name: 'ninja',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M50 10 C30 10 15 25 15 45 L15 70 C15 85 30 95 50 95 C70 95 85 85 85 70 L85 45 C85 25 70 10 50 10 Z', fill: '#1F2937', stroke: '#111827' },
      { d: 'M35 40 Q35 35 42 35 Q49 35 49 40 Q49 45 42 45 Q35 45 35 40', fill: '#F9FAFB' },
      { d: 'M61 40 Q61 35 68 35 Q75 35 75 40 Q75 45 68 45 Q61 45 61 40', fill: '#F9FAFB' },
      { d: 'M30 20 L40 30 L35 25 Z', fill: '#DC2626' },
    ]
  },
  {
    name: 'robot',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M20 30 L20 75 Q20 90 50 90 Q80 90 80 75 L80 30 Q80 15 50 15 Q20 15 20 30', fill: '#3B82F6', stroke: '#2563EB' },
      { d: 'M30 40 Q30 35 40 35 Q50 35 50 40 Q50 45 40 45 Q30 45 30 40', fill: '#1F2937' },
      { d: 'M60 40 Q60 35 70 35 Q80 35 80 40 Q80 45 70 45 Q60 45 60 40', fill: '#1F2937' },
      { d: 'M33 40 Q33 37 37 37 Q41 37 41 40 Q41 43 37 43 Q33 43 33 40', fill: '#60A5FA' },
      { d: 'M63 40 Q63 37 67 37 Q71 37 71 40 Q71 43 67 43 Q63 43 63 40', fill: '#60A5FA' },
      { d: 'M45 60 Q50 65 55 60', fill: 'none', stroke: '#1F2937', strokeWidth: 2 },
      { d: 'M48 15 L48 8 M45 8 L51 8', fill: 'none', stroke: '#6B7280', strokeWidth: 2 },
    ]
  },
  {
    name: 'alien',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M50 5 C25 5 10 30 10 50 C10 75 25 95 50 95 C75 95 90 75 90 50 C90 30 75 5 50 5 Z', fill: '#84CC16', stroke: '#65A30D' },
      { d: 'M30 40 Q30 30 42 30 Q54 30 54 40 Q54 50 42 50 Q30 50 30 40', fill: '#1F2937' },
      { d: 'M56 40 Q56 30 68 30 Q80 30 80 40 Q80 50 68 50 Q56 50 56 40', fill: '#1F2937' },
      { d: 'M35 42 Q35 37 40 37 Q45 37 45 42 Q45 47 40 47 Q35 47 35 42', fill: '#84CC16' },
      { d: 'M61 42 Q61 37 66 37 Q71 37 71 42 Q71 47 66 47 Q61 47 61 42', fill: '#84CC16' },
      { d: 'M45 65 Q50 70 55 65', fill: 'none', stroke: '#65A30D', strokeWidth: 2 },
    ]
  },
  {
    name: 'pirate',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M50 10 C30 10 15 25 15 45 L15 70 C15 85 30 95 50 95 C70 95 85 85 85 70 L85 45 C85 25 70 10 50 10 Z', fill: '#FDBA74', stroke: '#FB923C' },
      { d: 'M20 35 L80 35 L80 30 Q80 20 50 20 Q20 20 20 30 Z', fill: '#DC2626' },
      { d: 'M35 45 Q35 40 42 40 Q49 40 49 45 Q49 50 42 50 Q35 50 35 45', fill: '#1F2937' },
      { d: 'M65 45 Q65 40 72 40 Q79 40 79 45 Q79 50 72 50 Q65 50 65 45', fill: '#F9FAFB' },
      { d: 'M68 45 L68 45 M66 43 L70 47 M70 43 L66 47', stroke: '#1F2937', strokeWidth: 1.5 },
      { d: 'M45 65 Q50 70 55 65', fill: 'none', stroke: '#FB923C', strokeWidth: 2 },
    ]
  },
  {
    name: 'wizard',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M50 5 L80 60 L80 75 Q80 90 50 90 Q20 90 20 75 L20 60 Z', fill: '#8B5CF6', stroke: '#7C3AED' },
      { d: 'M35 50 Q35 45 42 45 Q49 45 49 50 Q49 55 42 55 Q35 55 35 50', fill: '#1F2937' },
      { d: 'M61 50 Q61 45 68 45 Q75 45 75 50 Q75 55 68 55 Q61 55 61 50', fill: '#F9FAFB' },
      { d: 'M38 50 Q38 47 42 47 Q46 47 46 50 Q46 53 42 53 Q38 53 38 50', fill: '#8B5CF6' },
      { d: 'M64 50 Q64 47 68 47 Q72 47 72 50 Q72 53 68 53 Q64 53 64 50', fill: '#1F2937' },
      { d: 'M45 70 Q50 75 55 70', fill: 'none', stroke: '#7C3AED', strokeWidth: 2 },
      { d: 'M50 5 L55 20 L50 15 L45 20 Z', fill: '#FBBF24' },
    ]
  },
]

/* ── Get Character for User ───────────────────────────────────────── */
function getCharacterForUser(user) {
  if (!user?.email && !user?.name) return CHARACTER_AVATARS[0]
  const identifier = user.email || user.name || ''
  const index = identifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % CHARACTER_AVATARS.length
  return CHARACTER_AVATARS[index]
}

/* ── Character SVG Component ──────────────────────────────────────── */
function CharacterAvatar({ character, className = '' }) {
  return (
    <svg 
      viewBox={character.viewBox} 
      className={`w-full h-full drop-shadow-lg ${className}`}
      aria-hidden="true"
    >
      {character.paths.map((path, idx) => (
        <path
          key={idx}
          d={path.d}
          fill={path.fill}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth || 0}
        />
      ))}
    </svg>
  )
}

/* ── Animation Variants ─────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
}

/* ── Memoized Stat Card ─────────────────────────────────────────────── */
const StatCard = memo(function StatCard({ icon: Icon, label, value, delay = 0, color = '#38BDF8' }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className="group relative overflow-hidden rounded-2xl p-5 bg-[#111120] border border-white/5 hover:border-sky-400/30 transition-colors duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <p className="text-xs font-mono uppercase tracking-wider text-ice-500">{label}</p>
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon className="w-4 h-4" style={{ color }} aria-hidden="true" />
        </div>
      </div>
      <p className="font-display font-700 text-2xl text-ice-100 relative z-10 truncate" aria-live="polite">
        {value ?? '—'}
      </p>
    </motion.div>
  )
})

/* ── Content Row Component ──────────────────────────────────────────── */
const ContentRow = memo(function ContentRow({ item, type }) {
  const isNote = type === 'note'
  const Icon = isNote ? BookOpen : FileQuestion
  const accentColor = isNote ? 'rgba(56,189,248,0.08)' : 'rgba(139,92,246,0.08)'
  const accentBorder = isNote ? 'rgba(56,189,248,0.12)' : 'rgba(139,92,246,0.12)'
  const iconColor = isNote ? 'text-sky-400' : 'text-violet-400'
  
  const to = isNote ? `/notes/${item._id}` : `/pyqs/${item._id}`

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2 focus:ring-offset-[#0A0A12]"
      aria-label={`View ${isNote ? 'note' : 'PYQ'}: ${item.title}`}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ background: accentColor, border: `1px solid ${accentBorder}` }}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ice-100 truncate group-hover:text-sky-400 transition-colors duration-200">
          {item.title}
        </p>
        <p className="text-xs text-ice-500 mt-0.5 truncate">
          {isNote ? `${item.subject?.name || 'Subject'} · Unit ${item.unitNumber}` : `${item.subject?.name || 'Subject'} · ${item.year || '2024'}`}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-ice-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex-shrink-0" aria-hidden="true" />
    </Link>
  )
})

/* ── Skeleton Row ───────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-ice-800/50 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 bg-ice-800/50 rounded" />
        <div className="h-2.5 w-1/2 bg-ice-800/30 rounded" />
      </div>
    </div>
  )
}

/* ── Empty / Error State ────────────────────────────────────────────── */
function QueryFallback({ isLoading, isError, error, onRetry, children }) {
  if (isLoading) return <div className="space-y-3">{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</div>
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mb-3" aria-hidden="true" />
        <p className="text-ice-300 text-sm font-medium mb-1">Failed to load content</p>
        <p className="text-ice-600 text-xs mb-4 max-w-[200px]">{error?.message || 'Unknown error occurred'}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ice-800 hover:bg-ice-700 text-ice-200 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          aria-label="Retry loading content"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    )
  }
  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <BookOpen className="w-8 h-8 text-ice-700 mb-3" aria-hidden="true" />
        <p className="text-ice-400 text-sm">No content available yet</p>
        <p className="text-ice-600 text-xs mt-1">Check back later for updates</p>
      </div>
    )
  }
  return children
}

/* ── Premium Locked Section ─────────────────────────────────────────── */
function PremiumLockedSection({ title }) {
  return (
    <section className="rounded-2xl bg-[#111120] border border-white/5 p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
      <div className="w-16 h-16 rounded-2xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-sky-400" aria-hidden="true" />
      </div>
      <h3 className="font-display font-600 text-ice-100 text-lg mb-2">{title}</h3>
      <p className="text-ice-400 text-sm mb-6 max-w-sm">Upgrade to premium to access recent {title.toLowerCase()} and study materials</p>
      <Link to="/premium" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform">
        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Upgrade to Premium
      </Link>
    </section>
  )
}

/* ── Main Dashboard Component ───────────────────────────────────────── */
export default function Dashboard() {
  const { user, isPremiumUser, subscriptionExpiry, subscriptionPlan } = useStore()
  const navigate = useNavigate()

  const premium = useMemo(() => isPremiumUser(), [isPremiumUser])
  const daysLeft = useMemo(() => {
    if (!subscriptionExpiry) return null
    return Math.max(0, Math.ceil((new Date(subscriptionExpiry).getTime() - Date.now()) / 86400000))
  }, [subscriptionExpiry])

  const character = useMemo(() => getCharacterForUser(user), [user])

  // Fallback avatar if Google CDN fails or user has no avatar
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff&size=96`

  // Helper to get the best available avatar URL
  const getAvatarUrl = () => {
    return user?.picture || user?.avatar || user?.photoURL || user?.photos?.[0]?.value || null
  }

  const queryConfig = useMemo(() => ({
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: premium,
  }), [premium])

  const {  recentNotes, isLoading: notesLoading, isError: notesError, error: notesErr, refetch: refetchNotes } = useQuery({
    queryKey: ['notes', 'recent'],
    queryFn: () => notesAPI.list({ sort: '-createdAt', limit: 4 }).then(r => r.data.notes || []),
    ...queryConfig,
  })

  const {  recentPYQs, isLoading: pyqsLoading, isError: pyqsError, error: pyqsErr, refetch: refetchPYQs } = useQuery({
    queryKey: ['pyqs', 'recent'],
    queryFn: () => pyqsAPI.list({ sort: '-createdAt', limit: 4 }).then(r => r.data.pyqs || []),
    ...queryConfig,
  })

  const {  bookmarks, isLoading: bmLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => bookmarksAPI.list().then(r => r.data.bookmarks || []),
    ...queryConfig,
  })

  const handleNavigatePremium = useCallback(() => navigate('/premium'), [navigate])
  const bookmarkCount = useMemo(() => bookmarks?.length ?? 0, [bookmarks])

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[calc(100vh-4rem)]"
      aria-label="User Dashboard"
    >
      {/* ── Header with Avatar & Character ─────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-sky-400 to-blue-600 flex-shrink-0 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0A0A12] flex items-center justify-center">
              {getAvatarUrl() ? (
                <img 
                  src={getAvatarUrl()} 
                  alt={user?.name || 'User'} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = fallbackAvatar
                  }}
                />
              ) : (
                <span className="text-xl font-bold text-sky-400">{user?.name?.[0]?.toUpperCase() || 'S'}</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-mono text-sky-400 tracking-widest mb-1">WELCOME BACK</p>
            <h1 className="text-3xl font-bold text-ice-100 leading-none">{user?.name?.split(' ')[0] || 'Student'}</h1>
            <p className="text-ice-500 text-sm mt-1">Your personalized study overview</p>
          </div>
        </div>

        {/* Right: Character Avatar */}
        <motion.div 
          className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0"
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="absolute inset-0 bg-sky-400/20 blur-2xl rounded-full opacity-50"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-sky-400/10 to-blue-600/10 rounded-3xl border border-sky-400/20 p-4 backdrop-blur-sm">
            <CharacterAvatar character={character} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-sky-400 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0A0A12]">
            <Sparkles className="w-4 h-4 text-[#0A0A12]" />
          </div>
        </motion.div>
      </motion.div>

      {/* ─ Subscription Banner ────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-8">
        {premium ? (
          <div 
            className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-sky-400/10 to-sky-600/5 border border-sky-400/20"
            role="status"
            aria-label="Premium subscription active"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-sky-400/15 border border-sky-400/30 shadow-lg shadow-sky-400/10">
                <Crown className="w-5 h-5 text-sky-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display font-600 text-sky-400 text-lg">Premium Active</p>
                <p className="text-xs text-ice-400 mt-0.5">
                  {subscriptionPlan === 'yearly' ? 'Yearly' : 'Standard'} plan · {daysLeft !== null ? `${daysLeft} days remaining` : 'Lifetime access'}
                </p>
              </div>
            </div>
            <span className="badge-premium text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" aria-hidden="true" /> Full Access
            </span>
          </div>
        ) : (
          <div 
            className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111120] border border-white/10"
            role="alert"
            aria-label="Upgrade to premium"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-sky-400/10 border border-sky-400/20">
                <Lock className="w-5 h-5 text-sky-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display font-600 text-ice-100 text-lg">Unlock Full Access</p>
                <p className="text-xs text-ice-400 mt-0.5">All units and  PYQs require premium</p>
              </div>
            </div>
            <button
              onClick={handleNavigatePremium}
              className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2 focus:ring-offset-[#0A0A12]"
              aria-label="Go to premium plans"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Upgrade Now
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Stats Grid ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={BookOpen} label="Available Notes" value="5,000+" delay={0} color="#38BDF8" />
        <StatCard icon={FileQuestion} label="PYQ Papers" value="2,000+" delay={0.05} color="#8B5CF6" />
        <StatCard icon={Bookmark} label="Bookmarks" value={bookmarkCount} delay={0.1} color="#38BDF8" />
        <StatCard icon={Zap} label="Access Level" value={premium ? 'Premium' : 'Free'} delay={0.15} color={premium ? '#38BDF8' : '#64748B'} />
      </motion.div>

      {/* ─ Quick Access Grid (Premium Only) ───────────────────────── */}
      {premium ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notes */}
          <section aria-labelledby="recent-notes-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-notes-heading" className="font-display font-600 text-ice-100 text-lg">Recent Notes</h2>
              <Link to="/notes" className="group flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors focus:outline-none focus:underline">
                View all <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-2xl bg-[#111120] border border-white/5 p-3">
              <QueryFallback isLoading={notesLoading} isError={notesError} error={notesErr} onRetry={refetchNotes}>
                {recentNotes?.map(note => (
                  <ContentRow key={note._id} item={note} type="note" />
                ))}
              </QueryFallback>
            </div>
          </section>

          {/* Recent PYQs */}
          <section aria-labelledby="recent-pyqs-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-pyqs-heading" className="font-display font-600 text-ice-100 text-lg">Recent PYQs</h2>
              <Link to="/pyqs" className="group flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors focus:outline-none focus:underline">
                View all <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-2xl bg-[#111120] border border-white/5 p-3">
              <QueryFallback isLoading={pyqsLoading} isError={pyqsError} error={pyqsErr} onRetry={refetchPYQs}>
                {recentPYQs?.map(pyq => (
                  <ContentRow key={pyq._id} item={pyq} type="pyq" />
                ))}
              </QueryFallback>
            </div>
          </section>
        </motion.div>
      ) : (
        /* Non-premium: Show locked sections */
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumLockedSection title="Recent Notes" />
          <PremiumLockedSection title="Recent PYQs" />
        </motion.div>
      )}
    </motion.main>
  )
}