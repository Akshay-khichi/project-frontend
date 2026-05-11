import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Shield, ShieldOff, UserX, Crown, User, ChevronDown } from 'lucide-react'
import { adminUsersAPI } from '@/api/axios'

export default function AdminUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const LIMIT = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search, page }],
    queryFn: () => adminUsersAPI.list({ search: search || undefined, page, limit: LIMIT }).then((r) => r.data),
    staleTime: 30 * 1000,
  })

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ id, role }) => adminUsersAPI.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, isActive }) => adminUsersAPI.updateStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id) => adminUsersAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const users      = data?.users      || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="section-label mb-1">Admin Panel</p>
        <h1 className="font-display font-800 text-3xl text-ice-100">Manage Users</h1>
      </motion.div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
        <input className="input pl-11" placeholder="Search by name or email…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Head */}
        <div className="grid grid-cols-12 px-4 py-3 text-xs font-mono text-ice-600 uppercase tracking-wider"
             style={{ background: '#0A0A12', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="col-span-3">User</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2 text-center">Role</div>
          <div className="col-span-2 text-center">Subscription</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 px-4 py-4 gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              {[3,3,2,2,2].map((span, j) => <div key={j} className={`col-span-${span} skeleton h-3 rounded`} />)}
            </div>
          ))
        ) : (
          users.map((user) => (
            <div key={user._id}
                 className="grid grid-cols-12 px-4 py-3.5 items-center text-sm transition-colors hover:bg-white/[0.02]"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="col-span-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-display font-bold text-ink-950 flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg, #F5A623, #E08A00)' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-ice-100 font-display font-500 text-xs leading-none">{user.name}</p>
                  {!user.isActive && <span className="text-[10px] text-red-400 font-mono">Suspended</span>}
                </div>
              </div>

              <div className="col-span-3 text-ice-500 text-xs truncate pr-4">{user.email}</div>

              <div className="col-span-2 flex justify-center">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  user.role === 'admin'
                    ? 'text-amber-400 border border-amber-400/20 bg-amber-400/5'
                    : 'text-ice-500 border border-white/5 bg-white/[0.02]'
                }`}>
                  {user.role === 'admin' ? '⚡ Admin' : 'Student'}
                </span>
              </div>

              <div className="col-span-2 flex justify-center">
                {user.subscriptionStatus === 'active'
                  ? <span className="badge-premium text-[10px]"><Crown className="w-2.5 h-2.5" />Premium</span>
                  : <span className="text-[10px] text-ice-600 font-mono">Free</span>
                }
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1.5">
                {/* Role toggle */}
                <button
                  onClick={() => changeRole({ id: user._id, role: user.role === 'admin' ? 'student' : 'admin' })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-amber-400/5"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                  title={user.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                >
                  {user.role === 'admin'
                    ? <ShieldOff className="w-3.5 h-3.5 text-amber-400" />
                    : <Shield className="w-3.5 h-3.5 text-ice-500 hover:text-amber-400" />
                  }
                </button>

                {/* Active toggle */}
                <button
                  onClick={() => changeStatus({ id: user._id, isActive: !user.isActive })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                  title={user.isActive ? 'Suspend User' : 'Activate User'}
                >
                  <User className={`w-3.5 h-3.5 ${user.isActive ? 'text-green-400' : 'text-red-400'}`} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => { if (confirm(`Delete user ${user.email}? This cannot be undone.`)) deleteUser(user._id) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ice-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="btn-ghost text-sm px-4 py-2 disabled:opacity-30">Prev</button>
          <span className="font-mono text-sm text-ice-400">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="btn-ghost text-sm px-4 py-2 disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  )
}
