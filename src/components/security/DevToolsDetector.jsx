import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { useDevToolsDetection } from '@/hooks/useSecurityGuards'

export default function DevToolsDetector() {
  const [detected, setDetected] = useState(false)

  const handleDetected = useCallback((isOpen) => {
    setDetected(isOpen)
  }, [])

  useDevToolsDetection(handleDetected)

  return (
    <AnimatePresence>
      {detected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="devtools-warning"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="text-center px-8 max-w-md"
          >
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                 style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)' }}>
              <ShieldAlert className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ice-100 mb-3">
              Developer Tools Detected
            </h2>
            <p className="text-ice-400 text-sm leading-relaxed">
              EduVault content is protected. Please close your browser developer tools to continue.
            </p>
            <div className="mt-6 px-4 py-2 rounded-lg inline-block"
                 style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.1)' }}>
              <p className="text-amber-400/60 text-xs font-mono">
                Content will resume when DevTools is closed
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
