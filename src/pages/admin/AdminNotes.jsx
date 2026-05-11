import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, RotateCcw, Search, Lock, Unlock, Loader2, BookOpen } from 'lucide-react'
import { notesAPI } from '@/api/axios'

export default function AdminNotes() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const LIMIT = 15

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notes', { search, page }],
    queryFn: () => notesAPI.list({ search: search || undefined, page, limit: LIMIT, includeDeleted: true }).then((r) => r.data),
    staleTime: 30 * 1000,
  })

  const { mutate: deleteNote, isPending: deleting } = useMutation({
    mutationFn: (id) => notesAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notes'] }),
  })

  const { mutate: restoreNote } = useMutation({
    mutationFn: (id) => notesAPI.restore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notes'] }),
  })

  const notes      = data?.notes      || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">Admin Panel</p>
          <h1 className="font-display font-800 text-3xl text-ice-100">Manage Notes</h1>
        </div>
        <Link to="/admin/notes/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Upload Note
        </Link>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
        <input className="input pl-11" placeholder="Search notes…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Table Head */}
          <div className="grid grid-cols-12 px-4 py-3 text-xs font-mono text-ice-600 uppercase tracking-wider"
               style={{ background: '#0A0A12', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Subject</div>
            <div className="col-span-1 text-center">Unit</div>
            <div className="col-span-2 text-center">Access</div>
            <div className="col-span-1 text-center">Views</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 px-4 py-4 gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {[4,2,1,2,1,2].map((span, j) => (
                  <div key={j} className={`col-span-${span} skeleton h-3 rounded`} />
                ))}
              </div>
            ))
          ) : notes.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-8 h-8 text-ice-700 mx-auto mb-3" />
              <p className="text-ice-500 text-sm">No notes found</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note._id}
                   className="grid grid-cols-12 px-4 py-3.5 items-center text-sm transition-colors hover:bg-white/[0.02]"
                   style={{
                     borderBottom: '1px solid rgba(255,255,255,0.03)',
                     opacity: note.isDeleted ? 0.5 : 1,
                   }}>
                <div className="col-span-4 font-display font-500 text-ice-100 truncate pr-4">
                  {note.isDeleted && <span className="text-red-400 text-[10px] font-mono mr-1">[DELETED]</span>}
                  {note.title}
                </div>
                <div className="col-span-2 text-ice-500 text-xs truncate">{note.subject?.name}</div>
                <div className="col-span-1 text-center font-mono text-ice-400 text-xs">{note.unitNumber}</div>
                <div className="col-span-2 flex items-center justify-center">
                  {note.unitNumber <= 2
                    ? <span className="badge-free text-[10px]"><Unlock className="w-2.5 h-2.5" />Free</span>
                    : <span className="badge-premium text-[10px]"><Lock className="w-2.5 h-2.5" />Premium</span>
                  }
                </div>
                <div className="col-span-1 text-center font-mono text-ice-500 text-xs">{note.downloadCount}</div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Link to={`/admin/notes/${note._id}/edit`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ice-500 hover:text-amber-400 hover:bg-amber-400/5 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  {note.isDeleted ? (
                    <button onClick={() => restoreNote(note._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-ice-500 hover:text-green-400 hover:bg-green-400/5 transition-all"
                      style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => { if (confirm('Delete this note?')) deleteNote(note._id) }}
                      disabled={deleting}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-ice-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
                      style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Pagination */}
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
