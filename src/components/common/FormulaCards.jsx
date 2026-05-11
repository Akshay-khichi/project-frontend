/**
 * FormulaCards.jsx
 *
 * Drop-in section component for the EduVault dashboard or any page.
 *
 * IMPORTS NEEDED in your project:
 *   npm install  ← already installed if you set up EduVault frontend
 *
 * Uses:
 *   - react                    (already in project)
 *   - framer-motion            (already in project)
 *   - lucide-react             (already in project)
 *   - tailwindcss              (already in project — custom tokens apply)
 *
 * Usage:
 *   import FormulaCards from '@/components/common/FormulaCards'
 *   <FormulaCards />
 *
 * To wire up real data later:
 *   Replace FORMULA_DATA with a useQuery() call to your API endpoint,
 *   e.g.  GET /api/v1/formula-cards  →  { subjects: [...] }
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const FORMULA_DATA = [
  {
    id: 'physics',
    label: 'Physics',
    icon: '⚙️',
    totalCards: 857,
    accentColor: '#E07B3A',          // tab + section icon ring
    chapters: [
      { id: 'c1', title: 'Current Electricity',  formulaCount: 39, cardColor: '#2563EB', symbol: '⚡' },
      { id: 'c2', title: 'Semiconductors',        formulaCount: 51, cardColor: '#16A34A', symbol: '💡' },
      { id: 'c3', title: 'Alternating Current',   formulaCount: 11, cardColor: '#DC2626', symbol: '〜' },
      { id: 'c4', title: 'Rotational Motion',     formulaCount: 33, cardColor: '#7C3AED', symbol: '↺' },
      { id: 'c5', title: 'Oscillations',          formulaCount: 33, cardColor: '#1D4ED8', symbol: '〰' },
    ],
  },
  {
    id: 'chemistry',
    label: 'Chemistry',
    icon: '🧪',
    totalCards: 910,
    accentColor: '#16A34A',
    chapters: [
      { id: 'c6',  title: 'General Organic Chemistry',          formulaCount: 40, cardColor: '#D97706', symbol: '⬡' },
      { id: 'c7',  title: 'Some Basic Concepts of Chemistry',   formulaCount: 12, cardColor: '#B45309', symbol: '⚗' },
      { id: 'c8',  title: 'Structure of Atom',                  formulaCount: 34, cardColor: '#0F766E', symbol: '⊙' },
      { id: 'c9',  title: 'Amines',                             formulaCount: 42, cardColor: '#C2410C', symbol: 'N' },
      { id: 'c10', title: 'Hydrocarbons',                       formulaCount: 74, cardColor: '#15803D', symbol: '○' },
    ],
  },
  {
    id: 'mathematics',
    label: 'Mathematics',
    icon: '➕',
    totalCards: 383,
    accentColor: '#2563EB',
    chapters: [
      { id: 'c11', title: 'Quadratic Equation',       formulaCount: 21, cardColor: '#15803D', symbol: '√' },
      { id: 'c12', title: 'Complex Number',           formulaCount: 53, cardColor: '#1D4ED8', symbol: 'ℂ' },
      { id: 'c13', title: 'Permutation Combination',  formulaCount: 21, cardColor: '#6D28D9', symbol: 'P' },
      { id: 'c14', title: 'Sequences and Series',     formulaCount: 19, cardColor: '#C2410C', symbol: '∑' },
      { id: 'c15', title: 'Binomial Theorem',         formulaCount: 15, cardColor: '#0369A1', symbol: 'ⁿ' },
    ],
  },
  {
    id: 'biology',
    label: 'Biology',
    icon: '🌿',
    totalCards: 542,
    accentColor: '#0F766E',
    chapters: [
      { id: 'c16', title: 'Cell Biology',       formulaCount: 28, cardColor: '#0F766E', symbol: '⬡' },
      { id: 'c17', title: 'Genetics',           formulaCount: 45, cardColor: '#15803D', symbol: '🧬' },
      { id: 'c18', title: 'Photosynthesis',     formulaCount: 19, cardColor: '#0D9488', symbol: '🌿' },
      { id: 'c19', title: 'Evolution',          formulaCount: 37, cardColor: '#16A34A', symbol: '🌱' },
      { id: 'c20', title: 'Human Physiology',   formulaCount: 52, cardColor: '#0F766E', symbol: '♡' },
    ],
  },
]

// ─── Small chapter card (widget scroll row) ──────────────────────────────────


function ChapterCard({ chapter, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative flex-shrink-0 w-[120px] h-[146px] rounded-2xl px-3 py-3 cursor-pointer overflow-hidden flex flex-col justify-between select-none border border-white/10"
      style={{
        background: chapter.cardColor,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)'
      }}
    >
      {/* Ghost symbol */}
      <span
        className="absolute -bottom-2 -right-2 text-5xl leading-none pointer-events-none"
        style={{
          opacity: 0.12,
          filter: 'blur(1px)'
        }}
        aria-hidden="true"
      >
        {chapter.symbol}
      </span>

      {/* Title */}
      <p className="text-white font-display font-700 text-[13px] leading-[1.15] tracking-tight z-10 relative">
        {chapter.title}
      </p>

      {/* Footer */}
       <div className="flex justify-end z-10 relative mt-auto">

        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] shadow-lg"
          style={{
            background: 'rgba(255,255,255,0.92)',
            color: chapter.cardColor
          }}
          aria-hidden="true"
        >
          {chapter.symbol?.[0] ?? '→'}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Larger chapter card (full view grid) ────────────────────────────────────

