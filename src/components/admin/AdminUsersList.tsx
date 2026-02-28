'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateUserRole, toggleUserActive } from '@/actions/adminUserActions'
import { Mail, Users, Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { UserRole } from '@prisma/client'

type User = {
  id: string
  email: string | null
  given_name: string | null
  family_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

const roleStyle: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  ORGANIZER: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  PLAYER: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
}

const roleIcon: Record<string, typeof Shield> = {
  ADMIN: ShieldAlert,
  ORGANIZER: ShieldCheck,
  PLAYER: Shield,
}

export default function AdminUsersList({ users, totalUsers, currentUserId }: { users: User[]; totalUsers: number; currentUserId: string }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null)
  const [isPending, startTransition] = useTransition()
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  const filteredUsers = users.filter(user => {
    const fullName = `${user.given_name ?? ''} ${user.family_name ?? ''}`.toLowerCase()
    const email = user.email?.toLowerCase() ?? ''
    const search = searchTerm.toLowerCase()
    const matchesSearch = fullName.includes(search) || email.includes(search)
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setLoadingUserId(userId)
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      setLoadingUserId(null)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleToggleActive = (userId: string) => {
    setLoadingUserId(userId)
    startTransition(async () => {
      const result = await toggleUserActive(userId)
      setLoadingUserId(null)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Users ({totalUsers})</p>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 sm:w-56"
        />
      </div>

      {/* Role Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[null, 'PLAYER', 'ORGANIZER', 'ADMIN'].map(role => (
          <button
            key={role ?? 'all'}
            onClick={() => setRoleFilter(role as UserRole | null)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              roleFilter === role || (!roleFilter && !role)
                ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {role ?? 'All'}
          </button>
        ))}
      </div>

      {/* User List */}
      <div className="flex flex-col gap-2">
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
            <Users className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">{searchTerm || roleFilter ? 'No users found' : 'No users yet'}</p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const RoleIcon = roleIcon[user.role] ?? Shield
            const isSelf = user.id === currentUserId
            const isLoading = isPending && loadingUserId === user.id

            return (
              <div
                key={user.id}
                className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900 ${!user.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-basket-400/10 text-xs font-semibold text-basket-400">
                      {user.given_name?.[0]}
                      {user.family_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                          {user.given_name} {user.family_name}
                          {isSelf && <span className="ml-1.5 text-[10px] text-zinc-400">(you)</span>}
                        </p>
                        {!user.is_active && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1 truncate text-xs text-zinc-400 dark:text-zinc-500">
                        <Mail className="h-3 w-3 shrink-0" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleStyle[user.role] ?? 'bg-zinc-100 text-zinc-500'}`}
                  >
                    <RoleIcon className="h-3 w-3" />
                    {user.role}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
                  <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    Joined{' '}
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  {!isSelf && (
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={isLoading}
                        className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-600 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        <option value="PLAYER">Player</option>
                        <option value="ORGANIZER">Organizer</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <button
                        onClick={() => handleToggleActive(user.id)}
                        disabled={isLoading}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                          user.is_active ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
