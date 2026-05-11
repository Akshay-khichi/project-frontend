import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, FileQuestion, Loader2, Sparkles } from 'lucide-react'
import { pyqsAPI, bookmarksAPI } from '@/api/axios'
import { useStore } from '@/store/useStore'
import SecurePDFViewer from '@/components/security/SecurePDFViewer'
import PremiumLock from '@/components/premium/PremiumLock'

const EXAM_TYPE_COLORS = {
  'end-sem':       { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', text: '#A78BFA' },
  'mid-sem':       { bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.2)',  text: '#F5A623' },
  'supplementary': { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  text: '#34D399' },
}

export default function PYQDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isPremiumUser, user } = useStore()

  const premium = isPremiumUser()

  const [signedUrl,  setSignedUrl]  = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const { data: pyq, isLoading, isError } = useQuery({
    queryKey: ['pyq', id],
    queryFn: () => pyqsAPI.get(id).then((r) => {
      setBookmarked(r.data.pyq.isBookmarked || false)
      return r.data.pyq
    }),
    staleTime: 5 * 60 * 1000,
  })

  const { mutate: fetchSignedUrl, isPending: fetchingUrl } = useMutation({
    mutationFn: () => pyqsAPI.getSignedUrl(id).then((r) => r.data.url),
    onSuccess: (url) => { setSignedUrl(url); setViewerOpen(true) },
  })

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: () => bookmarked ? bookmarksAPI.remove(id) : bookmarksAPI.add(id),
    onSuccess: () => { setBookmarked((b) => !b); qc.invalidateQueries({ queryKey: ['bookmarks'] }) },
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
        <span className="text-ice-400 text-sm">Loading paper…</span>
      </div>
    )
  }

  if (isError || !pyq) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="font-display font-600 text-ice-200 mb-2">PYQ not found</p>
        <Link to="/pyqs" className="text-sm text-amber-400 hover:underline">← Back to PYQs</Link>
      </div>
    )
  }

  const typeColors = EXAM_TYPE_COLORS[pyq.examType] || EXAM_TYPE_COLORS['mid-sem']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-ice-400 hover:text-ice-100 transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to PYQs
      </button>

      {/* Metadata */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mb-6"
        style={{ border: !premium ? '1px solid rgba(139,92,246,0.2)' : undefined }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <FileQuestion className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="font-display font-700 text-xl text-ice-100 mb-2">{pyq.title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full font-mono"
                      style={{ background: typeColors.bg, border: `1px solid ${typeColors.border}`, color: typeColors.text }}>
                  {pyq.examType}
                </span>
                <span className="text-xs text-ice-500 font-mono">{pyq.year}</span>
                <span className="text-ice-700">·</span>
                <span className="text-xs text-ice-500 font-mono">{pyq.subject?.name}</span>
                <span className="text-ice-700">·</span>
                <span className="text-xs text-ice-500 font-mono">{pyq.branch?.name}</span>
                <span className="text-ice-700">·</span>
                <span className="text-xs text-ice-500 font-mono">Sem {pyq.semester?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-premium"><Sparkles className="w-3 h-3" />Premium</span>
            {user && (
              <button onClick={() => toggleBookmark()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-amber-400/10"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                {bookmarked
                  ? <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  : <Bookmark className="w-4 h-4 text-ice-400" />
                }
              </button>
            )}
            <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <Share2 className="w-4 h-4 text-ice-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-xs text-ice-600 font-mono">{pyq.downloadCount ?? 0} views</span>
          {pyq.fileSize && <span className="text-xs text-ice-600 font-mono">{(pyq.fileSize / 1024 / 1024).toFixed(1)} MB</span>}
          <span className="text-xs text-ice-600 font-mono">{new Date(pyq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </motion.div>

      {/* Viewer / Lock */}
      {!premium ? (
        <PremiumLock locked variant="page" reason="All PYQs require Premium access">
          <div className="h-96 rounded-2xl flex items-center justify-center"
               style={{ background: '#111120' }}>
            <FileQuestion className="w-16 h-16 text-ice-700" />
          </div>
        </PremiumLock>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {!viewerOpen ? (
            <div className="card text-center py-16"
                 style={{ border: '1px solid rgba(139,92,246,0.15)' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                   style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <FileQuestion className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="font-display font-600 text-ice-100 mb-2">Ready to view</h3>
              <p className="text-sm text-ice-400 mb-6">Secure watermarked viewer — no download, no print.</p>
              <button onClick={() => fetchSignedUrl()} disabled={fetchingUrl} className="btn-primary">
                {fetchingUrl
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Loading…</>
                  : <><FileQuestion className="w-4 h-4" />Open Secure Viewer</>
                }
              </button>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <SecurePDFViewer signedUrl={signedUrl} fileName={pyq.title} onError={() => setViewerOpen(false)} />
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
