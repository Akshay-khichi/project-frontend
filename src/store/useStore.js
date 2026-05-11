import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth State ──────────────────────────────────

      // user:                null,
      // token:               null,
      // subscriptionStatus:  null,  // 'active' | 'expired' | 'none'
      // subscriptionExpiry:  null,  // ISO date string
      // subscriptionPlan:    null,  // 'monthly' | 'yearly'

      //TESTING 
      user: {
      email: "test@student.com",
       role: "student"
     },

    token: "test-token",

      subscriptionStatus: "active",
         subscriptionExpiry: "2099-12-31T00:00:00Z",
          subscriptionPlan: "monthly",

      // ── Actions ─────────────────────────────────────
      setUser: (user) => set({ user }),

      setAuth: ({ user, token }) => set({ user, token }),

      setSubscription: ({ status, expiry, plan }) =>
        set({ subscriptionStatus: status, subscriptionExpiry: expiry, subscriptionPlan: plan }),

      logout: () =>
        set({
          user:               null,
          token:              null,
          subscriptionStatus: null,
          subscriptionExpiry: null,
          subscriptionPlan:   null,
        }),

      // ── Access Control Helpers ───────────────────────
      /**
       * Returns true if the user has an active premium subscription.
       */
      isPremiumUser: () => {
        const { subscriptionStatus, subscriptionExpiry } = get()
        if (subscriptionStatus !== 'active') return false
        if (!subscriptionExpiry) return false
        return new Date(subscriptionExpiry) > new Date()
      },

      /**
       * Returns true if the user can access content at the given unit number.
       * Unit 1 & 2 are free. Unit 3+ require premium.
       * Pass unitNumber = null / undefined for PYQs (always premium).
       *
       * @param {number|null} unitNumber - The unit number (null for PYQs)
       * @returns {boolean}
       */
      hasAccess: (unitNumber) => {
        const { isPremiumUser } = get()
        // PYQs — always premium
        if (unitNumber === null || unitNumber === undefined) return isPremiumUser()
        // Notes Unit 1 & 2 — free
        if (unitNumber <= 2) return true
        // Unit 3+ — premium required
        return isPremiumUser()
      },

      /**
       * Returns whether content requires premium based on unit number.
       * Does NOT check if user has access — use hasAccess() for that.
       */
      isContentPremium: (unitNumber) => {
        if (unitNumber === null || unitNumber === undefined) return true
        return unitNumber >= 3
      },
    }),
    {
      name: 'eduvault-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys — token stored in memory for security
      partialize: (state) => ({
        user:               state.user,
        subscriptionStatus: state.subscriptionStatus,
        subscriptionExpiry: state.subscriptionExpiry,
        subscriptionPlan:   state.subscriptionPlan,
      }),
    }
  )
)
