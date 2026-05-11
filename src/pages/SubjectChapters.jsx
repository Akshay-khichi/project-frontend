import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, X, ChevronRight, FileText, Download, ExternalLink, Calculator, Atom, FlaskConical } from 'lucide-react'
import { useStore } from '@/store/useStore'

// Chapter data (from your PDF knowledge base)
const CHAPTERS_DATA = {
  physics: [
    { id: 'resistance', name: 'Resistance (R)', topics: 3, icon: Calculator },
    { id: 'ammeter', name: 'Ammeter', topics: 2, icon: FileText },
    { id: 'capacitor-charging', name: 'Charging of Capacitors', topics: 4, icon: Atom },
    { id: 'internal-resistance', name: 'Internal Resistance of Battery', topics: 3, icon: Atom },
    { id: 'cell-combinations', name: 'Series/Parallel Cell Grouping', topics: 5, icon: Atom },
    { id: 'kirchhoff-current', name: "Kirchhoff's Current Law", topics: 2, icon: Atom },
    { id: 'parallel-current', name: 'Current Distribution in Parallel', topics: 2, icon: Atom },
    { id: 'conductivity', name: 'Electrical Conductivity vs Resistivity', topics: 3, icon: Atom },
    { id: 'rc-circuit', name: 'RC Circuit', topics: 4, icon: Atom },
    { id: 'galvanometer', name: 'Moving Coil Galvanometer', topics: 3, icon: Atom },
    { id: 'emf', name: 'Electromotive Force (EMF)', topics: 2, icon: Atom },
    { id: 'short-circuit', name: 'Short Circuiting & Earthing', topics: 2, icon: Atom },
    { id: 'resistor-series', name: 'Series Combination of Resistors', topics: 3, icon: Calculator },
    { id: 'resistor-parallel', name: 'Parallel Combination of Resistors', topics: 3, icon: Calculator },
    { id: 'kirchhoff-voltage', name: "Kirchhoff's Voltage Law", topics: 3, icon: Atom },
    { id: 'current-direction', name: 'Direction of Electric Current', topics: 2, icon: Atom },
    { id: 'electric-current', name: 'Electric Current Definition', topics: 2, icon: Atom },
    { id: 'wheatstone', name: 'Wheatstone Bridge', topics: 2, icon: Calculator },
    { id: 'potentiometer', name: 'Potentiometer', topics: 3, icon: Calculator },
    { id: 'heat-dissipation', name: 'Heat Dissipated through Resistors', topics: 4, icon: Atom },
    { id: 'temp-resistivity', name: 'Temperature Coefficient of Resistivity', topics: 3, icon: Atom },
    { id: 'mobility', name: 'Mobility (μ)', topics: 2, icon: Atom },
    { id: 'max-power', name: 'Maximum Power Transfer Theorem', topics: 2, icon: Atom },
    { id: 'mixed-cells', name: 'Mixed Grouping of Cells', topics: 3, icon: Atom },
    { id: 'rms-velocity', name: 'Root Mean Square Velocity', topics: 2, icon: Atom },
    { id: 'drift-velocity', name: 'Drift Velocity (vₑ)', topics: 3, icon: Atom },
    { id: 'voltmeter', name: 'Voltmeter', topics: 2, icon: FileText },
    { id: 'capacitor-discharging', name: 'Discharging of Capacitors', topics: 3, icon: Atom },
    { id: 'current-density', name: 'Current Density (J)', topics: 3, icon: Atom },
    { id: 'ohms-law', name: "Ohm's Law", topics: 2, icon: Calculator },
  ],
  chemistry: [
    { id: 'basic-concepts', name: 'Some Basic Concepts of Chemistry', topics: 2, icon: FlaskConical },
    { id: 'atom-structure', name: 'Structure of Atom', topics: 7, icon: Atom },
    { id: 'classification', name: 'Classification of Elements', topics: 3, icon: FlaskConical },
    { id: 'chemical-bonding', name: 'Chemical Bonding', topics: 10, icon: Atom },
    // ... add remaining chemistry chapters
  ],
  mathematics: [
    { id: 'quadratic', name: 'Quadratic Equation', topics: 7, icon: Calculator },
    { id: 'complex', name: 'Complex Number', topics: 7, icon: Calculator },
    { id: 'perm-comb', name: 'Permutation Combination', topics: 9, icon: Calculator },
    // ... add remaining math chapters
  ]
}

// PDF Viewer Modal
const PDFViewer = ({ chapter, subject, onClose }) => {
  const [loading, setLoading] = useState(true)
  // Replace with your actual Cloudinary setup
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
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-200 font-semibold">{chapter.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm flex items-center gap-2 transition-all">
              <ExternalLink className="w-4 h-4" /> Open
            </a>
            <a href={pdfUrl} download className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm flex items-center gap-2 transition-all">
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
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full" />
            </div>
          )}
          <iframe src={pdfUrl} className="w-full h-full" onLoad={() => setLoading(false)} title={chapter.name} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Chapter Card Component
const ChapterCard = ({ chapter, hasAccess, onClick, subject }) => {
  const IconComponent = chapter.icon
  const isPremium = chapter.topics > 5 // Example: chapters with many topics are premium

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => (!isPremium || hasAccess(3)) && onClick(chapter)}
      className={`card p-5 cursor-pointer group relative overflow-hidden bg-gray-800/50 border border-gray-700 rounded-xl hover:border-cyan-500/50 transition-all ${isPremium && !hasAccess(3) ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20">
          <IconComponent className="w-5 h-5 text-cyan-400" />
        </div>
        {isPremium && (
          <span className="badge-premium text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-lg flex items-center gap-1">
            <BookOpen className="w-2.5 h-2.5" />Premium
          </span>
        )}
      </div>
      <h3 className="font-display font-600 text-ice-100 text-sm mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
        {chapter.name}
      </h3>
      <p className="text-xs text-ice-500">{chapter.topics} {chapter.topics === 1 ? 'Topic' : 'Topics'}</p>
    </motion.div>
  )
}

// Main Component
export default function SubjectChapters() {
  const { subject } = useParams()
  const navigate = useNavigate()
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

  const subjectNames = {
    physics: 'Physics',
    chemistry: 'Chemistry', 
    mathematics: 'Mathematics'
  }

  return (
    <div className="min-h-screen bg-ink-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-ink-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/notes')} className="w-9 h-9 rounded-xl flex items-center justify-center text-ice-500 hover:text-ice-300 hover:bg-white/5 transition-all">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <div>
                <h1 className="font-display font-700 text-ice-100 text-lg">{subjectNames[subject] || 'Loading...'}</h1>
                <p className="text-xs text-ice-500">{chapters.length} Chapters</p>
              </div>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
              <input 
                type="text" 
                placeholder="Search chapters..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ice-100 placeholder:text-ice-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all text-sm" 
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