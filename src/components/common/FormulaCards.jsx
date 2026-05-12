/**
 * FormulaCards.jsx - Fixed layout: 5 cards always visible, no overflow
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const FORMULA_DATA = [
  {
    id: 'physics',
    label: 'Physics',
    icon: '⚙️',
    totalCards: 857,
    accentColor: '#E07B3A',
    chapters: [
      { id: 'c1', title: 'Current Electricity', formulaCount: 39, cardColor: '#2563EB', symbol: '⚡' },
      { id: 'c2', title: 'Semiconductors', formulaCount: 51, cardColor: '#16A34A', symbol: '💡' },
      { id: 'c3', title: 'Alternating Current', formulaCount: 11, cardColor: '#DC2626', symbol: '〜' },
      { id: 'c4', title: 'Rotational Motion', formulaCount: 33, cardColor: '#7C3AED', symbol: '↺' },
      { id: 'c5', title: 'Oscillations', formulaCount: 33, cardColor: '#1D4ED8', symbol: '〰' },
    ],
  },
  {
    id: 'chemistry',
    label: 'Chemistry',
    icon: '🧪',
    totalCards: 910,
    accentColor: '#16A34A',
    chapters: [
      { id: 'c6', title: 'General Organic Chemistry', formulaCount: 40, cardColor: '#D97706', symbol: '⬡' },
      { id: 'c7', title: 'Some Basic Concepts', formulaCount: 12, cardColor: '#B45309', symbol: '⚗' },
      { id: 'c8', title: 'Structure of Atom', formulaCount: 34, cardColor: '#0F766E', symbol: '⊙' },
      { id: 'c9', title: 'Amines', formulaCount: 42, cardColor: '#C2410C', symbol: 'N' },
      { id: 'c10', title: 'Hydrocarbons', formulaCount: 74, cardColor: '#15803D', symbol: '○' },
    ],
  },
  {
    id: 'mathematics',
    label: 'Mathematics',
    icon: '➕',
    totalCards: 383,
    accentColor: '#2563EB',
    chapters: [
      { id: 'c11', title: 'Quadratic Equation', formulaCount: 21, cardColor: '#15803D', symbol: '√' },
      { id: 'c12', title: 'Complex Number', formulaCount: 53, cardColor: '#1D4ED8', symbol: 'ℂ' },
      { id: 'c13', title: 'Permutation Combination', formulaCount: 21, cardColor: '#6D28D9', symbol: 'P' },
      { id: 'c14', title: 'Sequences and Series', formulaCount: 19, cardColor: '#C2410C', symbol: '∑' },
      { id: 'c15', title: 'Binomial Theorem', formulaCount: 15, cardColor: '#0369A1', symbol: 'ⁿ' },
    ],
  },
  {
    id: 'biology',
    label: 'Biology',
    icon: '🌿',
    totalCards: 542,
    accentColor: '#0F766E',
    chapters: [
      { id: 'c16', title: 'Cell Biology', formulaCount: 28, cardColor: '#0F766E', symbol: '⬡' },
      { id: 'c17', title: 'Genetics', formulaCount: 45, cardColor: '#15803D', symbol: '🧬' },
      { id: 'c18', title: 'Photosynthesis', formulaCount: 19, cardColor: '#0D9488', symbol: '🌿' },
      { id: 'c19', title: 'Evolution', formulaCount: 37, cardColor: '#16A34A', symbol: '🌱' },
      { id: 'c20', title: 'Human Physiology', formulaCount: 52, cardColor: '#0F766E', symbol: '♡' },
    ],
  },
]

// ─── Chapter Card (Fits grid perfectly) ──────────────────────────────────────

function ChapterCard({ chapter, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full h-[240px] sm:h-[260px] rounded-2xl sm:rounded-3xl p-4 sm:p-5 cursor-pointer overflow-hidden flex flex-col justify-between select-none border border-white/10 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${chapter.cardColor} 0%, ${chapter.cardColor}dd 100%)`,
        boxShadow: `0 12px 24px ${chapter.cardColor}30, inset 0 1px 0 rgba(255,255,255,0.2)`
      }}
    >
      {/* Ghost symbol */}
      <span
        className="absolute -bottom-3 -right-3 text-6xl sm:text-7xl leading-none pointer-events-none font-bold text-white/10 blur-[2px]"
        aria-hidden="true"
      >
        {chapter.symbol}
      </span>

      {/* Header */}
      <div className="z-10 relative">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
          <span className="text-lg sm:text-xl">{chapter.symbol}</span>
        </div>
        
        <h3 className="text-white font-display font-700 text-sm sm:text-base leading-tight tracking-tight mb-1.5 line-clamp-2">
          {chapter.title}
        </h3>
        
        <p className="text-white/70 text-xs font-medium">
          {chapter.formulaCount} Formulas
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-end z-10 relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-white/90"
          style={{ color: chapter.cardColor }}
        >
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Widget View ─────────────────────────────────────────────────────────────

