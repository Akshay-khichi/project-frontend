import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Search, FileText, X, ChevronRight, Download, 
  ExternalLink, Calculator, Atom, FlaskConical, 
  BookOpen, Zap, Lock
} from 'lucide-react'
import { useStore } from '@/store/useStore'

// Homepage Subjects - Sky Blue Theme
const SUBJECTS = [
  { id: 'physics', name: 'Physics', icon: Atom, color: 'from-sky-500 to-blue-600', papers: 45, topics: 180 },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, color: 'from-sky-500 to-blue-600', papers: 42, topics: 165 },
  { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'from-sky-500 to-blue-600', papers: 48, topics: 195 }
]

// Physics PYQs (Year-wise)
const PHYSICS_PYQS = [
  { id: 'phy-2024', name: '2024 PYQs', year: 2024, papers: 12, icon: FileText, premium: true },
  { id: 'phy-2023', name: '2023 PYQs', year: 2023, papers: 15, icon: FileText, premium: true },
  { id: 'phy-2022', name: '2022 PYQs', year: 2022, papers: 10, icon: FileText, premium: true },
  { id: 'phy-2021', name: '2021 PYQs', year: 2021, papers: 8, icon: FileText, premium: true },
  { id: 'phy-2020', name: '2020 PYQs', year: 2020, papers: 6, icon: FileText, premium: true },
  { id: 'phy-2019', name: '2019 PYQs', year: 2019, papers: 8, icon: FileText, premium: true },
  { id: 'phy-adv-2024', name: '2024 Advanced PYQs', year: 2024, papers: 6, icon: FileText, premium: true },
  { id: 'phy-adv-2023', name: '2023 Advanced PYQs', year: 2023, papers: 6, icon: FileText, premium: true },
  { id: 'phy-board', name: 'Board Exam PYQs (2020-2024)', year: 2024, papers: 10, icon: FileText, premium: true }
]

// Chemistry PYQs (Year-wise)
const CHEMISTRY_PYQS = [
  { id: 'chem-2024', name: '2024 PYQs', year: 2024, papers: 12, icon: FileText, premium: true },
  { id: 'chem-2023', name: '2023 PYQs', year: 2023, papers: 15, icon: FileText, premium: true },
  { id: 'chem-2022', name: '2022 PYQs', year: 2022, papers: 10, icon: FileText, premium: true },
  { id: 'chem-2021', name: '2021 PYQs', year: 2021, papers: 8, icon: FileText, premium: true },
  { id: 'chem-2020', name: '2020 PYQs', year: 2020, papers: 6, icon: FileText, premium: true },
  { id: 'chem-2019', name: '2019 PYQs', year: 2019, papers: 8, icon: FileText, premium: true },
  { id: 'chem-adv-2024', name: '2024 Advanced PYQs', year: 2024, papers: 6, icon: FileText, premium: true },
  { id: 'chem-adv-2023', name: '2023 Advanced PYQs', year: 2023, papers: 6, icon: FileText, premium: true },
  { id: 'chem-board', name: 'Board Exam PYQs (2020-2024)', year: 2024, papers: 10, icon: FileText, premium: true }
]

// Mathematics PYQs (Year-wise)
const MATHEMATICS_PYQS = [
  { id: 'math-2024', name: '2024 PYQs', year: 2024, papers: 12, icon: FileText, premium: true },
  { id: 'math-2023', name: '2023 PYQs', year: 2023, papers: 15, icon: FileText, premium: true },
  { id: 'math-2022', name: '2022 PYQs', year: 2022, papers: 10, icon: FileText, premium: true },
  { id: 'math-2021', name: '2021 PYQs', year: 2021, papers: 8, icon: FileText, premium: true },
  { id: 'math-2020', name: '2020 PYQs', year: 2020, papers: 6, icon: FileText, premium: true },
  { id: 'math-2019', name: '2019 PYQs', year: 2019, papers: 8, icon: FileText, premium: true },
  { id: 'math-adv-2024', name: '2024 Advanced PYQs', year: 2024, papers: 6, icon: FileText, premium: true },
  { id: 'math-adv-2023', name: '2023 Advanced PYQs', year: 2023, papers: 6, icon: FileText, premium: true },
  { id: 'math-board', name: 'Board Exam PYQs (2020-2024)', year: 2024, papers: 10, icon: FileText, premium: true }
]

const PYQS_DATA = {
  physics: PHYSICS_PYQS,
  chemistry: CHEMISTRY_PYQS,
  mathematics: MATHEMATICS_PYQS
}

