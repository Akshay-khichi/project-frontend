import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Search, FileQuestion } from 'lucide-react'
import { pyqsAPI } from '@/api/axios'

export default function AdminPYQs() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const LIMIT = 15

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pyqs', { search, page }],
    queryFn: () => pyqsAPI.list({ search: search || undefined, page, limit: LIMIT }).then((r) => r.data),
    staleTime: 30 * 1000,
  })

  const { mutate: deletePYQ } = useMutation({
    mutationFn: (id) => pyqsAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-pyqs'] }),
  })

  const pyqs       = data?.pyqs       || []
  const totalPages = data?.totalPages || 1

  const EXAM_TYPE_STYLES = {
    'end-sem':       'text-violet-400 bg-violet-400/10 border-violet-400/20',
    'mid-sem':       'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'supplementary': 'text-green-400 bg-green-400/10 border-green-400/20',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">Admin Panel</p>
          <h1 className="font-display font-800 text-3xl text-ice-100">Manage PYQs</h1>
        </div>
        <Link to="/admin/pyqs/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Upload PYQ
        </Link>
      </motion.div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
        <input className="input pl-11" placeholder="Search PYQs…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="grid grid-cols-12 px-4 py-3 text-xs font-mono text-ice-600 uppercase tracking-wider"
             style={{ background: '#0A0A12', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Subject</div>
          <div className="col-span-2 text-center">Year</div>
          <div className="col-span-2 text-center">Exam Type</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 px-4 py-4 gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              {[4,2,2,2,2].map((span, j) => <div key={j} className={`col-span-${span} skeleton h-3 rounded`} />)}
            </div>
          ))
        ) : pyqs.length === 0 ? (
          <div className="text-center py-16">
            <FileQuestion className="w-8 h-8 text-ice-700 mx-auto mb-3" />
            <p className="text-ice-500 text-sm">No PYQs found</p>
          </div>
        ) : (
          pyqs.map((pyq) => (
            <div key={pyq._id}
                 className="grid grid-cols-12 px-4 py-3.5 items-center text-sm transition-colors hover:bg-white/[0.02]"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="col-span-4 font-display font-500 text-ice-100 truncate pr-4">{pyq.title}</div>
              <div className="col-span-2 text-ice-500 text-xs truncate">{pyq.subject?.name}</div>
              <div className="col-span-2 text-center font-mono text-ice-400 text-xs">{pyq.year}</div>
              <div className="col-span-2 flex justify-center">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${EXAM_TYPE_STYLES[pyq.examType] || 'text-ice-500'}`}>
                  {pyq.examType}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <Link to={`/admin/pyqs/${pyq._id}/edit`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ice-500 hover:text-amber-400 hover:bg-amber-400/5 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => { if (confirm('Delete this PYQ?')) deletePYQ(pyq._id) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ice-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="btn-ghost text-sm px-4 py-2 disabled:opacity-30">Prev</button>
          <span className="font-mono text-sm text-ice-400">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="btn-ghost text-sm px-4 py-2 disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  )
}
