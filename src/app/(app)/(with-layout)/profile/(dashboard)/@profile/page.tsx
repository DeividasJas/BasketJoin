import Image from 'next/image'
import { findCurrentUser } from '@/actions/userActions'
import EditProfileForm from '@/components/editProfileForm'
import LogoutBtn from '@/components/logoutBtn'
import ThemeChanger from '@/components/themeChangeBtn'
import { format } from 'date-fns'

export default async function ProfileDashboardProfileParallel() {
  const { success, user, message } = await findCurrentUser()

  if (!success) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-red-500">{message || 'Unable to load user profile'}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-zinc-400">User profile not found</p>
      </div>
    )
  }

  const fullName = [user.given_name, user.family_name].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col items-center">
      {/* Avatar */}
      <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-zinc-200/80 dark:bg-zinc-700 dark:ring-zinc-700/80">
        {user.picture ? (
          <Image src={user.picture} alt={fullName || 'Profile picture'} width={80} height={80} priority className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-light text-zinc-400 dark:text-zinc-500">
            {user.given_name?.charAt(0) || '?'}
          </div>
        )}
      </div>

      {/* Name */}
      {fullName && <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">{fullName}</h2>}

      {/* Username */}
      {user.username && <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">@{user.username}</p>}

      {/* Email & joined */}
      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 text-[12px] text-zinc-400 dark:text-zinc-500">
        {user.email && <span>{user.email}</span>}
        {user.created_at && <span>Joined {format(user.created_at, 'MMM yyyy')}</span>}
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-2">
        <EditProfileForm />
        <ThemeChanger />
        <LogoutBtn />
      </div>
    </div>
  )
}
