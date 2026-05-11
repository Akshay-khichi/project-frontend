import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, Lock, Eye, Filter, ChevronDown, X, LayoutGrid, List } from 'lucide-react'
import { notesAPI, categoriesAPI } from '@/api/axios'
import { useStore } from '@/store/useStore'
import PremiumLock from '@/components/premium/PremiumLock'
import { SkeletonList } from '@/components/common/SkeletonCard'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value:  'createdAt', label: 'Oldest First' },
  { value: '-downloadCount', label: 'Most Popular' },
  { value:  'title',     label: 'A → Z' },
]

function NoteCard({ note, hasAccess, onView, viewMode }) {
  const isPremium = note.unitNumber > 2

  const CardInner = (
    <div className={`card h-full flex ${viewMode === 'list' ? 'flex-row items-center gap-4' : 'flex-col'} relative overflow-hidden`}>
      {/* Unit badge */}
      <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-3'}`}>
        <div className={`${viewMode === 'list' ? 'w-10 h-10' : 'w-10 h-10 mb-3'} rounded-xl flex items-center justify-center`}
             style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.12)' }}>
          <BookOpen className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-600 text-ice-100 text-sm leading-snug line-clamp-2">{note.title}</h3>
          {isPremium
            ? <span className="badge-premium text-[10px] flex-shrink-0"><Lock className="w-2.5 h-2.5" />Premium</span>
            : <span className="badge-free text-[10px] flex-shrink-0">Free</span>
          }
        </div>

        <p className="text-xs text-ice-500 mb-2">
          {note.subject?.name} · Unit {note.unitNumber}
        </p>

        {note.description && viewMode !== 'list' && (
          <p className="text-xs text-ice-400 leading-relaxed line-clamp-2 mb-3">{note.description}</p>
        )}

        <div className="flex items-center gap-3 text-[10px] text-ice-600 font-mono mt-auto">
          <span>{note.downloadCount ?? 0} views</span>
          <span>·</span>
          <span>{note.branch?.name}</span>
          <span>·</span>
          <span>Sem {note.semester?.name}</span>
        </div>
      </div>

      {/* Action */}
      {!isPremium || hasAccess ? (
        <button
          onClick={() => onView(note)}
          className="mt-4 btn-ghost w-full justify-center text-xs py-2.5 pdf-interactive"
          style={viewMode === 'list' ? { width: 'auto', marginTop: 0 } : {}}
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
      ) : null}
    </div>
  )

  if (isPremium && !hasAccess) {  
    return (
      <PremiumLock locked variant="card">
        {CardInner}
      </PremiumLock>
    )
  }

  return CardInner
}

