import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Crown, Zap, ArrowRight, Loader2, Shield, Star } from 'lucide-react'
import { premiumAPI } from '@/api/axios'
import { useStore } from '@/store/useStore'
import { useQuery } from '@tanstack/react-query'

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: 199,
    period: '/month',
    badge: null,
    description: 'Perfect for exam season',
    features: [
      'All Units (1–8) for every subject',
      'All PYQ papers (2017–2024)',
      'Secure watermarked viewer',
      'Bookmark & access history',
      'Priority content updates',
      'Cancel anytime',
    ],
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: 999,
    period: '/year',
    badge: 'SAVE 58%',
    description: 'Best value — ₹83/month',
    features: [
      'Everything in Monthly',
      'Full year coverage',
      'Early access to new content',
      'Premium Discord community',
      'Mock test papers',
      'Dedicated support',
    ],
  },
]

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Premium() {
  const navigate = useNavigate()
  const { user, isPremiumUser, setSubscription, subscriptionExpiry, subscriptionStatus } = useStore()
  const premium = isPremiumUser()

  const [selectedPlan, setSelectedPlan] = useState('yearly')
  const [paying, setPaying] = useState(false)
  const [error,  setError]  = useState(null)

  const { data: plans } = useQuery({
    queryKey: ['premium-plans'],
    queryFn:  () => premiumAPI.getPlans().then((r) => r.data.plans),
    staleTime: 10 * 60 * 1000,
  })

  const handleUpgrade = async () => {
    if (!user) { navigate('/login', { state: { from: { pathname: '/premium' } } }); return }

    setPaying(true)
    setError(null)

    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Failed to load payment gateway')

      // Create order on backend
      const { data } = await premiumAPI.createOrder(selectedPlan)
      const { orderId, amount, currency, keyId } = data

      const options = {
        key:         keyId,
        amount,
        currency,
        name:        'EduVault',
        description: `Premium ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
        order_id:    orderId,
        prefill: {
          name:  user.name,
          email: user.email,
        },
        theme: { color: '#F5A623' },
        modal: {
          ondismiss: () => setPaying(false),
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verify = await premiumAPI.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan: selectedPlan,
            })

            const { subscription } = verify.data
            setSubscription({
              status: subscription.status,
              expiry: subscription.expiry,
              plan:   subscription.plan,
            })

            navigate('/dashboard')
          } catch (verifyErr) {
            setError('Payment successful but verification failed. Contact support.')
          } finally {
            setPaying(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`)
        setPaying(false)
      })
      rzp.open()
    } catch (err) {
      setError(err.message || 'Payment initiation failed. Please try again.')
      setPaying(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* ── Header ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
             style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono text-amber-400 tracking-widest uppercase">Premium Plans</span>
        </div>
        <h1 className="font-display font-800 text-4xl sm:text-5xl text-ice-100 mb-4">
          Unlock your full<br />
          <span style={{
            background: 'linear-gradient(135deg, #F5A623, #FFD980)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>academic potential</span>
        </h1>
        <p className="text-ice-400 max-w-md mx-auto">
          One subscription. All notes. All PYQs. Secure access — no downloads, no leaks.
        </p>
      </motion.div>

      {/* ── Active Premium Banner ─────────────────── */}
      {premium && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6 mb-10 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.03))', border: '1px solid rgba(245,166,35,0.3)' }}
        >
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="font-display font-700 text-xl text-amber-400 mb-1">You're already Premium!</p>
          <p className="text-ice-400 text-sm">
            Your {subscriptionStatus} plan expires{' '}
            {subscriptionExpiry
              ? new Date(subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'soon'}.
          </p>
        </motion.div>
      )}

      {/* ── Plan Toggle + Cards ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {PLANS.map((plan, i) => {
          const selected = selectedPlan === plan.id
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedPlan(plan.id)}
              className="relative rounded-2xl p-6 cursor-pointer transition-all duration-200"
              style={{
                background: selected ? 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.03))' : '#111120',
                border: selected ? '2px solid rgba(245,166,35,0.5)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: selected ? '0 0 40px rgba(245,166,35,0.1)' : 'none',
              }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-700 text-ink-950"
                     style={{ background: 'linear-gradient(135deg, #F5A623, #E08A00)' }}>
                  {plan.badge}
                </div>
              )}

              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="font-display font-700 text-lg text-ice-100 flex items-center gap-2">
                    {plan.id === 'yearly' && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                    {plan.label}
                  </p>
                  <p className="text-ice-500 text-xs mt-0.5">{plan.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-800 text-3xl text-ice-100">
                    ₹{plan.price}
                  </p>
                  <p className="text-ice-500 text-xs">{plan.period}</p>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                         style={{ background: selected ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)' }}>
                      <Check className={`w-2.5 h-2.5 ${selected ? 'text-amber-400' : 'text-ice-500'}`} />
                    </div>
                    <span className={selected ? 'text-ice-200' : 'text-ice-400'}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Selection indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-amber-400' : 'border-ice-600'}`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <span className={`text-sm font-display font-500 ${selected ? 'text-amber-400' : 'text-ice-500'}`}>
                  {selected ? 'Selected' : 'Select plan'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── CTA ─────────────────────────────────── */}
      {!premium && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
          {error && (
            <div className="mb-4 p-4 rounded-xl text-sm text-red-300"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={paying}
            className="btn-primary text-base px-10 py-4 rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontSize: '1rem' }}
          >
            {paying ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Processing…</>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Get {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} — ₹{PLANS.find(p => p.id === selectedPlan)?.price}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { icon: Shield, text: 'Secure Payment' },
              { icon: Zap,    text: 'Instant Access' },
              { icon: Check,  text: 'Cancel Anytime' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-ice-500">
                <Icon className="w-3.5 h-3.5" />
                {text}
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-ice-600">
            Payments processed securely by Razorpay · GST included
          </p>
        </motion.div>
      )}

      {/* ── Trust Section ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 rounded-2xl p-6 text-center"
        style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p className="section-label mb-4">Trusted by Students</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { val: '10,000+', label: 'Students' },
            { val: '98%',     label: 'Satisfaction' },
            { val: '5,000+',  label: 'Notes Available' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="font-display font-800 text-2xl text-amber-400">{val}</p>
              <p className="text-xs text-ice-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