// PDF Viewer Modal
const PDFViewer = ({ pyq, subject, onClose }) => {
  const [loading, setLoading] = useState(true)
  const pdfUrl = `https://res.cloudinary.com/your-cloud-name/image/upload/v1/pyqs/${subject}/${pyq.id}.pdf`

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
            <span className="text-gray-200 font-semibold">{pyq.name}</span>
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
          <iframe src={pdfUrl} className="w-full h-full" onLoad={() => setLoading(false)} title={pyq.name} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// PYQ Card Component
const PYQCard = ({ pyq, hasAccess, onClick, subject }) => {
  const IconComponent = pyq.icon
  const isPremium = true // ALL papers are premium

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => (!isPremium || hasAccess(3)) && onClick(pyq)}
      className={`card p-5 cursor-pointer group relative overflow-hidden bg-gray-800/50 border border-gray-700 rounded-xl hover:border-sky-500/50 transition-all ${isPremium && !hasAccess(3) ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/20 group-hover:border-sky-500/40 transition-colors">
          <IconComponent className="w-5 h-5 text-sky-400" />
        </div>
        {isPremium && (
          <span className="badge-premium text-[10px] bg-sky-500/10 border border-sky-500/20 text-white px-2 py-1 rounded-lg flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />Premium
          </span>
        )}
      </div>
      <h3 className="font-display font-600 text-ice-100 text-sm mb-2 line-clamp-2 group-hover:text-sky-400 transition-colors">
        {pyq.name}
      </h3>
      <p className="text-xs text-ice-500">{pyq.papers} {pyq.papers === 1 ? 'Paper' : 'Papers'} • {pyq.year}</p>
      {isPremium && !hasAccess(3) && (
        <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-[1px] flex items-center justify-center">
          <Lock className="w-6 h-6 text-sky-400" />
        </div>
      )}
    </motion.div>
  )
}

// Subject Page Component (PYQ Grid)
const SubjectPage = () => {
  const navigate = useNavigate()
  const { subject } = useParams()
  const { hasAccess } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPYQ, setSelectedPYQ] = useState(null)
  const [pyqs, setPyqs] = useState([])

  useEffect(() => {
    const subjectPyqs = PYQS_DATA[subject] || []
    setPyqs(subjectPyqs)
  }, [subject])

  const filteredPyqs = pyqs.filter(pyq => 
    pyq.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPapers = pyqs.reduce((acc, p) => acc + p.papers, 0)
  const subjectNames = { physics: 'Physics', chemistry: 'Chemistry', mathematics: 'Mathematics' }

  return (
    <div className="min-h-screen bg-ink-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-ink-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/pyqs')} className="w-9 h-9 rounded-xl flex items-center justify-center text-ice-500 hover:text-ice-300 hover:bg-white/5 transition-all">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <div>
                <h1 className="font-display font-700 text-ice-100 text-lg">{subjectNames[subject] || 'Loading...'}</h1>
                <p className="text-xs text-ice-500">{pyqs.length} Papers, {totalPapers} Questions</p>
              </div>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
              <input 
                type="text" 
                placeholder="Search papers..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ice-100 placeholder:text-ice-600 focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.07] transition-all text-sm" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* PYQs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {pyqs.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/5">
              <FileText className="w-8 h-8 text-ice-600" />
            </div>
            <p className="font-display font-600 text-ice-300 mb-1">No papers available</p>
            <p className="text-sm text-ice-600">Subject: {subject}</p>
          </div>
        ) : filteredPyqs.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/5">
              <Search className="w-8 h-8 text-ice-600" />
            </div>
            <p className="font-display font-600 text-ice-300 mb-1">No papers found</p>
            <p className="text-sm text-ice-600">Try adjusting your search term</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPyqs.map((pyq, index) => (
              <motion.div key={pyq.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <PYQCard pyq={pyq} hasAccess={hasAccess} onClick={setSelectedPYQ} subject={subject} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedPYQ && <PDFViewer pyq={selectedPYQ} subject={subject} onClose={() => setSelectedPYQ(null)} />}
      </AnimatePresence>
    </div>
  )
}

// Homepage Component (3 Subject Cards)
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
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">EduVault</h1>
                <p className="text-xs text-ice-500">Previous Year Questions</p>
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
              <p className="text-ice-400 text-lg max-w-2xl mx-auto">Access premium previous year question papers for exam preparation</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {SUBJECTS.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => navigate(`/pyqs/${subject.id}`)}
                  className={`group relative bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 cursor-pointer overflow-hidden transition-all duration-300 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <subject.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">{subject.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-ice-500 mb-4">
                    <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /><span>{subject.papers} Papers</span></div>
                    <div className="w-1 h-1 bg-gray-700 rounded-full" />
                    <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /><span>{subject.topics} Questions</span></div>
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
export default function PYQs() {
  const { subject } = useParams()

  // If subject exists in URL → show PYQ grid, else show homepage
  return subject ? <SubjectPage /> : <Homepage />
}