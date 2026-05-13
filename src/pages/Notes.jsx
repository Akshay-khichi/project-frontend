import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Search, BookOpen, X, ChevronRight, FileText, Download, 
  ExternalLink, Calculator, Atom, FlaskConical, Ruler, 
  ArrowRight, TrendingUp, Activity, Scale, RotateCcw, Orbit, 
  Zap, Waves, Eye, Layers, Terminal as TerminalIcon, Cpu, 
  Menu, Sigma, Pi, FlaskRound, Lock
} from 'lucide-react'
import { useStore } from '@/store/useStore'

// Homepage Subjects - Sky Blue Theme
const SUBJECTS = [
  { id: 'physics', name: 'Physics', icon: Atom, color: 'from-sky-500 to-blue-600', chapters: 30, topics: 150 },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, color: 'from-sky-500 to-blue-600', chapters: 31, topics: 163 },
  { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'from-sky-500 to-blue-600', chapters: 31, topics: 198 }
]

// Physics Chapters - ALL PREMIUM
const PHYSICS_CHAPTERS = [
  { id: 'math-physics', name: 'Mathematics in Physics', topics: 5, icon: Calculator, premium: true },
  { id: 'units-dimensions', name: 'Units and Dimensions', topics: 2, icon: Ruler, premium: true },
  { id: 'motion-1d', name: 'Motion in One Dimension', topics: 5, icon: ArrowRight, premium: true },
  { id: 'motion-2d', name: 'Motion in Two Dimensions', topics: 3, icon: TrendingUp, premium: true },
  { id: 'laws-motion', name: 'Laws of Motion', topics: 5, icon: Activity, premium: true },
  { id: 'work-energy', name: 'Work Power Energy', topics: 4, icon: Zap, premium: true },
  { id: 'com', name: 'Center of Mass Momentum and Collision', topics: 7, icon: Scale, premium: true },
  { id: 'rotational', name: 'Rotational Motion', topics: 5, icon: RotateCcw, premium: true },
  { id: 'gravitation', name: 'Gravitation', topics: 6, icon: Orbit, premium: true },
  { id: 'solids', name: 'Mechanical Properties of Solids', topics: 5, icon: BookOpen, premium: true },
  { id: 'fluids', name: 'Mechanical Properties of Fluids', topics: 7, icon: Waves, premium: true },
  { id: 'thermal', name: 'Thermal Properties of Matter', topics: 6, icon: Activity, premium: true },
  { id: 'thermodynamics', name: 'Thermodynamics', topics: 4, icon: Zap, premium: true },
  { id: 'kinetic', name: 'Kinetic Theory of Gases', topics: 3, icon: Atom, premium: true },
  { id: 'oscillations', name: 'Oscillations', topics: 5, icon: Waves, premium: true },
  { id: 'waves-sound', name: 'Waves and Sound', topics: 10, icon: Waves, premium: true },
  { id: 'electrostatics', name: 'Electrostatics', topics: 5, icon: Zap, premium: true },
  { id: 'capacitance', name: 'Capacitance', topics: 5, icon: Activity, premium: true },
  { id: 'current-electricity', name: 'Current Electricity', topics: 8, icon: Zap, premium: true },
  { id: 'magnetic-effects', name: 'Magnetic Effects of Current', topics: 5, icon: Activity, premium: true },
  { id: 'magnetism', name: 'Magnetic Properties of Matter', topics: 4, icon: Activity, premium: true },
  { id: 'emi', name: 'Electromagnetic Induction', topics: 5, icon: Zap, premium: true },
  { id: 'ac', name: 'Alternating Current', topics: 3, icon: Waves, premium: true },
  { id: 'ray-optics', name: 'Ray Optics', topics: 7, icon: Eye, premium: true },
  { id: 'wave-optics', name: 'Wave Optics', topics: 5, icon: Waves, premium: true },
  { id: 'atomic', name: 'Atomic Physics', topics: 4, icon: Atom, premium: true },
  { id: 'dual-nature', name: 'Dual Nature of Matter', topics: 4, icon: Atom, premium: true },
  { id: 'nuclear', name: 'Nuclear Physics', topics: 4, icon: Atom, premium: true },
  { id: 'semiconductors', name: 'Semiconductors', topics: 7, icon: Activity, premium: true },
  { id: 'communication', name: 'Communication System', topics: 2, icon: Waves, premium: true }
]

