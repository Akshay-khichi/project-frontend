import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { authAPI, setAccessToken } from '@/api/axios'
import { useStore } from '@/store/useStore'

const GOOGLE_OAUTH_URL = `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/google`

export default function Login() {
  const { setAuth, setSubscription } = useStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [mode,      setMode]      = useState('login')    // 'login' | 'register'
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [name,      setName]      = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let res
      if (mode === 'login') {
        res = await authAPI.loginEmail({ email, password })
      } else {
        res = await authAPI.register({ name, email, password })
      }

      const { user, accessToken, subscription } = res.data

      setAccessToken(accessToken)
      setAuth({ user, token: accessToken })

      if (subscription) {
        setSubscription({
          status: subscription.status,
          expiry: subscription.expiry,
          plan:   subscription.plan,
        })
      }

      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 py-16">
      {/* Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
           style={{ background: 'radial-gradient(ellipse, rgba(245,166,35,0.06) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4,0,0.2,1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #F5A623, #E08A00)' }}>
            <BookOpen className="w-5 h-5 text-ink-950" />
          </div>
          <span className="font-display font-800 text-xl">
            Edu<span style={{ color: '#F5A623' }}>Vault</span>
          </span>
        </Link>

        <div className="rounded-3xl p-8"
             style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Mode Toggle */}
          <div className="flex rounded-xl p-1 mb-8"
               style={{ background: '#0A0A12' }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className="flex-1 py-2.5 rounded-lg text-sm font-display font-600 transition-all duration-200"
                style={{
                  background: mode === m ? '#1A1A2E' : 'transparent',
                  color: mode === m ? '#F8F9FF' : '#6670A0',
                  border: mode === m ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <a
            href={GOOGLE_OAUTH_URL}
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl text-sm font-body font-500 transition-all hover:bg-white/5 mb-6"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#C5C9E8' }}
          >
            {/* Google SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-ice-600 font-mono">OR</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-ice-400 mb-1.5 font-body">Full Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Akshay Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-ice-400 mb-1.5 font-body">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
                <input
                  className="input pl-11"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-ice-400 mb-1.5 font-body">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
                <input
                  className="input pl-11 pr-11"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ice-500 hover:text-ice-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
                   style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ice-600 mt-6">
          By continuing, you agree to EduVault's{' '}
          <a href="#" className="text-amber-400/70 hover:text-amber-400">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-amber-400/70 hover:text-amber-400">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  )
}
