import { lazy, Suspense } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'



import {
  BookOpen, FileQuestion, Search, Download, Shield, Sparkles,
  ArrowRight, Check, Zap, Lock, Star, Home
} from 'lucide-react'

import FormulaCards from '@/components/common/FormulaCards'

const FEATURES = [
  { icon: BookOpen,     title: 'Organised Notes',     desc: 'Browse by Branch → Semester → Subject → Unit. Find exactly what you need.' },
  { icon: FileQuestion, title: 'Previous Year Papers', desc: 'Year-wise PYQs for every subject. Analyse patterns, ace your exams.' },
  { icon: Search,       title: 'Instant Search',       desc: 'Find any note or PYQ in seconds with our lightning-fast search engine.' },
  { icon: Shield,       title: 'Secure Viewing',       desc: 'Watermarked, signed-URL delivery. Your content stays protected.' },
  { icon: Zap,          title: 'Always Updated',       desc: 'Admins upload fresh content every semester. Never study from old PDFs again.' },
  { icon: Lock,         title: 'Role-Based Access',    desc: 'Unit 1 & 2 free forever. Premium unlocks all notes, PYQs, and more.' },
]

const FREE_FEATURES  = ['Unit 1 Notes', 'Unit 2 Notes', 'Basic Search', 'Account Dashboard']
const PREM_FEATURES  = ['All Units (1–8)', 'All PYQ Papers', 'Priority Access', 'Bookmark & History', 'No Ads Ever', 'Early Content Access']

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

