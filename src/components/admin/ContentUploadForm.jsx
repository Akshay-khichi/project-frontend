import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Upload, X, FileText, Loader2, CheckCircle, Lock, Unlock, ChevronDown, ArrowLeft } from 'lucide-react'
import { notesAPI, pyqsAPI, categoriesAPI } from '@/api/axios'

const EXAM_TYPES  = ['mid-sem', 'end-sem', 'supplementary']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i)

/**
 * ContentUploadForm
 * Shared form for uploading Notes and PYQs.
 * @param {'note'|'pyq'} mode
 */
export default function ContentUploadForm({ mode = 'note' }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileInputRef = useRef(null)

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [branch,      setBranch]      = useState('')
  const [semester,    setSemester]    = useState('')
  const [subject,     setSubject]     = useState('')
  const [unit,        setUnit]        = useState('')
  const [isPremium,   setIsPremium]   = useState(true)
  const [unitNumber,  setUnitNumber]  = useState(1)
  const [year,        setYear]        = useState(CURRENT_YEAR)
  const [examType,    setExamType]    = useState('end-sem')
  const [file,        setFile]        = useState(null)
  const [dragOver,    setDragOver]    = useState(false)
  const [success,     setSuccess]     = useState(false)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesAPI.list().then((r) => r.data.categories),
    staleTime: 10 * 60 * 1000,
  })

  const branches  = categories?.filter((c) => c.type === 'branch')   || []
  const semesters = categories?.filter((c) => c.type === 'semester' && (!branch  || c.parent === branch)) || []
  const subjects  = categories?.filter((c) => c.type === 'subject'  && (!semester || c.parent === semester)) || []
  const units     = categories?.filter((c) => c.type === 'unit'     && (!subject  || c.parent === subject)) || []

  const { mutate: submit, isPending, error } = useMutation({
    mutationFn: (formData) => mode === 'note' ? notesAPI.create(formData) : pyqsAPI.create(formData),
    onSuccess: () => {
      setSuccess(true)
      qc.invalidateQueries({ queryKey: [mode === 'note' ? 'notes' : 'pyqs'] })
      setTimeout(() => navigate(mode === 'note' ? '/admin/notes' : '/admin/pyqs'), 1500)
    },
  })

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') { alert('Only PDF files are allowed.'); return }
    if (f.size > 50 * 1024 * 1024)    { alert('File must be under 50MB.');     return }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) { alert('Please select a PDF file.'); return }

    const fd = new FormData()
    fd.append('title',       title)
    fd.append('description', description)
    fd.append('branch',      branch)
    fd.append('semester',    semester)
    fd.append('subject',     subject)
    fd.append('file',        file)

    if (mode === 'note') {
      fd.append('unitNumber', unitNumber)
      fd.append('unit',       unit)
      // isPremium is auto-derived from unitNumber on backend, but send it too
      fd.append('isPremium',  unitNumber >= 3 ? 'true' : 'false')
    } else {
      fd.append('year',     year)
      fd.append('examType', examType)
      fd.append('isPremium', 'true') // PYQs always premium
    }

    submit(fd)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
               style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <p className="font-display font-700 text-2xl text-ice-100 mb-2">Upload Successful!</p>
          <p className="text-ice-400 text-sm">Content is now live and available to students.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ice-400 hover:text-ice-100 transition-colors mb-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <p className="section-label mb-2">Admin Panel</p>
        <h1 className="font-display font-800 text-3xl text-ice-100">
          Upload {mode === 'note' ? 'Note' : 'PYQ'}
        </h1>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-xs text-ice-400 mb-1.5 font-body">Title *</label>
          <input className="input" placeholder={mode === 'note' ? 'e.g. Data Structures Unit 3 Notes' : 'e.g. Data Structures End Sem 2023'}
            value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-ice-400 mb-1.5 font-body">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Brief description of the content…"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* Branch + Semester + Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-ice-400 mb-1.5">Branch *</label>
            <div className="relative">
              <select className="input text-sm appearance-none cursor-pointer" value={branch}
                onChange={(e) => { setBranch(e.target.value); setSemester(''); setSubject('') }} required>
                <option value="">Select Branch</option>
                {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ice-400 mb-1.5">Semester *</label>
            <div className="relative">
              <select className="input text-sm appearance-none cursor-pointer" value={semester}
                onChange={(e) => { setSemester(e.target.value); setSubject('') }} required disabled={!branch}>
                <option value="">Select Semester</option>
                {semesters.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ice-400 mb-1.5">Subject *</label>
            <div className="relative">
              <select className="input text-sm appearance-none cursor-pointer" value={subject}
                onChange={(e) => setSubject(e.target.value)} required disabled={!semester}>
                <option value="">Select Subject</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mode-specific fields */}
        {mode === 'note' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit Number */}
            <div>
              <label className="block text-xs text-ice-400 mb-1.5">Unit Number *</label>
              <div className="relative">
                <select className="input text-sm appearance-none cursor-pointer" value={unitNumber}
                  onChange={(e) => setUnitNumber(Number(e.target.value))} required>
                  {[1,2,3,4,5,6,7,8].map((n) => (
                    <option key={n} value={n}>Unit {n} {n <= 2 ? '(Free)' : '(Premium)'}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
              </div>
            </div>

            {/* Premium Toggle — auto-derived but shown for clarity */}
            <div>
              <label className="block text-xs text-ice-400 mb-1.5">Access Level</label>
              <div className="input flex items-center justify-between cursor-default">
                <span className="text-sm text-ice-300">
                  {unitNumber <= 2 ? 'Free (Unit 1 & 2)' : 'Premium (Unit 3+)'}
                </span>
                {unitNumber <= 2
                  ? <span className="badge-free text-[10px]"><Unlock className="w-2.5 h-2.5" />Free</span>
                  : <span className="badge-premium text-[10px]"><Lock className="w-2.5 h-2.5" />Premium</span>
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label className="block text-xs text-ice-400 mb-1.5">Year *</label>
              <div className="relative">
                <select className="input text-sm appearance-none cursor-pointer" value={year}
                  onChange={(e) => setYear(e.target.value)} required>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
              </div>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-xs text-ice-400 mb-1.5">Exam Type *</label>
              <div className="relative">
                <select className="input text-sm appearance-none cursor-pointer" value={examType}
                  onChange={(e) => setExamType(e.target.value)} required>
                  {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div>
          <label className="block text-xs text-ice-400 mb-1.5">PDF File * (max 50MB)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className="relative rounded-xl p-8 text-center transition-all cursor-pointer"
            style={{
              border: `2px dashed ${dragOver ? 'rgba(245,166,35,0.5)' : file ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: dragOver ? 'rgba(245,166,35,0.03)' : file ? 'rgba(74,222,128,0.03)' : '#111120',
            }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-green-400" />
                <div className="text-left">
                  <p className="font-display font-600 text-ice-100 text-sm">{file.name}</p>
                  <p className="text-xs text-ice-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="ml-2 text-ice-500 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-ice-600 mx-auto mb-3" />
                <p className="font-display font-500 text-ice-300 mb-1">Drop PDF here or click to browse</p>
                <p className="text-xs text-ice-600">PDF only · Max 50MB</p>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl text-sm text-red-300"
               style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error.response?.data?.message || 'Upload failed. Please try again.'}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</>
            ) : (
              <><Upload className="w-4 h-4" />Upload {mode === 'note' ? 'Note' : 'PYQ'}</>
            )}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
        </div>
      </motion.form>
    </div>
  )
}
