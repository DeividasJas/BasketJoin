'use client'
import LogoutBtn from '@/components/logoutBtn'
import { useProfileContext } from '@/context/profileContext'
import EditProfileForm from '@/components/editProfileForm'
import Image from 'next/image'

export default function Page() {
  const { user } = useProfileContext()

  const fullName = [user?.given_name, user?.family_name].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-8">
      {/* Section header */}
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">Settings</h2>

      {/* Profile info card */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          {user?.picture ? (
            <Image src={user.picture} width={64} height={64} alt="Profile picture" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-light text-zinc-400 dark:text-zinc-500">
              {user?.given_name?.charAt(0) || '?'}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {fullName && <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{fullName}</p>}
          {user?.username && <p className="text-[13px] text-zinc-400 dark:text-zinc-500">@{user.username}</p>}
          {user?.email && <p className="truncate text-[13px] text-zinc-400 dark:text-zinc-500">{user.email}</p>}
          {user?.created_at && <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Joined {user.created_at.toLocaleDateString()}</p>}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/60" />

      {/* Edit profile */}
      <div className="flex justify-center">
        <EditProfileForm />
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/60" />

      {/* Logout */}
      <div className="flex justify-center">
        <LogoutBtn />
      </div>
    </div>
  )
}
