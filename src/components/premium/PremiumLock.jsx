import { motion } from 'framer-motion'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * PremiumLock
 * Wraps children with a blur overlay when locked.
 * Displays upgrade CTA on top.
 *
 * @param {boolean}    locked      - Whether content is locked
 * @param {ReactNode}  children    - Content to protect
 * @param {string}     variant     - 'card' | 'page' | 'inline'
 * @param {string}     reason      - Custom lock reason message
 */
export default function PremiumLock({
  locked = true,
  children,
  variant = 'card',
  reason,
}) {
  if (!locked) return children

  if (variant === 'page') {
    return (
      <div className="relative w-full min-h-[400px] flex flex-col items-center justify-center">
        {/* Blurred Background */}
        <div className="absolute inset-0 blur-premium pointer-events-none select-none overflow-hidden rounded-2xl">
          {children}
        </div>

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center px-8 py-12 rounded-3xl max-w-md mx-auto"
          style={{
            background: 'rgba(10,10,18,0.92)',
            border: '1px solid rgba(245,166,35,0.25)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <LockContent reason={reason} showDescription />
        </motion.div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(245,166,35,0.15)' }}>
        <div className="blur-premium select-none pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center"
             style={{ background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(8px)' }}>
          <LockContent reason={reason} compact />
        </div>
      </div>
    )
  }

  // Default: card variant
  return (
    <div className="relative rounded-2xl overflow-hidden group">
      {/* Blurred card content */}
      <div className="blur-premium select-none pointer-events-none">{children}</div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,18,0.6) 0%, rgba(10,10,18,0.92) 100%)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <LockContent reason={reason} compact />
      </motion.div>
    </div>
  )
}

function LockContent({ reason, compact = false, showDescription = false }) {
  return (
    <>
      {/* Icon */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`rounded-2xl flex items-center justify-center mx-auto ${compact ? 'w-11 h-11 mb-2' : 'w-16 h-16 mb-4'}`}
        style={{
          background: 'linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,166,35,0.05))',
          border: '1px solid rgba(245,166,35,0.3)',
        }}
      >
        <Lock className={`text-amber-400 ${compact ? 'w-5 h-5' : 'w-7 h-7'}`} />
      </motion.div>

      {/* Badge */}
      <span className="badge-premium">
        <Sparkles className="w-3 h-3" />
        Premium Content
      </span>

      {/* Title */}
      <p className={`font-display font-bold text-ice-100 ${compact ? 'text-sm mt-1' : 'text-lg mt-2'}`}>
        {reason || 'Unlock Premium Access'}
      </p>

      {/* Description */}
      {showDescription && (
        <p className="text-ice-400 text-sm leading-relaxed max-w-xs mt-1">
          Subscribe to EduVault Premium to access all notes, PYQs, and exclusive study material.
        </p>
      )}

      {/* CTA */}
      <Link
        to="/premium"
        className="btn-primary mt-2 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        Upgrade Now
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </>
  )
}
