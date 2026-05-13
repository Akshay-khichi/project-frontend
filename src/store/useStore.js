import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth State ──────────────────────────────────

      user: null,
      token: null,
      subscriptionStatus: null,  // 'active' | 'expired' | 'none'
      subscriptionExpiry: null,  // ISO date string
      subscriptionPlan: null,    // 'monthly' | 'yearly'

      // ── TESTING MODE (Uncomment to simulate premium user) ─────────────
      // For testing premium features without actual payment:
      // 1. Comment out the default null values above
      // 2. Uncomment the test values below
      // 3. Refresh the page

      /* === TEST USER (Uncomment for testing) === */
      // user: {
      //   email: "test@student.com",
      //   name: "Test Student",
      //   role: "student",
      //   picture: "https://ui-avatars.com/api/?name=Test+Student&background=38BDF8&color=0f172a"
      // },
      // token: "test-token-12345",

      /* === TEST PREMIUM SUBSCRIPTION (Uncomment for testing) === */
      // subscriptionStatus: "active",
      // subscriptionExpiry: "2099-12-31T00:00:00Z",
      // subscriptionPlan: "yearly",
      // ──────────────────────────────────────────────────────────────────

      // ── Actions ─────────────────────────────────────
      setUser: (user) => set({ user }),

      setAuth: ({ user, token }) => set({ user, token }),

      setSubscription: ({ status, expiry, plan }) =>
        set({ subscriptionStatus: status, subscriptionExpiry: expiry, subscriptionPlan: plan }),

      logout: () =>
        set({
          user: null,
          token: null,
          subscriptionStatus: null,
          subscriptionExpiry: null,
          subscriptionPlan: null,
        }),

      // ── Access Control Helpers ───────────────────────
      /**
       * Returns true if the user has an active premium subscription.
       * 
       * TESTING: To force premium mode for testing:
       *   return true  // Force premium
       *   return false // Force non-premium
       */
      isPremiumUser: () => {
        const { subscriptionStatus, subscriptionExpiry } = get()
        
        // TESTING: Uncomment one of these lines to override real logic
        // return true   // Force premium for testing
        // return false  // Force non-premium for testing
        
        // Production logic:
        if (subscriptionStatus !== 'active') return false
        if (!subscriptionExpiry) return false
        return new Date(subscriptionExpiry) > new Date()
      },

      /**
       * Returns true if the user can access content.
       * 
       * ALL content now requires premium subscription.
       * 
       * TESTING: To test non-premium state:
       *   return false  // Block all access for testing
       * 
       * @param {number|null} unitNumber - No longer used, kept for API compatibility
       * @returns {boolean}
       */
      hasAccess: (unitNumber) => {
        const { isPremiumUser } = get()
        
        // TESTING: Force non-premium for testing locked states
        // return false
        
        // Production: ALL content requires premium
        return isPremiumUser()
      },

      /**
       * Returns whether content requires premium based on unit number.
       * Does NOT check if user has access — use hasAccess() for that.
       * 
       * Note: Currently ALL content is premium regardless of unit number.
       */
      isContentPremium: (unitNumber) => {
        // All content is premium - unit number check removed
        return true
      },
    }),
    {
      name: 'eduvault-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys — token stored in memory for security
      partialize: (state) => ({
        user: state.user,
        subscriptionStatus: state.subscriptionStatus,
        subscriptionExpiry: state.subscriptionExpiry,
        subscriptionPlan: state.subscriptionPlan,
      }),
    }
  )
)