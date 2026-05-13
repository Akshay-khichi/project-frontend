import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Crown, Zap, ArrowRight, Loader2, Shield, Star } from 'lucide-react'
import { premiumAPI } from '@/api/axios'
import { useStore } from '@/store/useStore'
import { useQuery } from '@tanstack/react-query'

const PLANS = [
  {
    id: 'standard',
    label: 'Standard Plan',
    price: 350,
    currency: 'NPR',
    period: '/one-time',
    description: 'Full access to all EduVault content',
    features: [
      'All Units for every subject',
      'All PYQ papers (2017–2025)',
      'Secure ',
      'Bookmark & access history',
      'Priority content updates',
      '1 year access',
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

  const [paying, setPaying] = useState(false)
  const [error,  setError]  = useState(null)

  const {  plans } = useQuery({
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

      const { data } = await premiumAPI.createOrder('standard')
      const { orderId, amount, currency, keyId } = data

      const options = {
        key:         keyId,
        amount,
        currency,
        name:        'EduVault',
        description: `Premium Standard Plan - 350 NPR`,
        order_id:    orderId,
        prefill: {
          name:  user.name,
          email: user.email,
        },
        theme: { color: '#38BDF8' },
        modal: {
          ondismiss: () => setPaying(false),
        },
        handler: async (response) => {
          try {
            const verify = await premiumAPI.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan: 'standard',
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

  // After line ~27 where you get user from store
console.log('Premium debug:', {
  user,
  isPremiumUser: isPremiumUser(),
  subscriptionExpiry,
  subscriptionStatus
})

  const plan = PLANS[0]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* ── Header ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
             style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
          <Crown className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-mono text-sky-400 tracking-widest uppercase">Premium Plan</span>
        </div>
        <h1 className="font-display font-800 text-4xl sm:text-5xl text-ice-100 mb-4">
          Unlock your full<br />
          <span style={{
            background: 'linear-gradient(135deg, #38BDF8, #7DD3FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>academic potential</span>
        </h1>
        <p className="text-ice-400 max-w-md mx-auto">
          One subscription. All notes. All PYQs.
        </p>
      </motion.div>

      {/* ── Active Premium Banner ─────────────────── */}
  {premium && (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    whileHover={{
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.28,
        ease: "easeOut",
      },
    }}
    className="relative rounded-3xl p-7 mb-10 text-center overflow-hidden cursor-pointer group"
    style={{
      background:
        "linear-gradient(135deg, rgba(56,189,248,0.12), rgba(56,189,248,0.03))",
      border: "1px solid rgba(56,189,248,0.35)",
      boxShadow:
        "0 0 30px rgba(56,189,248,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
      backdropFilter: "blur(14px)",
    }}
  >
    {/* glow aura */}
    <div
      className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
      style={{
        background: "rgba(56,189,248,0.18)",
        filter: "blur(90px)",
      }}
    />

    {/* animated shine */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      <div
        className="absolute -left-1/2 top-0 h-full w-1/2 group-hover:left-full transition-all duration-1000"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          transform: "skewX(-20deg)",
        }}
      />
    </div>

    {/* subtle grid overlay */}
    <div
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    />

    <div className="relative z-10">
      <motion.div
        whileHover={{
          rotate: [-6, 6, -4, 0],
          scale: 1.12,
        }}
        transition={{ duration: 0.45 }}
      >
        <Crown className="w-10 h-10 text-sky-400 mx-auto mb-3" />
      </motion.div>

      <p className="font-display font-700 text-xl text-sky-400 mb-1">
        You're already Premium!
      </p>

      <p className="text-ice-400 text-sm">
        Your {subscriptionStatus} plan expires{" "}
        {subscriptionExpiry
          ? new Date(subscriptionExpiry).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "soon"}.
      </p>
    </div>
  </motion.div>
)}
        {/* ── Single Plan Card ─────────────────── */}
    <div className="grid grid-cols-1 gap-8 mb-12 max-w-2xl mx-auto">
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{
      y: -8,
      scale: 1.02,
      transition: { duration: 0.25 },
    }}
    className="relative rounded-3xl p-7 cursor-pointer transition-all duration-300 overflow-hidden group"
    style={{
      background:
        "linear-gradient(135deg, rgba(8,20,35,0.95), rgba(15,23,42,0.88))",
      border: "1px solid rgba(56,189,248,0.35)",
      boxShadow:
        "0 0 25px rgba(56,189,248,0.12), 0 0 80px rgba(56,189,248,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
    }}
  >
    {/* ambient glow */}
    <div
      className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none opacity-70 group-hover:opacity-100 transition-all duration-500"
      style={{
        background: "rgba(56,189,248,0.18)",
        filter: "blur(90px)",
      }}
    />

    {/* corner glow */}
    <div
      className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)",
      }}
    />

    {/* animated border sweep */}
    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
      <div
        className="absolute -left-1/2 top-0 h-full w-1/2 group-hover:left-full transition-all duration-1000"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          transform: "skewX(-20deg)",
        }}
      />
    </div>

    {/* subtle grid overlay */}
    <div
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />

    <div className="relative z-10 flex items-start justify-between mb-6">
      <div>
        <p className="font-display font-700 text-xl text-ice-100 flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(56,189,248,0.22), rgba(56,189,248,0.08))",
              boxShadow: "0 0 20px rgba(56,189,248,0.15)",
            }}
          >
            <Star className="w-5 h-5 text-sky-400 fill-sky-400" />
          </span>

          {plan.label}
        </p>

        <p className="text-ice-500 text-sm mt-2 ml-13">
          {plan.description}
        </p>
      </div>

      <div className="text-right">
        <p
          className="font-display font-800 text-4xl"
          style={{
            background:
              "linear-gradient(135deg, #ffffff, #7dd3fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(56,189,248,0.2)",
          }}
        >
          ₹ {plan.price}
        </p>

        <p className="text-ice-500 text-xs mt-1 tracking-wider uppercase">
          {plan.period}
        </p>
      </div>
    </div>

    <ul className="relative z-10 space-y-3 mb-7">
      {plan.features.map((f) => (
        <li
          key={f}
          className="flex items-start gap-3 text-sm rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/5"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.08))",
              boxShadow: "0 0 12px rgba(56,189,248,0.2)",
            }}
          >
            <Check className="w-3 h-3 text-sky-400" />
          </div>

          <span className="text-ice-200">{f}</span>
        </li>
      ))}
    </ul>

    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 rounded-full border flex items-center justify-center"
          style={{
            borderColor: "rgba(56,189,248,0.8)",
            boxShadow: "0 0 15px rgba(56,189,248,0.35)",
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
        </div>

        <span className="text-sm font-display font-600 text-sky-400 tracking-wide">
          SELECTED PLAN
        </span>
      </div>

      <div
        className="px-4 py-2 rounded-full text-xs font-bold tracking-widest"
        style={{
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.16), rgba(14,165,233,0.08))",
          border: "1px solid rgba(56,189,248,0.2)",
        }}
      >
        PREMIUM
      </div>
    </div>
  </motion.div>
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
                Get Premium — Rs. {plan.price} {plan.currency}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { icon: Shield, text: 'Secure Payment' },
              { icon: Zap,    text: 'Instant Access' },
        
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
              <p className="font-display font-800 text-2xl text-sky-400">{val}</p>
              <p className="text-xs text-ice-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}