// Chemistry Chapters - ALL PREMIUM
const CHEMISTRY_CHAPTERS = [
  { id: 'basic-concepts', name: 'Some Basic Concepts of Chemistry', topics: 2, icon: FlaskConical, premium: true },
  { id: 'atom-structure', name: 'Structure of Atom', topics: 7, icon: Atom, premium: true },
  { id: 'classification', name: 'Classification of Elements and Periodicity', topics: 3, icon: Layers, premium: true },
  { id: 'chemical-bonding', name: 'Chemical Bonding and Molecular Structure', topics: 10, icon: Zap, premium: true },
  { id: 'states-matter', name: 'States of Matter', topics: 5, icon: Waves, premium: true },
  { id: 'thermodynamics-c', name: 'Thermodynamics (C)', topics: 5, icon: Activity, premium: true },
  { id: 'equilibrium', name: 'Chemical Equilibrium', topics: 2, icon: Scale, premium: true },
  { id: 'ionic-equilibrium', name: 'Ionic Equilibrium', topics: 6, icon: Zap, premium: true },
  { id: 'redox', name: 'Redox Reactions', topics: 6, icon: Activity, premium: true },
  { id: 'hydrogen', name: 'Hydrogen', topics: 4, icon: Waves, premium: true },
  { id: 's-block', name: 's Block Elements', topics: 5, icon: BookOpen, premium: true },
  { id: 'p-block-1', name: 'p Block Elements (Group 13 & 14)', topics: 4, icon: BookOpen, premium: true },
  { id: 'organic-chem', name: 'General Organic Chemistry', topics: 8, icon: FlaskConical, premium: true },
  { id: 'hydrocarbons', name: 'Hydrocarbons', topics: 10, icon: Activity, premium: true },
  { id: 'solid-state', name: 'Solid State', topics: 6, icon: BookOpen, premium: true },
  { id: 'solutions', name: 'Solutions', topics: 3, icon: Waves, premium: true },
  { id: 'electrochemistry', name: 'Electrochemistry', topics: 5, icon: Zap, premium: true },
  { id: 'kinetics', name: 'Chemical Kinetics', topics: 4, icon: Activity, premium: true },
  { id: 'surface-chem', name: 'Surface Chemistry', topics: 7, icon: FlaskConical, premium: true },
  { id: 'p-block-2', name: 'p Block Elements (Group 15, 16, 17 & 18)', topics: 6, icon: BookOpen, premium: true },
  { id: 'd-f-block', name: 'd and f Block Elements', topics: 3, icon: Atom, premium: true },
  { id: 'coordination', name: 'Coordination Compounds', topics: 7, icon: Activity, premium: true },
  { id: 'principles', name: 'General Principles and Processes of Isolation', topics: 5, icon: BookOpen, premium: true },
  { id: 'haloalkanes', name: 'Haloalkanes and Haloarenes', topics: 4, icon: FlaskConical, premium: true },
  { id: 'alcohols', name: 'Alcohols Phenols and Ethers', topics: 10, icon: FlaskConical, premium: true },
  { id: 'aldehydes', name: 'Aldehydes and Ketones', topics: 5, icon: FlaskConical, premium: true },
  { id: 'carboxylic', name: 'Carboxylic Acid Derivatives', topics: 5, icon: FlaskConical, premium: true },
  { id: 'amines', name: 'Amines', topics: 4, icon: FlaskConical, premium: true },
  { id: 'biomolecules', name: 'Biomolecules', topics: 5, icon: Atom, premium: true },
  { id: 'practical', name: 'Practical Chemistry', topics: 4, icon: FlaskConical, premium: true },
  { id: 'everyday', name: 'Chemistry in Everyday Life', topics: 3, icon: FlaskConical, premium: true }
]