export default function Landing() {
  return (
    <div className="min-h-screen grid-bg">

      {/* ── HERO ────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
             style={{
  background:
    'radial-gradient(ellipse at center, rgba(56,189,248,0.18) 0%, transparent 70%)'
}} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Pre-title badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{
  background: 'rgba(56,189,248,0.10)',
  border: '1px solid rgba(56,189,248,0.25)',
  boxShadow: '0 0 30px rgba(56,189,248,0.12)'
}}
          >
         <Star className="w-3 h-3 text-sky-400 fill-sky-400" />
            <span className="text-xs font-mono text-sky-400 tracking-widest uppercase">India's #1 Engineering Notes Platform</span>
          </motion.div>

          {/* Main headline */}
          {/* <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="font-display font-semibold leading-tight mb-10 pb-2"
            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
          >
            Study Smarter.<br />
            <span style={{
              background: 'linear-gradient(135deg, #38BDF8 0%, #FFD980 50%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}  >
              Score Higher.
            </span>
          </motion.h1> */}

          <motion.h1
  initial={{ opacity: 0, y: 32 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    delay: 0.2,
    duration: 0.7,
    ease: [0.4, 0, 0.2, 1]
  }}
  className="font-display font-bold leading-tight mb-10 pb-2"
  style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
>
  Study Smarter.<br />

  <span
    style={{
      background:
       'linear-gradient(135deg, #38BDF8 0%, #7DD3FC 50%, #0EA5E9 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    Score Higher.
  </span>
     </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-ice-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            EduVault gives engineering students instant access to organised notes and
            previous year questions — beautifully structured, always up to date.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/notes" className="btn-primary text-base px-8 py-4 rounded-2xl text-sm">
              Explore Free Notes
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/premium" className="btn-ghost text-base px-8 py-4 rounded-2xl text-sm">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Get Premium Access
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-8 mt-16"
          >
            {[
             
              { val: '5,000+',  label: 'Notes' },
              { val: '2,000+',  label: 'PYQs' },
              { val: '50+',     label: 'Subjects' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="font-display font-700 text-2xl text-sky-400">{val}</p>
                <p className="text-xs text-ice-500 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
              style={{ border: '1px solid rgba(56,189,248,0.3)' }}>
            <div className="w-1 h-2 rounded-full  bg-sky-400 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="section-label mb-4">Why EduVault</p>
          <h2 className="font-display font-800 text-4xl sm:text-5xl text-ice-100">
            Everything you need.<br />Nothing you don't.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <FadeUp key={title} delay={i * 0.07}>
              <div className="card h-full group cursor-default">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                    style={{
  background: 'rgba(56,189,248,0.1)',
  border: '1px solid rgba(56,189,248,0.15)'
}} >
                  <Icon className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="font-display font-600 text-ice-100 mb-2">{title}</h3>
                <p className="text-sm text-ice-400 leading-relaxed">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>


      {/* ── FORMULA CARDS ───────────────── */}
<section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
  <FadeUp>
    <div className="text-center mb-6">
  <p className="text-[24px] font-mono tracking-[0.25em] uppercase text-sky-400 mb-2">
    Try Before Premium
  </p>

  <h2 className="font-display font-800 text-3xl sm:text-4xl text-ice-100">
    Formula Cards
  </h2>
</div>
    <FormulaCards />
  </FadeUp>
</section>


      {/* ── PREMIUM ─────────────────────── */}
    

<section className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
  <FadeUp className="text-center mb-4">
    <h2 className="font-display font-800 text-4xl sm:text-5xl">
      <span style={{ color: '#38BDF8' }}>
        Unlock everything.
      </span>
    </h2>
  </FadeUp>

  <div className="flex justify-center items-center py-10 w-full">
    <FadeUp delay={0.1}>
      <div
        className="card relative overflow-hidden animate-glow rounded-3xl p-14 w-full lg:w-[1100px] "
       style={{
  border: '2px solid rgba(56,189,248,0.5)',
  background: 'rgba(56,189,248,0.03)',
}}
      >

        {/* Popular badge */}
        <div className="absolute -top-px -right-px">
          <div
            className="px-4 py-2 text-xs font-mono font-700 rounded-bl-2xl tracking-wide"
            style={{
              background:
                'linear-gradient(135deg, #38BDF8, #0EA5E9)',
              color: '#04040A',
            }}
          >
            ⭐ MOST POPULAR
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div>
            <p className="font-display font-800 text-3xl text-sky-400 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Premium
            </p>

            <p className="text-ice-400 text-lg mt-2">
              Full access, all subjects
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-5xl font-display font-900 text-ice-100">
              ₹199
            </span>

            <p className="text-base text-ice-500 mt-1">
              /month
            </p>
          </div>
        </div>

        {/* Features */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {PREM_FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-center gap-4 text-lg text-ice-100"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
               style={{
  background: 'rgba(56,189,248,0.15)',
}}
              >
                <Check className="w-4 h-4 text-sky-400" />
              </div>

              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          to="/premium"
          className="btn-primary w-full justify-center py-5 text-xl font-semibold rounded-2xl flex items-center"
        >
          Upgrade to Premium
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </FadeUp>
  </div>
</section>

{/* GAME  */}
<section className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
  <FadeUp>
    <div
      className="card relative overflow-hidden rounded-3xl p-0 leading-none"
      style={{
        border: '2px solid rgba(56,189,248,0.5)',
        background: 'rgba(56,189,248,0.03)',
      }}
    >
      <iframe
        src="/games/hop_hop_go_fixed.html"
        className="block w-full h-[630px] border-0"
        title="Hop Hop Go"
      />
    </div>
  </FadeUp>
</section>
    

   
      {/* ── FINAL CTA ───────────────────────────── */}
      <section className="py-28 -mt-24 px-4 sm:px-6 text-center">
        <FadeUp>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display font-800 text-4xl sm:text-5xl mb-6">
              Ready to ace your exams?
            </h2>
            <p className="text-ice-400 mb-10">
              Join 10,000+ students who trust EduVault for exam preparation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="btn-primary text-base px-8 py-4 rounded-2xl">
                Start for Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/notes" className="btn-ghost text-base px-8 py-4 rounded-2xl">
                Browse Notes
              </Link>
            </div>
          </div>
        </FadeUp>
    
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="border-t py-8 px-4 sm:px-6" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display font-700 text-sm">
            Edu<span style={{ color: '#38BDF8' }}>Vault</span>
          </p>
          <p className="text-ice-500 text-xs">
            © {new Date().getFullYear()} EduVault. All rights reserved.
          </p>
          <p className="text-ice-600 text-xs font-mono">
            Secured · Watermarked · Protected
          </p>
        </div>
      </footer>
    </div>
  )
}
