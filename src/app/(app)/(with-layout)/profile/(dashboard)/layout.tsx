import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import EditProfileForm from '@/components/editProfileForm'
import LogoutBtn from '@/components/logoutBtn'
import ThemeChanger from '@/components/themeChangeBtn'

export default async function ProfileDashboardLayout({
  stats,
  profile,
  gameHistory,
}: {
  stats: React.ReactNode
  profile: React.ReactNode
  gameHistory: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Profile card */}
      <section>{profile}</section>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/60" />

      {/* Stats */}
      <section>{stats}</section>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/60" />

      {/* Game history */}
      <section>{gameHistory}</section>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/60" />

      {/* Actions */}
      <div className="flex items-center justify-center gap-2">
        <EditProfileForm />
        <ThemeChanger />
        <LogoutBtn />
      </div>
    </div>
  )
}