function ChapterCardFull({ chapter }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="relative rounded-xl p-3 cursor-pointer overflow-hidden flex flex-col justify-between select-none"
      style={{ background: chapter.cardColor, minHeight: 120 }}
    >
      {/* Ghost */}
      <span
        className="absolute -bottom-3 -right-3 text-6xl leading-none pointer-events-none"
        style={{ opacity: 0.15 }}
        aria-hidden="true"
      >
        {chapter.symbol}
      </span>

      <p className="text-white font-display font-600 text-xs leading-snug z-10 relative line-clamp-3">
        {chapter.title}
      </p>

      <div className="flex items-center justify-between z-10 relative mt-2">
        {/* <span className="text-white/80 text-[10px] font-mono flex items-center gap-1">
          <span style={{ fontSize: 11 }}>≡</span> {chapter.formulaCount}
        </span> */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
          style={{ background: 'rgba(255,255,255,0.25)' }}
          aria-hidden="true"
        >
          {chapter.symbol?.[0] ?? '→'}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Widget View (compact) ───────────────────────────────────────────────────

function WidgetView({ activeId, setActiveId, onViewAll }) {
  const subject = FORMULA_DATA.find((s) => s.id === activeId)

  return (
    <div className="rounded-2xl p-5 mx-auto max-w-[820px]" style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
    
        <h2 className="font-display font-700 text-base text-ice-100">Formula Cards</h2>
        <span
          className="text-[9px] font-mono font-700 px-1.5 py-0.5 rounded tracking-widest"
          style={{ background: '#DC2626', color: '#fff' }}
        >
          NEW
        </span>
      </div>

      {/* Subject Tabs */}
      <div className="flex  gap-2 flex-wrap mb-4">
        {FORMULA_DATA.map((subj) => {
          const active = subj.id === activeId
          return (
            <button
              key={subj.id}
              onClick={() => setActiveId(subj.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-500 transition-all duration-200"
              style={{
                background: active ? `${subj.accentColor}22` : 'transparent',
                color: active ? '#fff' : '#9aa5b4',
                border: `1px solid ${active ? subj.accentColor + '44' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: active ? subj.accentColor : '#555' }}
              />
              {subj.label}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Row header */}
      <div className="flex justify-end mb-4">
  <button
    onClick={onViewAll}
    className="text-[11px] font-mono font-600 transition-colors text-semibold text-blue-700"
    style={{ color: '#4a90d9' }}
  >
    VIEW ALL
  </button>
</div>

      {/* Horizontal scroll cards */}
      <div className="flex  gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {subject.chapters.map((ch) => (
          <ChapterCard key={ch.id} chapter={ch} onClick={onViewAll} />
        ))}
      </div>
    </div>
  )
}

// ─── Full View (expanded) ────────────────────────────────────────────────────

function FullView({ onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl p-5  max-w-[900px] mx-auto"
      style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#9aa5b4' }}
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
         
          <h2 className="font-display font-700 text-lg text-ice-100">Formula Cards</h2>
        </div>
      </div>

      {/* All subjects */}
      <div className="space-y-6">
        {FORMULA_DATA.map((subj) => (
          <div key={subj.id}>
            {/* Section header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: `${subj.accentColor}18`, border: `1px solid ${subj.accentColor}30` }}
                  aria-hidden="true"
                >
                  {subj.icon}
                </div>
                <span className="font-display font-700 text-base text-ice-100">{subj.label}</span>
              </div>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-blue-400/10"
                style={{ border: '1px solid rgba(74,144,217,0.4)', color: '#4a90d9' }}
                aria-label={`View all ${subj.label}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* <p className="text-[11px] text-ice-600 font-mono mb-2 ml-10">
              {subj.totalCards.toLocaleString()} Formula Cards
            </p> */}

            {/* Divider */}
            <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />

            <p className="text-[11px] text-ice-500 mb-2.5">Recent chapters</p>

            {/* Grid */}
          <div className="flex gap-2.5 flex-wrap">
              {subj.chapters.map((ch) => (
               <ChapterCard key={ch.id} chapter={ch} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * FormulaCards
 * Self-contained section — manages its own widget/full toggle state.
 * Drop anywhere: Dashboard, sidebar widget, standalone page section.
 */
export default function FormulaCards() {
  const [view,     setView]     = useState('widget')   // 'widget' | 'full'
  const [activeId, setActiveId] = useState('physics')

  return (
    <AnimatePresence mode="wait">
      {view === 'widget' ? (
        <motion.div
          key="widget"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <WidgetView
            activeId={activeId}
            setActiveId={setActiveId}
            onViewAll={() => setView('full')}
          />
        </motion.div>
      ) : (
        <motion.div
          key="full"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <FullView onBack={() => setView('widget')} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}