// Mathematics Chapters - ALL PREMIUM
const MATHEMATICS_CHAPTERS = [
  { id: 'quadratic', name: 'Quadratic Equation', topics: 7, icon: Calculator, premium: true },
  { id: 'complex', name: 'Complex Number', topics: 7, icon: Calculator, premium: true },
  { id: 'perm-comb', name: 'Permutation Combination', topics: 9, icon: Calculator, premium: true },
  { id: 'sequences', name: 'Sequences and Series', topics: 8, icon: Calculator, premium: true },
  { id: 'binomial', name: 'Binomial Theorem', topics: 6, icon: Calculator, premium: true },
  { id: 'trig-ratios', name: 'Trigonometric Ratios & Identities', topics: 6, icon: Calculator, premium: true },
  { id: 'trig-eq', name: 'Trigonometric Equations', topics: 1, icon: Calculator, premium: true },
  { id: 'triangles', name: 'Properties of Triangles', topics: 5, icon: Calculator, premium: true },
  { id: 'straight-lines', name: 'Straight Lines', topics: 7, icon: Calculator, premium: true },
  { id: 'circle', name: 'Circle', topics: 12, icon: Calculator, premium: true },
  { id: 'parabola', name: 'Parabola', topics: 12, icon: Calculator, premium: true },
  { id: 'ellipse', name: 'Ellipse', topics: 13, icon: Calculator, premium: true },
  { id: 'hyperbola', name: 'Hyperbola', topics: 14, icon: Calculator, premium: true },
  { id: 'limits', name: 'Limits', topics: 6, icon: Calculator, premium: true },
  { id: 'matrices', name: 'Matrices', topics: 8, icon: Calculator, premium: true },
  { id: 'determinants', name: 'Determinants', topics: 4, icon: Calculator, premium: true },
  { id: 'inverse-trig', name: 'Inverse Trigonometric Functions', topics: 7, icon: Calculator, premium: true },
  { id: 'functions', name: 'Functions', topics: 12, icon: Calculator, premium: true },
  { id: 'continuity', name: 'Continuity and Differentiability', topics: 2, icon: Calculator, premium: true },
  { id: 'differentiation', name: 'Differentiation', topics: 6, icon: Calculator, premium: true },
  { id: 'app-derivatives', name: 'Application of Derivatives', topics: 4, icon: Calculator, premium: true },
  { id: 'indefinite-int', name: 'Indefinite Integration', topics: 5, icon: Calculator, premium: true },
  { id: 'definite-int', name: 'Definite Integration', topics: 6, icon: Calculator, premium: true },
  { id: 'area-curves', name: 'Area Under Curves', topics: 3, icon: Calculator, premium: true },
  { id: 'differential-eq', name: 'Differential Equations', topics: 8, icon: Calculator, premium: true },
  { id: 'vectors', name: 'Vector Algebra', topics: 4, icon: Calculator, premium: true },
  { id: '3d-geo', name: 'Three Dimensional Geometry', topics: 4, icon: Calculator, premium: true },
  { id: 'probability', name: 'Probability', topics: 6, icon: Calculator, premium: true },
  { id: 'math-reasoning', name: 'Mathematical Reasoning', topics: 1, icon: Calculator, premium: true },
  { id: 'statistics', name: 'Statistics', topics: 4, icon: Calculator, premium: true },
  { id: 'linear-prog', name: 'Linear Programming', topics: 1, icon: Calculator, premium: true }
]

const CHAPTERS_DATA = {
  physics: PHYSICS_CHAPTERS,
  chemistry: CHEMISTRY_CHAPTERS,
  mathematics: MATHEMATICS_CHAPTERS
}

// PDF Viewer Modal - Sky Blue Theme
const PDFViewer = ({ chapter, subject, onClose }) => {
  const [loading, setLoading] = useState(true)
  const pdfUrl = `https://res.cloudinary.com/your-cloud-name/image/upload/v1/${subject}/${chapter.id}.pdf`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-6xl h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-sky-400" />
            <span className="text-gray-200 font-semibold">{chapter.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm flex items-center gap-2 transition-all">
              <ExternalLink className="w-4 h-4" /> Open
            </a>
            <a href={pdfUrl} download className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" /> Download
            </a>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-2">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="flex-1 relative bg-gray-950">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-2 border-sky-500/20 border-t-sky-400 rounded-full" />
            </div>
          )}
          <iframe src={pdfUrl} className="w-full h-full" onLoad={() => setLoading(false)} title={chapter.name} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Chapter Card Component - ALL PREMIUM + Sky Blue
