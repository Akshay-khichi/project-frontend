import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, FileQuestion, Lock, Eye, ChevronDown, X, Filter } from 'lucide-react'
import { pyqsAPI, categoriesAPI } from '@/api/axios'
import { useStore } from '@/store/useStore'
import PremiumLock from '@/components/premium/PremiumLock'
import { SkeletonList } from '@/components/common/SkeletonCard'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

const EXAM_TYPES = ['mid-sem', 'end-sem', 'supplementary']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i)

function PYQCard({ pyq, hasAccess, onView }) {
  const inner = (
    <div className="card h-full flex flex-col relative overflow-hidden">
      {/* Exam type color band */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
           style={{
             background: pyq.examType === 'end-sem'
               ? 'linear-gradient(90deg, #8B5CF6, #6D28D9)'
               : pyq.examType === 'mid-sem'
               ? 'linear-gradient(90deg, #F5A623, #E08A00)'
               : 'linear-gradient(90deg, #10B981, #059669)',
           }}
      />
      <div className="flex items-start gap-3 mb-3 pt-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <FileQuestion className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-600 text-ice-100 text-sm leading-snug line-clamp-2">{pyq.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}>
              {pyq.examType}
            </span>
            <span className="text-[10px] font-mono text-ice-500">{pyq.year}</span>
          </div>
        </div>
        <span className="badge-premium text-[10px] flex-shrink-0">
          <Lock className="w-2.5 h-2.5" />
          Premium
        </span>
      </div>

      <div className="text-xs text-ice-500 space-y-1 mb-auto">
        <p>{pyq.subject?.name}</p>
        <p className="font-mono">{pyq.branch?.name} · Sem {pyq.semester?.name}</p>
      </div>

      <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {hasAccess ? (
          <button onClick={() => onView(pyq)} className="btn-ghost w-full justify-center text-xs py-2.5">
            <Eye className="w-3.5 h-3.5" /> View Paper
          </button>
        ) : (
          <div className="text-center">
            <p className="text-[10px] text-ice-600 font-mono">Premium access required</p>
          </div>
        )}
      </div>
    </div>
  )

  if (!hasAccess) {
    return <PremiumLock locked variant="card">{inner}</PremiumLock>
  }
  return inner
}

export default function PYQs() {
  const navigate  = useNavigate()
  const { isPremiumUser } = useStore()
  const premium = isPremiumUser()

  const [search,   setSearch]   = useState('')
  const [branch,   setBranch]   = useState('')
  const [semester, setSemester] = useState('')
  const [subject,  setSubject]  = useState('')
  const [year,     setYear]     = useState('')
  const [examType, setExamType] = useState('')
  const [page,     setPage]     = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const LIMIT = 12

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesAPI.list().then((r) => r.data.categories),
    staleTime: 10 * 60 * 1000,
  })

  const branches  = categories?.filter((c) => c.type === 'branch')   || []
  const semesters = categories?.filter((c) => c.type === 'semester') || []
  const subjects  = categories?.filter((c) => c.type === 'subject')  || []

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['pyqs', { search, branch, semester, subject, year, examType, page }],
    queryFn: () =>
      pyqsAPI.list({
        search:   search   || undefined,
        branch:   branch   || undefined,
        semester: semester || undefined,
        subject:  subject  || undefined,
        year:     year     || undefined,
        examType: examType || undefined,
        page,
        limit: LIMIT,
      }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  })

  const pyqs       = data?.pyqs       || []
  const totalPages = data?.totalPages || 1

  const resetFilters = () => {
    setSearch(''); setBranch(''); setSemester(''); setSubject('')
    setYear(''); setExamType(''); setPage(1)
  }

  const handleView = (pyq) => navigate(`/pyqs/${pyq._id}`)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="section-label mb-2">Exam Preparation</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-800 text-3xl sm:text-4xl text-ice-100">Previous Year Questions</h1>
            <p className="text-ice-400 mt-1 text-sm">
              All PYQs require <span className="text-amber-400">Premium access</span>
            </p>
          </div>
          {!premium && (
            <Link to="/premium" className="btn-primary text-sm flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              Unlock All PYQs
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </motion.div>

      {/* ── Premium Banner for non-subscribers ─── */}
      {!premium && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(245,166,35,0.05))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Lock className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-display font-600 text-ice-100">All PYQs are Premium-only</p>
            <p className="text-sm text-ice-400 mt-0.5">
              Browse what's available. Subscribe to unlock all papers with secure viewing.
            </p>
          </div>
          <Link to="/premium" className="btn-primary text-sm flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> Upgrade — ₹199/mo
          </Link>
        </motion.div>
      )}

      {/* ── Filters ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
            <input className="input pl-11" placeholder="Search PYQs…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <button onClick={() => setFiltersOpen((f) => !f)}
            className={`px-4 rounded-xl flex items-center gap-2 text-sm transition-all sm:hidden ${filtersOpen ? 'bg-violet-500/10 text-violet-400' : 'btn-ghost'}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${!filtersOpen ? 'hidden sm:grid' : 'grid'}`}>
          {/* Branch */}
          <div className="relative">
            <select className="input text-sm appearance-none cursor-pointer" value={branch}
              onChange={(e) => { setBranch(e.target.value); setSemester(''); setSubject(''); setPage(1) }}>
              <option value="">All Branches</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
          </div>

          {/* Semester */}
          <div className="relative">
            <select className="input text-sm appearance-none cursor-pointer" value={semester}
              onChange={(e) => { setSemester(e.target.value); setSubject(''); setPage(1) }}>
              <option value="">All Sems</option>
              {semesters.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
          </div>

          {/* Subject */}
          <div className="relative">
            <select className="input text-sm appearance-none cursor-pointer" value={subject}
              onChange={(e) => { setSubject(e.target.value); setPage(1) }}>
              <option value="">All Subjects</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
          </div>

          {/* Year */}
          <div className="relative">
            <select className="input text-sm appearance-none cursor-pointer" value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1) }}>
              <option value="">All Years</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
          </div>

          {/* Exam Type */}
          <div className="relative">
            <select className="input text-sm appearance-none cursor-pointer" value={examType}
              onChange={(e) => { setExamType(e.target.value); setPage(1) }}>
              <option value="">All Types</option>
              {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
          </div>
        </div>

        {(search || branch || year || examType) && (
          <button onClick={resetFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> Clear all filters
          </button>
        )}
      </motion.div>

      {/* ── Cards Grid ──────────────────────────── */}
      {isLoading ? (
        <SkeletonList count={LIMIT} />
      ) : pyqs.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)' }}>
            <FileQuestion className="w-8 h-8 text-ice-600" />
          </div>
          <p className="font-display font-600 text-ice-300 mb-1">No PYQs found</p>
          <p className="text-sm text-ice-600">Try adjusting your filters</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {pyqs.map((pyq, i) => (
            <motion.div key={pyq._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <PYQCard pyq={pyq} hasAccess={premium} onView={handleView} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1 || isFetching} className="btn-ghost text-sm px-4 py-2 disabled:opacity-30">Previous</button>
          <span className="font-mono text-sm text-ice-400">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages || isFetching} className="btn-ghost text-sm px-4 py-2 disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  )
}
