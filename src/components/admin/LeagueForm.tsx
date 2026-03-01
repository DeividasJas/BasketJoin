'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, X } from 'lucide-react'
import { toast } from 'sonner'
import { createLeague, updateLeague } from '@/actions/leagueActions'

interface LeagueFormProps {
  leagueId?: string
  initialData?: {
    name: string
    description?: string
    locationId: number
    startDate: string
    endDate: string
    gymRentalCost: number
    guestFeePerGame: number
    paymentDueDates: string[]
    minPlayers?: number
    maxPlayers?: number
    gameType?: string
    gameDescription?: string
  }
  allLocations: Array<{ id: number; name: string; address: string; city: string }>
}

export default function LeagueForm({ leagueId, initialData, allLocations }: LeagueFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    locationId: initialData?.locationId?.toString() || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    gymRentalCost: initialData?.gymRentalCost ? (initialData.gymRentalCost / 100).toString() : '',
    guestFeePerGame: initialData?.guestFeePerGame ? (initialData.guestFeePerGame / 100).toString() : '',
    paymentDueDates: initialData?.paymentDueDates || [],
    minPlayers: initialData?.minPlayers?.toString() || '10',
    maxPlayers: initialData?.maxPlayers?.toString() || '',
    gameType: initialData?.gameType || '',
    gameDescription: initialData?.gameDescription || '',
  })

  const [newDueDate, setNewDueDate] = useState('')

  const handleAddDueDate = () => {
    if (!newDueDate) {
      toast.error('Please select a date')
      return
    }

    if (formData.paymentDueDates.includes(newDueDate)) {
      toast.error('This date is already added')
      return
    }

    setFormData({
      ...formData,
      paymentDueDates: [...formData.paymentDueDates, newDueDate].sort(),
    })
    setNewDueDate('')
  }

  const handleRemoveDueDate = (date: string) => {
    setFormData({
      ...formData,
      paymentDueDates: formData.paymentDueDates.filter(d => d !== date),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate
      if (!formData.locationId) {
        toast.error('Please select a location')
        setLoading(false)
        return
      }

      if (formData.paymentDueDates.length === 0) {
        toast.error('Please add at least one payment due date')
        setLoading(false)
        return
      }

      const gymRentalCents = Math.round(parseFloat(formData.gymRentalCost) * 100)
      const guestFeeCents = Math.round(parseFloat(formData.guestFeePerGame) * 100)

      if (leagueId) {
        // Update existing league
        const result = await updateLeague(leagueId, {
          name: formData.name,
          description: formData.description || undefined,
          locationId: parseInt(formData.locationId),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          gymRentalCost: gymRentalCents,
          guestFeePerGame: guestFeeCents,
          paymentDueDates: formData.paymentDueDates,
          minPlayers: formData.minPlayers ? parseInt(formData.minPlayers) : undefined,
          maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : undefined,
          gameType: formData.gameType || undefined,
          gameDescription: formData.gameDescription || undefined,
        })

        if (result.success) {
          toast.success(result.message)
          router.push(`/dashboard/leagues/${leagueId}`)
        } else {
          toast.error(result.message)
        }
      } else {
        // Create new league
        const result = await createLeague({
          name: formData.name,
          description: formData.description || undefined,
          locationId: parseInt(formData.locationId),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          gymRentalCost: gymRentalCents,
          guestFeePerGame: guestFeeCents,
          paymentDueDates: formData.paymentDueDates,
          minPlayers: formData.minPlayers ? parseInt(formData.minPlayers) : undefined,
          maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : undefined,
          gameType: formData.gameType || undefined,
          gameDescription: formData.gameDescription || undefined,
        })

        if (result.success && result.league) {
          toast.success(result.message)
          router.push(`/dashboard/leagues/${result.league.id}`)
        } else {
          toast.error(result.message)
        }
      }
    } catch (error) {
      console.error('Error submitting league:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500'
  const labelClasses = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Basic Information</p>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="locationId" className={labelClasses}>
              Location
            </label>
            <select
              id="locationId"
              value={formData.locationId}
              onChange={e => setFormData({ ...formData, locationId: e.target.value })}
              required
              disabled={!!leagueId}
              className={`${inputClasses} disabled:opacity-50`}
            >
              <option value="">Select a location</option>
              {allLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name} - {location.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className={labelClasses}>
              League Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Tuesday Night Basketball - Winter 2025"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClasses}>
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the league..."
              className={inputClasses}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className={labelClasses}>
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="endDate" className={labelClasses}>
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                required
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Game Settings</p>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="minPlayers" className={labelClasses}>
                Minimum Players
              </label>
              <input
                type="number"
                id="minPlayers"
                value={formData.minPlayers}
                onChange={e => setFormData({ ...formData, minPlayers: e.target.value })}
                min="1"
                placeholder="10"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="maxPlayers" className={labelClasses}>
                Maximum Players (optional)
              </label>
              <input
                type="number"
                id="maxPlayers"
                value={formData.maxPlayers}
                onChange={e => setFormData({ ...formData, maxPlayers: e.target.value })}
                min="1"
                placeholder="20"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label htmlFor="gameType" className={labelClasses}>
              Game Type (optional)
            </label>
            <input
              type="text"
              id="gameType"
              value={formData.gameType}
              onChange={e => setFormData({ ...formData, gameType: e.target.value })}
              placeholder="e.g., 5v5, Full Court"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="gameDescription" className={labelClasses}>
              Game Description (optional)
            </label>
            <textarea
              id="gameDescription"
              value={formData.gameDescription}
              onChange={e => setFormData({ ...formData, gameDescription: e.target.value })}
              rows={2}
              placeholder="Additional game details..."
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Pricing</p>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="gymRentalCost" className={labelClasses}>
              Total Gym Rental Cost
            </label>
            <input
              type="number"
              id="gymRentalCost"
              value={formData.gymRentalCost}
              onChange={e => setFormData({ ...formData, gymRentalCost: e.target.value })}
              required
              min="0"
              step="0.01"
              placeholder="600.00"
              className={inputClasses}
            />
            <p className="mt-1 text-[11px] text-zinc-400">Total cost for all games in this league</p>
          </div>

          <div>
            <label htmlFor="guestFeePerGame" className={labelClasses}>
              Guest Fee Per Game
            </label>
            <input
              type="number"
              id="guestFeePerGame"
              value={formData.guestFeePerGame}
              onChange={e => setFormData({ ...formData, guestFeePerGame: e.target.value })}
              required
              min="0"
              step="0.01"
              placeholder="5.00"
              className={inputClasses}
            />
            <p className="mt-1 text-[11px] text-zinc-400">Fee charged to non-members per game</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Payment Schedule</p>

        <div className="flex gap-2">
          <div className="flex-1">
            <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className={inputClasses} />
          </div>
          <Button
            type="button"
            onClick={handleAddDueDate}
            variant="ghost"
            className="h-auto border border-zinc-200 text-xs text-zinc-600 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Add Date
          </Button>
        </div>

        {formData.paymentDueDates.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">No payment due dates added yet. Add at least one due date.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {formData.paymentDueDates.map(date => (
              <div
                key={date}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <span className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                  {new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <button type="button" onClick={() => handleRemoveDueDate(date)} className="text-red-500 hover:text-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-zinc-400">
          Members will be charged in installments on these dates. The total cost will be split equally across all payment dates.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={loading} className="flex-1 bg-basket-400 text-white hover:bg-basket-300">
          {leagueId ? 'Update League' : 'Create League'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
          className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