const ChapterCard = ({ chapter, hasAccess, onClick, subject }) => {
  const IconComponent = chapter.icon
  const isPremium = true // ALL chapters are premium

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => (!isPremium || hasAccess()) && onClick(chapter)}
      className={`card p-5 cursor-pointer group relative  overflow-hidden bg-gray-800/50 border border-gray-700 rounded-xl hover:border-sky-500/50 transition-all ${isPremium && !hasAccess(3) ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/20 group-hover:border-sky-500/40 transition-colors">
          <IconComponent className="w-5 h-5 text-sky-400" />
        </div>
        {isPremium && (
          <span className="badge-premium text-[12px] bg-sky-500/10 border border-sky-500/20 text-white text-semibold px-2 py-1 rounded-lg flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />Premium
          </span>
        )}
      </div>
      <h3 className="font-display font-600 text-ice-100 text-sm mb-2 line-clamp-2 group-hover:text-sky-400 transition-colors">
        {chapter.name}
      </h3>
      <p className="text-xs text-ice-500">{chapter.topics} {chapter.topics === 1 ? 'Topic' : 'Topics'}</p>
      {isPremium && !hasAccess() && (
        <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-[1px] flex items-center justify-center">
          <Lock className="w-6 h-6 text-sky-400" />
        </div>
      )}
    </motion.div>
  )
}

// Subject Page Component (Chapter Grid) - Sky Blue Theme
const SubjectPage = () => {
  const navigate = useNavigate()
  const { subject } = useParams()
  const { hasAccess } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    const subjectChapters = CHAPTERS_DATA[subject] || []
    setChapters(subjectChapters)
  }, [subject])

  const filteredChapters = chapters.filter(chapter => 
    chapter.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalTopics = chapters.reduce((acc, c) => acc + c.topics, 0)
  const subjectNames = { physics: 'Physics', chemistry: 'Chemistry', mathematics: 'Mathematics' }

  return (
    <div className="min-h-screen bg-ink-900">
      {/* Header - Sky Blue */}
      <div className="sticky top-0 z-40 bg-ink-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/notes')} className="w-9 h-9 rounded-xl flex items-center justify-center text-ice-500 hover:text-ice-300 hover:bg-white/5 transition-all">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <div>
                <h1 className="font-display font-700 text-ice-100 text-lg">{subjectNames[subject] || 'Loading...'}</h1>
                <p className="text-xs text-ice-500">{chapters.length} Chapters, {totalTopics} Topics</p>
              </div>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
              <input 
                type="text" 
                placeholder="Search chapters..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ice-100 placeholder:text-ice-600 focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.07] transition-all text-sm" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {chapters.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/5">
              <BookOpen className="w-8 h-8 text-ice-600" />
            </div>
            <p className="font-display font-600 text-ice-300 mb-1">No chapters available</p>
            <p className="text-sm text-ice-600">Subject: {subject}</p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/5">
              <Search className="w-8 h-8 text-ice-600" />
            </div>
            <p className="font-display font-600 text-ice-300 mb-1">No chapters found</p>
            <p className="text-sm text-ice-600">Try adjusting your search term</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredChapters.map((chapter, index) => (
              <motion.div key={chapter.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <ChapterCard chapter={chapter} hasAccess={hasAccess} onClick={setSelectedChapter} subject={subject} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedChapter && <PDFViewer chapter={selectedChapter} subject={subject} onClose={() => setSelectedChapter(null)} />}
      </AnimatePresence>
    </div>
  )
}

// Homepage Component (3 Subject Cards) - Sky Blue Theme
const Homepage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-ink-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">EduVault</h1>
                <p className="text-xs text-ice-500">Premium Study Materials</p>
              </div>
            </motion.div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                Choose Your <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 bg-clip-text text-transparent">Subject</span>
              </h2>
              <p className="text-ice-400 text-lg max-w-2xl mx-auto">Access premium study materials, notes and resources for  exams</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {SUBJECTS.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => navigate(`/notes/${subject.id}`)}
                  className={`group relative bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 cursor-pointer overflow-hidden transition-all duration-300 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <subject.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">{subject.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-ice-500 mb-4">
                    <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /><span>{subject.chapters} Chapters</span></div>
                    <div className="w-1 h-1 bg-gray-700 rounded-full" />
                    <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /><span>{subject.topics} Topics</span></div>
                  </div>
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight className="w-6 h-6 text-sky-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Main Component: Route based on URL param
export default function Notes() {
  const { subject } = useParams()

  // If subject exists in URL → show chapter grid, else show homepage
  return subject ? <SubjectPage /> : <Homepage />
}