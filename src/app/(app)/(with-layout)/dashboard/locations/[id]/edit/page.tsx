import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/utils/prisma'
import LocationForm from '@/components/admin/LocationForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = session.user.role
  if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
    redirect('/')
  }

  const location = await prisma.locations.findUnique({
    where: { id: parseInt(id) },
  })

  if (!location) {
    redirect('/dashboard/locations')
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/dashboard/locations"
        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Locations
      </Link>
      <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Edit Location</h1>
      <LocationForm mode="edit" location={location} />
    </div>
  )
}
