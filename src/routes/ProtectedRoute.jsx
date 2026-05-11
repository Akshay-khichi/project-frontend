import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '@/store/useStore'

/**
 * ProtectedRoute — Requires authenticated user
 */
export function ProtectedRoute({ children }) {
  const { user } = useStore()
  const location  = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * AdminRoute — Requires admin role
 */
export function AdminRoute({ children }) {
  const { user } = useStore()
  const location  = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/**
 * GuestRoute — Redirects authenticated users away from login/register
 */
export function GuestRoute({ children }) {
  const { user } = useStore()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
