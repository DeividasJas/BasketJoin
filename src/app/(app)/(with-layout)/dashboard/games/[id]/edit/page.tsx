import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAllLocations } from '@/actions/adminGameActions'
import { prisma } from '@/utils/prisma'
import GameForm from '@/components/admin/GameForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = session.user.role
  if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
    redirect('/')
  }

  const [{ locations }, game] = await Promise.all([
    getAllLocations(),
    prisma.games.findUnique({
      where: { id: parseInt(id) },
    }),
  ])

  if (!game) {
    redirect('/admin')
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/dashboard/games"
        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Games
      </Link>
      <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Edit Game</h1>
      <GameForm locations={locations} mode="edit" game={game} />
    </div>
  )
}
