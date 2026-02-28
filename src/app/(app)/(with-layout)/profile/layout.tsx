import { redirect } from 'next/navigation'
import ProfileNavList from '@/components/profileNavList'
import { ProfileProvider } from '@/context/profileContext'
import { auth } from '@/auth'

export default async function LayoutProfile({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <ProfileProvider>
      <div className="mx-auto w-full max-w-lg">
        <ProfileNavList />
        <div className="py-6">{children}</div>
      </div>
    </ProfileProvider>
  )
}
