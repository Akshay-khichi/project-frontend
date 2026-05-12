import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, Lock, BookOpen, Loader2 } from 'lucide-react'
import { notesAPI, bookmarksAPI } from '@/api/axios'
import { useStore } from '@/store/useStore'
import SecurePDFViewer from '@/components/security/SecurePDFViewer'
import PremiumLock from '@/components/premium/PremiumLock'

export default function NoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { hasAccess, user } = useStore()

  const [signedUrl, setSignedUrl] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const { data: note, isLoading, isError } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesAPI.get(id).then((r) => {
      setBookmarked(r.data.note.isBookmarked || false)
      return r.data.note
    }),
    staleTime: 5 * 60 * 1000,
  })

  // CHANGE 1: Remove unitNumber parameter - all content requires premium
  const access = note ? hasAccess() : false

  const { mutate: fetchSignedUrl, isPending: fetchingUrl } = useMutation({
    mutationFn: () => notesAPI.getSignedUrl(id).then((r) => r.data.url),
    onSuccess: (url) => {
      setSignedUrl(url)
      setViewerOpen(true)
    },
    onError: (err) => {
      if (err?.response?.status === 403) {
        // Handle premium required
      }
    }
  })

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: () =>
      bookmarked ? bookmarksAPI.remove(id) : bookmarksAPI.add(id),
    onSuccess: () => {
      setBookmarked((b) => !b)
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
        <span className="text-ice-400 text-sm">Loading note…</span>
      </div>
    )
  }

  if (isError || !note) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="font-display font-600 text-ice-200 mb-2">Note not found</p>
        <Link to="/notes" className="text-sm text-amber-400 hover:underline">← Back to Notes</Link>
      </div>
    )
  }

  // CHANGE 2: All content is premium - no conditional logic
  const isPremiumContent = true

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-ice-400 hover:text-ice-100 transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Notes
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-6"
        style={{ border: isPremiumContent && !access ? '1px solid rgba(245,166,35,0.2)' : undefined }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="font-display font-700 text-xl text-ice-100 mb-1">{note.title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-ice-500 font-mono">{note.branch?.name}</span>
                <span className="text-ice-700">·</span>
                <span className="text-xs text-ice-500 font-mono">Sem {note.semester?.name}</span>
                <span className="text-ice-700">·</span>
                <span className="text-xs text-ice-500 font-mono">{note.subject?.name}</span>
                <span className="text-ice-700">·</span>
                <span className="text-xs text-ice-500 font-mono">Unit {note.unitNumber}</span>
              </div>
              {note.description && (
                <p className="text-sm text-ice-400 mt-2 leading-relaxed">{note.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* CHANGE 3: Always show Premium badge */}
            <span className="badge-premium"><Lock className="w-3 h-3" />Premium</span>
            {user && (
              <button
                onClick={() => toggleBookmark()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-amber-400/10"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                {bookmarked
                  ? <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  : <Bookmark className="w-4 h-4 text-ice-400" />
                }
              </button>
            )}
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              title="Copy link"
            >
              <Share2 className="w-4 h-4 text-ice-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4"
             style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-xs text-ice-600 font-mono">{note.downloadCount ?? 0} views</span>
          {note.fileSize && (
            <span className="text-xs text-ice-600 font-mono">{(note.fileSize / 1024 / 1024).toFixed(1)} MB</span>
          )}
          <span className="text-xs text-ice-600 font-mono">
            {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </motion.div>

      {!access ? (
        <PremiumLock locked variant="page" reason="Premium subscription required to access this content">
          <div className="h-96 rounded-2xl flex items-center justify-center"
               style={{ background: '#111120' }}>
            <BookOpen className="w-16 h-16 text-ice-700" />
          </div>
        </PremiumLock>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {!viewerOpen ? (
            <div className="card text-center py-16"
                 style={{ border: '1px solid rgba(245,166,35,0.12)' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                   style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
                <BookOpen className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="font-display font-600 text-ice-100 mb-2">Ready to view</h3>
              <p className="text-sm text-ice-400 mb-6">
                This document is protected by EduVault's secure viewer. No download or printing available.
              </p>
              <button
                onClick={() => fetchSignedUrl()}
                disabled={fetchingUrl}
                className="btn-primary"
              >
                {fetchingUrl ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Loading Secure Viewer…</>
                ) : (
                  <><BookOpen className="w-4 h-4" />Open Secure Viewer</>
                )}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <SecurePDFViewer
                signedUrl={signedUrl}
                fileName={note.title}
                onError={() => setViewerOpen(false)}
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}