export default function Notes() {
  const navigate  = useNavigate()
  const { hasAccess } = useStore()

  const [search,   setSearch]   = useState('')
  const [branch,   setBranch]   = useState('')
  const [semester, setSemester] = useState('')
  const [subject,  setSubject]  = useState('')
  const [sort,     setSort]     = useState('-createdAt')
  const [page,     setPage]     = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const LIMIT = 12

  // ── Categories ─────────────────────────────────
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesAPI.list().then((r) => r.data.categories),
    staleTime: 10 * 60 * 1000,
  })

  const branches  = categories?.filter((c) => c.type === 'branch')   || []
  const semesters = categories?.filter((c) => c.type === 'semester' && (!branch || c.parent === branch)) || []
  const subjects  = categories?.filter((c) => c.type === 'subject'  && (!semester || c.parent === semester)) || []

  // ── Notes Query ────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['notes', { search, branch, semester, subject, sort, page }],
    queryFn: () =>
      notesAPI.list({
        search: search || undefined,
        branch: branch || undefined,
        semester: semester || undefined,
        subject: subject || undefined,
        sort,
        page,
        limit: LIMIT,
      }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  })

  const notes      = data?.notes      || []
  const totalPages = data?.totalPages || 1

  const resetFilters = () => {
    setSearch(''); setBranch(''); setSemester(''); setSubject(''); setSort('-createdAt'); setPage(1)
  }

  const handleView = useCallback((note) => {
    navigate(`/notes/${note._id}`)
  }, [navigate])

  const hasFilters = search || branch || semester || subject

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="section-label mb-2">Study Material</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-800 text-3xl sm:text-4xl text-ice-100">Notes Library</h1>
            <p className="text-ice-400 mt-1 text-sm">
              Unit 1 & 2 free · Unit 3+ requires{' '}
              <span className="text-amber-400">Premium</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-amber-400/10 text-amber-400' : 'text-ice-500 hover:text-ice-300'}`}
              style={{ border: viewMode === 'grid' ? '1px solid rgba(245,166,35,0.25)' : '1px solid rgba(255,255,255,0.05)' }}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-amber-400/10 text-amber-400' : 'text-ice-500 hover:text-ice-300'}`}
              style={{ border: viewMode === 'list' ? '1px solid rgba(245,166,35,0.25)' : '1px solid rgba(255,255,255,0.05)' }}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Search + Filters Bar ─────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-3">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
            <input
              className="input pl-11 pr-4"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen((f) => !f)}
            className={`px-4 rounded-xl flex items-center gap-2 text-sm transition-all sm:hidden ${filtersOpen ? 'bg-amber-400/10 text-amber-400' : 'btn-ghost'}`}
            style={{ border: filtersOpen ? '1px solid rgba(245,166,35,0.25)' : undefined }}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {/* Sort */}
          <div className="relative hidden sm:block">
            <select
              className="input pr-8 text-sm appearance-none cursor-pointer"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              style={{ minWidth: 160 }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
          </div>
        </div>

        {/* Cascade Filters — desktop always visible, mobile toggle */}
        <AnimatePresence>
          {(filtersOpen || window.innerWidth >= 640) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 overflow-hidden"
            >
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
                  onChange={(e) => { setSemester(e.target.value); setSubject(''); setPage(1) }} disabled={!branch}>
                  <option value="">All Semesters</option>
                  {semesters.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
              </div>

              {/* Subject */}
              <div className="relative">
                <select className="input text-sm appearance-none cursor-pointer" value={subject}
                  onChange={(e) => { setSubject(e.target.value); setPage(1) }} disabled={!semester}>
                  <option value="">All Subjects</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filters + clear */}
        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-ice-500">Active filters:</span>
            {search   && <FilterChip label={`"${search}"`}  onRemove={() => setSearch('')} />}
            {branch   && <FilterChip label={branches.find(b=>b._id===branch)?.name}    onRemove={() => { setBranch(''); setSemester(''); setSubject('') }} />}
            {semester && <FilterChip label={semesters.find(s=>s._id===semester)?.name} onRemove={() => { setSemester(''); setSubject('') }} />}
            {subject  && <FilterChip label={subjects.find(s=>s._id===subject)?.name}   onRemove={() => setSubject('')} />}
            <button onClick={resetFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors ml-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Results ─────────────────────────────── */}
      {isLoading ? (
        <SkeletonList count={LIMIT} />
      ) : notes.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {notes.map((note, i) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NoteCard
                note={note}
                hasAccess={hasAccess(note.unitNumber)}
                onView={handleView}
                viewMode={viewMode}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Pagination ──────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || isFetching}
            className="btn-ghost text-sm px-4 py-2 disabled:opacity-30"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-9 h-9 rounded-xl text-sm font-mono transition-all"
                  style={{
                    background: p === page ? 'rgba(245,166,35,0.15)' : 'transparent',
                    border: p === page ? '1px solid rgba(245,166,35,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    color: p === page ? '#F5A623' : '#9299C4',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || isFetching}
            className="btn-ghost text-sm px-4 py-2 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
          style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623' }}>
      {label}
      <button onClick={onRemove} className="hover:text-amber-200"><X className="w-3 h-3" /></button>
    </span>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
           style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.1)' }}>
        <BookOpen className="w-8 h-8 text-ice-600" />
      </div>
      <p className="font-display font-600 text-ice-300 mb-1">No notes found</p>
      <p className="text-sm text-ice-600">Try adjusting your filters or search term</p>
    </div>
  )
}
