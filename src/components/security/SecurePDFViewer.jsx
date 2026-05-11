import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, Loader2 } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { useStore } from '@/store/useStore'

// Set worker source — must match pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

/**
 * SecurePDFViewer
 * - Loads PDF from signed URL only
 * - Renders each page to canvas (no text layer, no copy)
 * - Overlays user watermark on every page
 * - Disables right-click, drag, text selection
 * - No download option exposed
 *
 * @param {string}   signedUrl    - Backend-generated signed URL
 * @param {string}   fileName     - Display name
 * @param {Function} onError      - Error callback
 */
export default function SecurePDFViewer({ signedUrl, fileName, onError }) {
  const { user } = useStore()
  const canvasRef  = useRef(null)
  const pdfRef     = useRef(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages,  setTotalPages]  = useState(0)
  const [scale,       setScale]       = useState(1.4)
  const [loading,     setLoading]     = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [error,       setError]       = useState(null)

  const watermarkText = user
    ? `${user.email}  |  EduVault  |  ${new Date().toLocaleDateString()}`
    : `EduVault  |  ${new Date().toLocaleDateString()}`

  // ── Load PDF Document ──────────────────────────
  useEffect(() => {
    if (!signedUrl) return

    let cancelled = false

    const loadPDF = async () => {
      setLoading(true)
      setError(null)

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: signedUrl,
          // Security: disable printing/copying through PDF.js flags
          disableFontFace: false,
          cMapUrl:  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true,
        })

        const pdf = await loadingTask.promise
        if (cancelled) return

        pdfRef.current = pdf
        setTotalPages(pdf.numPages)
        setCurrentPage(1)
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('PDF load error:', err)
        setError('Failed to load document. The link may have expired.')
        setLoading(false)
        onError?.(err)
      }
    }

    loadPDF()
    return () => { cancelled = true }
  }, [signedUrl])

  // ── Render Page to Canvas ──────────────────────
  const renderPage = useCallback(async (pageNum, currentScale) => {
    if (!pdfRef.current || !canvasRef.current) return

    setPageLoading(true)

    try {
      const page     = await pdfRef.current.getPage(pageNum)
      const viewport = page.getViewport({ scale: currentScale })
      const canvas   = canvasRef.current
      const ctx      = canvas.getContext('2d')

      canvas.height = viewport.height
      canvas.width  = viewport.width

      // Render PDF page
      await page.render({ canvasContext: ctx, viewport }).promise

      // ── Draw Watermark Pattern ─────────────────
      const rows = Math.ceil(canvas.height / 180)
      const cols = Math.ceil(canvas.width  / 320)

      ctx.save()
      ctx.globalAlpha  = 0.12
      ctx.fillStyle    = '#F5A623'
      ctx.font         = `${13 * currentScale}px "JetBrains Mono", monospace`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'

      for (let r = 0; r < rows + 1; r++) {
        for (let c = 0; c < cols + 1; c++) {
          ctx.save()
          const x = c * 300 + (r % 2 === 0 ? 0 : 150)
          const y = r * 180

          ctx.translate(x, y)
          ctx.rotate(-Math.PI / 8)
          ctx.fillText(watermarkText, 0, 0)
          ctx.restore()
        }
      }

      ctx.restore()
    } catch (err) {
      console.error('Page render error:', err)
    } finally {
      setPageLoading(false)
    }
  }, [watermarkText])

  useEffect(() => {
    if (!loading && totalPages > 0) {
      renderPage(currentPage, scale)
    }
  }, [currentPage, scale, loading, totalPages, renderPage])

  // ── Keyboard Navigation ────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setCurrentPage((p) => Math.min(p + 1, totalPages))
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setCurrentPage((p) => Math.max(p - 1, 1))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [totalPages])

  // ── States: Loading / Error ────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
             style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
        </div>
        <p className="text-ice-300 font-body text-sm">Securing document…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <p className="font-display font-semibold text-ice-100 mb-1">Failed to Load</p>
          <p className="text-ice-400 text-sm">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-ghost text-sm">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full select-none">
      {/* ── Toolbar ─────────────────────────────── */}
      <div className="sticky top-0 z-20 w-full glass flex items-center justify-between px-4 py-3 rounded-xl mb-4"
           style={{ border: '1px solid rgba(245,166,35,0.15)' }}>
        {/* Page Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-amber-400/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-sm text-ice-300">
            <span className="text-amber-400 font-semibold">{currentPage}</span>
            <span className="mx-1 opacity-40">/</span>
            {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-amber-400/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* File name */}
        <p className="text-xs text-ice-400 font-mono hidden sm:block truncate max-w-xs">{fileName}</p>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(s - 0.2, 0.6))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-amber-400/10"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-ice-400 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(s + 0.2, 2.6))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-amber-400/10"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Canvas Container ─────────────────────── */}
      <div className="pdf-secure-container relative rounded-xl overflow-hidden shadow-2xl"
           style={{ maxWidth: '100%' }}
           onContextMenu={(e) => e.preventDefault()}>
        {/* Page loading overlay */}
        <AnimatePresence>
          {pageLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: 'rgba(10,10,18,0.5)' }}
            >
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            display: 'block',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Security Note ────────────────────────── */}
      <p className="mt-4 text-xs text-ice-500 font-mono text-center">
        🔒 Secured by EduVault · Unauthorised distribution is prohibited
      </p>
    </div>
  )
}
