import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import { formatCurrency } from '@/lib/paymentUtils'
import AdminUsersList from '@/components/admin/AdminUsersList'

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const currentUser = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (currentUser?.role !== 'ADMIN') {
    redirect('/')
  }

  const [users, usersByRole, activeUsersCount, inactiveUsersCount, totalGames, scheduledGames, totalLeagues, activeLeagues, totalPayments, overdueSchedules] =
    await Promise.all([
      prisma.users.findMany({
        select: {
          id: true,
          email: true,
          given_name: true,
          family_name: true,
          role: true,
          is_active: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.users.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      prisma.users.count({ where: { is_active: true } }),
      prisma.users.count({ where: { is_active: false } }),
      prisma.games.count(),
      prisma.games.count({ where: { status: 'SCHEDULED' } }),
      prisma.league.count(),
      prisma.league.count({ where: { status: { in: ['ACTIVE', 'UPCOMING'] } } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.paymentSchedule.count({ where: { status: 'OVERDUE' } }),
    ])

  const totalUsers = users.length
  const revenueCollected = totalPayments._sum.amount ?? 0

  const roleBreakdown = usersByRole.reduce(
    (acc, { role, _count }) => {
      acc[role] = _count.id
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Admin</h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">System overview and user management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Total Users</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{totalUsers}</p>
          <p className="mt-1 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {activeUsersCount} active &middot; {inactiveUsersCount} inactive
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Active Games</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{scheduledGames}</p>
          <p className="mt-1 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">{totalGames} total</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Active Leagues</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{activeLeagues}</p>
          <p className="mt-1 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">{totalLeagues} total</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Revenue</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(revenueCollected)}</p>
          {overdueSchedules > 0 && <p className="mt-1 text-[10px] tabular-nums text-red-500">{overdueSchedules} overdue</p>}
        </div>
      </div>

      {/* Role Breakdown */}
      <div className="flex flex-wrap gap-3">
        {(['PLAYER', 'ORGANIZER', 'ADMIN'] as const).map(role => (
          <div key={role} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700/60 dark:bg-zinc-900">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{role}</span>
            <span className="text-sm font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{roleBreakdown[role] ?? 0}</span>
          </div>
        ))}
      </div>

      {/* User Management */}
      <section>
        <AdminUsersList
          users={users.map(u => ({
            ...u,
            created_at: u.created_at.toISOString(),
          }))}
          totalUsers={totalUsers}
          currentUserId={session.user.id}
        />
      </section>
    </div>
  )
}