function WidgetView({ activeId, setActiveId, onViewAll }) {
  const subject = FORMULA_DATA.find((s) => s.id === activeId)

  return (
    <div className="rounded-3xl p-5 sm:p-8 mx-auto max-w-7xl" style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.08)' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-700 text-lg sm:text-xl text-ice-100">Formula Cards</h2>
          <span className="text-[10px] font-mono font-700 px-2 py-1 rounded-md tracking-widest uppercase bg-red-600 text-white">
            NEW
          </span>
        </div>
        
        <button
          onClick={onViewAll}
          className="text-sm font-mono font-600 transition-all hover:scale-105 text-sky-400 flex items-center gap-2"
        >
          VIEW ALL
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-5 sm:mb-6 overflow-x-auto pb-2">
        {FORMULA_DATA.map((subj) => {
          const active = subj.id === activeId
          return (
            <button
              key={subj.id}
              onClick={() => setActiveId(subj.id)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap"
              style={{
                background: active ? `${subj.accentColor}30` : 'rgba(255,255,255,0.05)',
                color: active ? '#fff' : '#9aa5b4',
                border: `2px solid ${active ? subj.accentColor : 'rgba(255,255,255,0.1)'}`,
                transform: active ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: active ? subj.accentColor : '#555' }} />
              {subj.label}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-px mb-5 sm:mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* 🎯 GRID LAYOUT: Exactly 5 cards, no overflow */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {subject.chapters.map((ch) => (
          <ChapterCard key={ch.id} chapter={ch} onClick={onViewAll} />
        ))}
      </div>
    </div>
  )
}

// ─── Full View ───────────────────────────────────────────────────────────────

function FullView({ onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-3xl p-5 sm:p-8 mx-auto max-w-7xl"
      style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 border border-white/10 text-ice-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display font-700 text-xl sm:text-2xl text-ice-100">Formula Cards</h2>
      </div>

      <div className="space-y-8 sm:space-y-10">
        {FORMULA_DATA.map((subj) => (
          <div key={subj.id}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl" style={{ background: `${subj.accentColor}20`, border: `2px solid ${subj.accentColor}40` }}>
                  {subj.icon}
                </div>
                <div>
                  <h3 className="font-display font-700 text-lg sm:text-xl text-ice-100">{subj.label}</h3>
                  <p className="text-xs text-ice-500 font-mono">{subj.totalCards} Formula Cards</p>
                </div>
              </div>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-sky-500/10 border border-sky-500/40 text-sky-400">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
              {subj.chapters.map((ch) => (
                <motion.div
                  key={ch.id}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="relative rounded-2xl p-4 sm:p-5 cursor-pointer overflow-hidden select-none border border-white/10"
                  style={{ 
                    background: `linear-gradient(135deg, ${ch.cardColor}, ${ch.cardColor}dd)`,
                    minHeight: '130px',
                    boxShadow: `0 8px 20px ${ch.cardColor}30`
                  }}
                >
                  <span className="absolute -bottom-2 -right-2 text-4xl sm:text-5xl opacity-15 text-white font-bold">{ch.symbol}</span>
                  <h4 className="text-white font-semibold text-sm sm:text-base mb-2 relative z-10 line-clamp-2">{ch.title}</h4>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-white/80 text-[10px] sm:text-xs font-mono">{ch.formulaCount} formulas</span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 flex items-center justify-center text-white text-xs">{ch.symbol}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function FormulaCards() {
  const [view, setView] = useState('widget')
  const [activeId, setActiveId] = useState('physics')

  return (
    <AnimatePresence mode="wait">
      {view === 'widget' ? (
        <motion.div key="widget" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <WidgetView activeId={activeId} setActiveId={setActiveId} onViewAll={() => setView('full')} />
        </motion.div>
      ) : (
        <motion.div key="full" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <FullView onBack={() => setView('widget')} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}