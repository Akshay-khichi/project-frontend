import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen, FileQuestion, Search, Shield, Sparkles,
  ArrowRight, Check, Zap, Lock, Star, ChevronRight, X
} from 'lucide-react'
import FormulaCards from '@/components/common/FormulaCards'
// Import the React game component
import CyberpunkArcade from "@/games/CyberpunkArcade";

// ── Clean Game Card (Handles both Iframe & React Component) ──────────
function GameCard({ title, src, isReactComponent, onClick, ReactGame }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="card relative overflow-hidden rounded-3xl p-0 leading-none text-left w-full cursor-pointer group"
      style={{
        height: '630px',
        background: '#000',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Subtle Title Badge */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 pointer-events-auto">
        <p className="text-xs font-bold text-white uppercase tracking-wider">{title}</p>
      </div>

      {/* Render Iframe OR React Component */}
      {isReactComponent && ReactGame ? (
         <div
    className="w-full h-full overflow-hidden pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity duration-300"
    style={{
      minHeight: "630px",
      maxHeight: "630px",
    }}
  >
    <ReactGame />
  </div>
      ) : (
<iframe
  src={src}
  className="block w-full h-full border-0"
  style={{
    width: "100%",
    height: "630px",
    overflow: "hidden",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    pointerEvents: "none",
  }}
          title={title}
          loading="lazy"
          scrolling="no"
          style={{
            overflow: 'hidden',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Subtle hover hint */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
         <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
           Click to Expand
         </div>
      </div>
    </motion.button>
  )
}

// ── Fullscreen Game Modal (Handles both Iframe & React Component) ───
function GameModal({ isOpen, onClose, title, src, isReactComponent, ReactGame }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.code === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#0A0A12]/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="absolute top-6 right-6 z-10 w-11 h-11 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Game container - SAME 630px HEIGHT */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
           style={{
  width: "100%",
  height: "85vh",
  maxHeight: "800px",
  background: "#000",
}}
            onClick={(e) => e.stopPropagation()}
          >
            {isReactComponent && ReactGame ? (
              <ReactGame />
            ) : (
<iframe
  src={src}
  title={title}
  loading="lazy"
  scrolling="no"
  className="absolute inset-0 border-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
  style={{
    width: "100%",
    height: "100%",
    display: "block",
    pointerEvents: "auto",
      border: "0",
    background: 'transparent',
    overflow: "hidden",
  }}
/>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const FEATURES = [
  { icon: BookOpen, title: 'Organised Notes', desc: 'Browse by Branch → Semester → Subject → Unit.', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80' },
  { icon: FileQuestion, title: 'Previous Year Papers', desc: 'Year-wise PYQs for every subject.', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80' },
  { icon: Search, title: 'Instant Search', desc: 'Find any note or PYQ in seconds.', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80' },
  { icon: Shield, title: 'Secure Viewing', desc: 'Watermarked, signed-URL delivery.', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80' },
  { icon: Zap, title: 'Always Updated', desc: 'Admins upload fresh content every semester.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80' },
  { icon: Lock, title: 'Role-Based Access', desc: 'Unit 1 & 2 free. Premium unlocks all.', image: 'https://images.unsplash.com/photo-1555432384-4ec7ce8c79fe?w=800&q=80' },
]

const PREM_FEATURES = ['All Units ', 'All PYQ Papers', 'Priority Access', 'Bookmark & History', 'No Ads Ever', 'Early Content Access']

// ── Game Data (Mixed Types) ─────────────────────────────────────────
const GAMES = [
  { 
    id: 'hop-hop-go', 
    title: 'Hop Hop Go', 
    src: '/games/hop_hop_go_fixed.html',
    isReactComponent: false 
  },
  { 
    id: 'cyberpunk', 
    title: 'Cyberpunk Arcade', 
    isReactComponent: true,
    ReactGame: CyberpunkArcade 
  },
]

export default function Landing() {
  const [activeGame, setActiveGame] = useState(null)

  return (
    <div className="min-h-screen grid-bg">
      {/* ── HERO ──────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.18) 0%, transparent 70%)' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: 'rgba(56,189,248,0.10)', border: '1px solid rgba(56,189,248,0.25)', boxShadow: '0 0 30px rgba(56,189,248,0.12)' }}
          >
            <Star className="w-3 h-3 text-sky-400 fill-sky-400" />
            <span className="text-xs font-mono text-sky-400 tracking-widest uppercase">Nepal #1 Notes Platform</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="font-display font-bold leading-tight mb-10 pb-2"
            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
          >
            Study Smarter.<br />
            <span style={{ background: 'linear-gradient(135deg, #38BDF8 0%, #7DD3FC 50%, #0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Score Higher.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-ice-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            EduVault gives engineering students instant access to organised notes and
            previous year questions — beautifully structured, always up to date.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/notes" className="btn-primary text-base px-8 py-4 rounded-2xl text-sm">
              Explore Notes <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/premium" className="btn-ghost text-base px-8 py-4 rounded-2xl text-sm">
              <Sparkles className="w-4 h-4 text-sky-400" /> Get Premium Access
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-8 mt-16"
          >
            {[{ val: '5,000+', label: 'Notes' }, { val: '2,000+', label: 'PYQs' }, { val: '50+', label: 'Subjects' }].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="font-display font-700 text-2xl text-sky-400">{val}</p>
                <p className="text-xs text-ice-500 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5" style={{ border: '1px solid rgba(56,189,248,0.3)' }}>
            <div className="w-1 h-2 rounded-full bg-sky-400 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* ── BENTO GRID ────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="section-label mb-4">Why EduVault</p>
          <h2 className="font-display font-800 text-4xl sm:text-5xl text-ice-100">Everything you need.<br />Nothing you don't.</h2>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, image }, i) => (
            <FadeUp key={title} delay={i * 0.07}>
              <motion.div 
                className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-white/10"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundImage: `url(${image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />
                <div className="absolute top-5 left-5 w-12 h-12 rounded-2xl bg-sky-500/20 backdrop-blur-md border border-sky-500/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-sky-400" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display font-700 text-2xl text-white mb-3">{title}</h3>
                  <p className="text-ice-300 text-sm leading-relaxed mb-4 opacity-90 group-hover:opacity-100 transition-opacity">{desc}</p>
                  <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn More</span> <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="absolute top-5 right-5 w-20 h-20 bg-sky-500/10 rounded-full blur-2xl" />
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── FORMULA CARDS ───────────────── */}
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <FadeUp>
          <div className="text-center mb-6">
            <p className="text-[24px] font-mono tracking-[0.25em] uppercase text-sky-400 mb-2">Try Before Premium</p>
            <h2 className="font-display font-800 text-3xl sm:text-4xl text-ice-100">Formula Cards</h2>
          </div>
          <FormulaCards />
        </FadeUp>
      </section>

      {/* ── PREMIUM ───────────────────── */}
      <section className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <FadeUp className="text-center mb-4">
          <h2 className="font-display font-800 text-4xl sm:text-5xl"><span style={{ color: '#38BDF8' }}>Unlock everything.</span></h2>
        </FadeUp>
        <div className="flex justify-center items-center py-10 w-full">
          <FadeUp delay={0.1}>
            <div className="card relative overflow-hidden animate-glow rounded-3xl p-14 w-full lg:w-[1100px]" style={{ border: '2px solid rgba(56,189,248,0.5)', background: 'rgba(56,189,248,0.03)' }}>
              <div className="absolute -top-px -right-px">
                <div className="px-4 py-2 text-xs font-mono font-700 rounded-bl-2xl tracking-wide" style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: '#04040A' }}>⭐ MOST POPULAR</div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
                <div>
                  <p className="font-display font-800 text-3xl text-sky-400 flex items-center gap-2"><Sparkles className="w-6 h-6" /> Premium</p>
                  <p className="text-ice-400 text-lg mt-2">Full access, all subjects</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-5xl font-display font-900 text-ice-100">₹199</span>
                  <p className="text-base text-ice-500 mt-1">/month</p>
                </div>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {PREM_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-4 text-lg text-ice-100">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(56,189,248,0.15)' }}>
                      <Check className="w-4 h-4 text-sky-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/premium" className="btn-primary w-full justify-center py-5 text-xl font-semibold rounded-2xl flex items-center">
                Upgrade to Premium <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── GAMES SECTION ─────── */}
      <section className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <FadeUp className="text-center mb-8">
          <p className="section-label mb-4">Mini-Games</p>
          <h2 className="font-display font-800 text-3xl sm:text-4xl text-ice-100">Take a break. Play & learn.</h2>
        </FadeUp>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {GAMES.map((game, idx) => (
            <FadeUp key={game.id} delay={idx * 0.1}>
              <GameCard
                title={game.title}
                src={game.src}
                isReactComponent={game.isReactComponent}
                ReactGame={game.ReactGame}
                onClick={() => setActiveGame(game)}
              />
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Game Modal ─────────────── */}
      <GameModal
        isOpen={!!activeGame}
        onClose={() => setActiveGame(null)}
        title={activeGame?.title || ''}
        src={activeGame?.src || ''}
        isReactComponent={activeGame?.isReactComponent}
        ReactGame={activeGame?.ReactGame}
      />

      {/* ── FINAL CTA ───────────────────────────── */}
      <section className="py-28 -mt-24 px-4 sm:px-6 text-center">
        <FadeUp>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display font-800 text-4xl sm:text-5xl mb-6">Ready to ace your exams?</h2>
            <p className="text-ice-400 mb-10">Join students who trust EduVault for exam preparation.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/notes" className="btn-primary text-base px-8 py-4 rounded-2xl">Browse Notes</Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="border-t py-8 px-4 sm:px-6" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display font-700 text-sm">Edu<span style={{ color: '#38BDF8' }}>Vault</span></p>
          <p className="text-ice-500 text-xs">© {new Date().getFullYear()} EduVault. Built for focused learners.</p>
          <p className="text-sky-400 text-xs font-mono tracking-wider">Structured · Secure · Premium</p>
        </div>
      </footer>
    </div>
  )
}