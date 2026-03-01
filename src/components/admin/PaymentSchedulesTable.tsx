'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DollarSign, Mail } from 'lucide-react'
import { formatCurrency, daysUntilDue } from '@/lib/paymentFormatUtils'
import { recordMembershipPayment } from '@/actions/paymentActions'
import { toast } from 'sonner'

interface PaymentSchedule {
  id: string
  due_date: Date
  amount_due: number
  amount_paid: number
  status: string
  league: {
    id: string
    name: string
  }
  membership: {
    user: {
      id: string
      given_name: string | null
      family_name: string | null
      email: string | null
    }
  }
  payments: Array<{
    id: string
    amount: number
    payment_date: Date
  }>
}

interface PaymentSchedulesTableProps {
  schedules: PaymentSchedule[]
  currentStatus?: string
}

const statusStyle: Record<string, string> = {
  PAID: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  PARTIALLY_PAID: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
  OVERDUE: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  PENDING: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
}

const statusAccent: Record<string, string> = {
  PAID: 'bg-green-500',
  PARTIALLY_PAID: 'bg-yellow-500',
  OVERDUE: 'bg-red-500',
  PENDING: 'bg-blue-500',
}

export default function PaymentSchedulesTable({ schedules, currentStatus }: PaymentSchedulesTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [recordingPayment, setRecordingPayment] = useState<string | null>(null)

  const filteredSchedules = schedules.filter(schedule => {
    const fullName = `${schedule.membership.user.given_name} ${schedule.membership.user.family_name}`.toLowerCase()
    const email = schedule.membership.user.email?.toLowerCase() || ''
    const leagueName = schedule.league.name.toLowerCase()
    const search = searchTerm.toLowerCase()

    return fullName.includes(search) || email.includes(search) || leagueName.includes(search)
  })

  const handleRecordPayment = async (scheduleId: string, remainingAmount: number) => {
    const amountStr = prompt(`Enter payment amount (max €${remainingAmount / 100}):`)
    if (!amountStr) return

    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount')
      return
    }

    const amountInCents = Math.round(amount * 100)
    if (amountInCents > remainingAmount) {
      toast.error('Amount exceeds remaining balance')
      return
    }

    setRecordingPayment(scheduleId)

    const result = await recordMembershipPayment({
      paymentScheduleId: scheduleId,
      amount: amountInCents,
    })

    setRecordingPayment(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const updateFilter = (status: string | null) => {
    const params = new URLSearchParams()
    if (status) {
      params.set('status', status)
    }
    router.push(`/dashboard/payments${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Payment Schedules ({filteredSchedules.length})</p>
        <input
          type="text"
          placeholder="Search members or leagues..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 sm:w-64"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[null, 'PENDING', 'PARTIALLY_PAID', 'OVERDUE', 'PAID'].map(status => (
          <button
            key={status || 'all'}
            onClick={() => updateFilter(status)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              currentStatus === status || (!currentStatus && !status)
                ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {status ? status.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <DollarSign className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">{searchTerm ? 'No matching payment schedules' : 'No payment schedules found'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredSchedules.map(schedule => {
            const remainingAmount = schedule.amount_due - schedule.amount_paid
            const daysUntil = daysUntilDue(schedule.due_date)
            const progressPercent = schedule.amount_due > 0 ? Math.round((schedule.amount_paid / schedule.amount_due) * 100) : 0

            return (
              <div
                key={schedule.id}
                className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                {/* Status accent bar */}
                <div className={`absolute left-0 top-0 h-full w-1 ${statusAccent[schedule.status] || 'bg-zinc-300'}`} />

                <div className="py-3.5 pl-5 pr-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">
                        {schedule.membership.user.given_name} {schedule.membership.user.family_name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                        <Mail className="h-3 w-3" />
                        {schedule.membership.user.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[schedule.status] || 'bg-zinc-100 text-zinc-500'}`}
                    >
                      {schedule.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Amount + progress */}
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(schedule.amount_due)}</p>
                      {schedule.amount_paid > 0 && (
                        <p className="text-[11px] tabular-nums text-green-600 dark:text-green-400">{formatCurrency(schedule.amount_paid)} paid</p>
                      )}
                    </div>
                    {schedule.status !== 'PAID' && (
                      <span
                        className={`mb-0.5 rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums ${
                          daysUntil < 0
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                            : daysUntil < 7
                              ? 'bg-basket-400/10 text-basket-400'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d left`}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {schedule.amount_paid > 0 && schedule.status !== 'PAID' && (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                      <span>{schedule.league.name}</span>
                      <span>Due {new Date(schedule.due_date).toLocaleDateString()}</span>
                    </div>

                    {schedule.status !== 'PAID' && (
                      <Button
                        size="sm"
                        onClick={() => handleRecordPayment(schedule.id, remainingAmount)}
                        isLoading={recordingPayment === schedule.id}
                        className="h-7 bg-basket-400 text-[11px] text-white hover:bg-basket-300"
                      >
                        Record Payment
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
