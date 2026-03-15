import { redirect } from 'next/navigation'
import SubNav from '@/components/subNav'
import { ProfileProvider } from '@/context/profileContext'
import { auth } from '@/auth'
import { Links } from '@/types/navLinks'

const profileLinks: Links[] = [
  { label: 'General', href: '/profile' },
  { label: 'Attendance', href: '/profile/attendance' },
  { label: 'Stats', href: '/profile/stats' },
  { label: 'Memberships', href: '/profile/memberships' },
]

export default async function LayoutProfile({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <ProfileProvider>
      <SubNav links={profileLinks} />
      <div className="mx-auto w-full max-w-lg py-6">{children}</div>
    </ProfileProvider>
  )
}
