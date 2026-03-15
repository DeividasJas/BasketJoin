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
      <ProfileNavList />
      <div className="mx-auto w-full max-w-lg py-6">{children}</div>
    </ProfileProvider>
  )
}
