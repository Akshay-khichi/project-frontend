import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, FileQuestion, Sparkles, LayoutDashboard, Menu, X, LogOut, Shield, ChevronDown } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { authAPI } from '@/api/axios'

const NAV_ITEMS = [
  { to: '/',     label: 'Home',     icon: BookOpen },
  { to: '/notes',     label: 'Notes',     icon: BookOpen },
  { to: '/pyqs',      label: 'PYQs',      icon: FileQuestion },
  { to: '/premium',   label: 'Premium',   icon: Sparkles,  highlight: true },
]

export default function Navbar() {
  const { user, isPremiumUser, logout } = useStore()
  const location   = useLocation()
  const navigate   = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)
  const [dropdown, setDropdown] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  // Debug: Check if user object has picture URL
  useEffect(() => {
    if (user) {
      console.log('Navbar User Data:', user)
    }
  }, [user])

  const handleLogout = async () => {
    try { await authAPI.logout() } catch (_) { /* ignore */ }
    logout()
    navigate('/login')
  }

  const premium = isPremiumUser()

  // Fallback avatar if Google CDN fails or user has no avatar
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff&size=96`

  // Helper to get the best available avatar URL
  const getAvatarUrl = () => {
    return user?.picture || user?.avatar || user?.photoURL || user?.photos?.[0]?.value || null
  }

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10,10,18,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                }}
              >
                <BookOpen className="w-4 h-4 text-ink-950" />
              </div>
              <span className="font-display font-800 text-lg tracking-tight">
                Edu<span style={{ color: '#38BDF8' }}>Vault</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, highlight }) => {
                const active =
                  to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(to)
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body font-500 transition-all duration-200 ${
                      highlight
                        ? 'badge-premium ml-2'
                        : active
                      ? 'text-sky-400 bg-sky-400/10'
                        : 'text-ice-400 hover:text-ice-100 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdown((d) => !d)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {/* Avatar with fallback handler */}
                    <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg, #38BDF8, #0284C7)' }}>
                      {getAvatarUrl() ? (
                        <img 
                          src={getAvatarUrl()} 
                          alt={user?.name || 'User'} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // Prevent infinite error loops
                            e.target.onerror = null
                            // Swap to fallback if Google CDN fails
                            e.target.src = fallbackAvatar
                          }}
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-xs font-display font-bold text-ink-950">
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-display font-600 text-ice-100 leading-none">{user?.name?.split(' ')[0]}</p>
                      {premium && <p className="text-[10px] text-sky-400 leading-none mt-0.5">Premium</p>}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-ice-400 transition-transform ${dropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-2xl"
                        style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.08)' }}
                        onMouseLeave={() => setDropdown(false)}
                      >
                        <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-3 text-sm text-ice-300 hover:text-ice-100 hover:bg-white/5 transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-3 text-sm text-sky-400 hover:bg-sky-400/5 transition-colors">
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-400/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
                  <Link to="/premium" className="btn-primary text-sm px-4 py-2">Get Premium</Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(10,10,18,0.97)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex flex-col h-full px-6 pt-24 pb-12 gap-2">
              {NAV_ITEMS.map(({ to, label, icon: Icon, highlight }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-body font-500 transition-all ${
                    highlight ? 'text-sky-400' : 'text-ice-200'
                  }`}
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                  {highlight && <span className="badge-premium ml-auto">Premium</span>}
                </Link>
              ))}

              <div className="mt-auto space-y-3">
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn-ghost w-full justify-center">Dashboard</Link>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-400 text-sm">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-ghost w-full justify-center">Sign In</Link>
                    <Link to="/premium" className="btn-primary w-full justify-center">Get Premium</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}