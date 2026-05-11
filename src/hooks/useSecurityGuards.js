import { useEffect } from 'react'

/**
 * useSecurityGuards
 * Applies site-wide anti-theft protections:
 *  - Disables right-click context menu
 *  - Blocks Ctrl+S, Ctrl+P, Ctrl+U, F12, Ctrl+Shift+I/J/C
 *  - Prevents drag-start on images and links
 */
export function useSecurityGuards() {
  useEffect(() => {
    // ── Right-click ────────────────────────────────
    const onContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    // ── Keyboard Shortcuts ──────────────────────────
    const onKeyDown = (e) => {
      const ctrl  = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const key   = e.key?.toLowerCase()

      const blocked =
        (ctrl && key === 's')                       || // Save
        (ctrl && key === 'p')                       || // Print
        (ctrl && key === 'u')                       || // View Source
        (ctrl && shift && key === 'i')              || // DevTools
        (ctrl && shift && key === 'j')              || // Console
        (ctrl && shift && key === 'c')              || // Inspector
        (ctrl && shift && key === 'k')              || // Console (Firefox)
        (ctrl && key === 'a' && isInPDFViewer(e))   || // Select All inside viewer
        e.key === 'F12'                             || // DevTools
        e.key === 'PrintScreen'                        // Screenshot hint

      if (blocked) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // ── Drag prevention ─────────────────────────────
    const onDragStart = (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'A') {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('keydown',     onKeyDown,    { capture: true })
    document.addEventListener('dragstart',   onDragStart)

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('keydown',     onKeyDown,    { capture: true })
      document.removeEventListener('dragstart',   onDragStart)
    }
  }, [])
}

function isInPDFViewer(e) {
  return e.target?.closest?.('.pdf-secure-container') != null
}

// ── DevTools Detection ───────────────────────────
export function useDevToolsDetection(onDetected) {
  useEffect(() => {
    const THRESHOLD = 160

    let detected = false

    const check = () => {
      const widthDiff  = window.outerWidth  - window.innerWidth
      const heightDiff = window.outerHeight - window.innerHeight

      const open = widthDiff > THRESHOLD || heightDiff > THRESHOLD

      if (open && !detected) {
        detected = true
        onDetected?.(true)
      } else if (!open && detected) {
        detected = false
        onDetected?.(false)
      }
    }

    // Debugger-based detection (blocks execution when devtools open)
    const devToolsChecker = () => {
      const start = performance.now()
      // eslint-disable-next-line no-debugger
      debugger // intentional — this takes long when devtools is open
      const elapsed = performance.now() - start
      if (elapsed > 100) {
        detected = true
        onDetected?.(true)
      }
    }

    const interval = setInterval(check, 1000)
    window.addEventListener('resize', check)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', check)
    }
  }, [onDetected])
}
