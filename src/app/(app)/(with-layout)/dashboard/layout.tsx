import { redirect } from 'next/navigation'
import SubNav from '@/components/subNav'
import { auth } from '@/auth'
import { Links } from '@/types/navLinks'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = session.user.role
  const hasAdminAccess = userRole === 'ADMIN' || userRole === 'ORGANIZER'

  if (!hasAdminAccess) {
    redirect('/')
  }

  const dashboardLinks: Links[] = [
    { label: 'Games', href: '/dashboard/games' },
    { label: 'Locations', href: '/dashboard/locations' },
    { label: 'Leagues', href: '/dashboard/leagues' },
    { label: 'Payments', href: '/dashboard/payments' },
    ...(userRole === 'ADMIN' ? [{ label: 'Admin', href: '/dashboard/admin' } as Links] : []),
  ]

  return (
    <>
      <SubNav links={dashboardLinks} />
      <div className="flex flex-col gap-6 pt-6">{children}</div>
    </>
  )
}
