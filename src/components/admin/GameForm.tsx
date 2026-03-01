'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createGame, updateGame } from '@/actions/adminGameActions'
import { previewRecurringDates, checkRecurringConflicts, createRecurringGames } from '@/actions/recurringGameActions'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import RecurringGamePreview from './RecurringGamePreview'
import { formatInTimeZone } from 'date-fns-tz'

type Location = {
  id: number
  name: string
  address: string
  city: string
}

type Game = {
  id: number
  game_date: Date
  location_id: number
  max_players: number | null
  min_players: number
  description: string | null
  game_type: string | null
  league_id: string | null
}

type GameFormProps = {
  locations: Location[]
  mode: 'create' | 'edit'
  game?: Game
}

export default function GameForm({ locations, mode, game }: GameFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [applyToSeries, setApplyToSeries] = useState(false)

  // Initialize form with game data or defaults
  const [formData, setFormData] = useState({
    game_date: game ? formatInTimeZone(game.game_date, 'UTC', "yyyy-MM-dd'T'HH:mm") : '',
    location_id: game?.location_id.toString() || '',
    max_players: game?.max_players?.toString() || '',
    min_players: game?.min_players.toString() || '10',
    description: game?.description || '',
    game_type: game?.game_type || '',
  })

  // Recurring game state (only for create mode)
  const [isRecurring, setIsRecurring] = useState(false)
  const [seriesName, setSeriesName] = useState('')
  const [recurrencePattern, setRecurrencePattern] = useState<'weekly' | 'monthly' | 'custom'>('weekly')
  const [customInterval, setCustomInterval] = useState('7')
  const [endType, setEndType] = useState<'count' | 'date'>('count')
  const [occurrenceCount, setOccurrenceCount] = useState('4')
  const [endDate, setEndDate] = useState('')
  const [previewDates, setPreviewDates] = useState<Date[]>([])
  const [conflicts, setConflicts] = useState<any[]>([])

  // Generate preview when recurring options change
  useEffect(() => {
    if (!isRecurring || mode !== 'create' || !formData.game_date || !formData.location_id) {
      setPreviewDates([])
      setConflicts([])
      return
    }

    const generatePreview = async () => {
      const result = await previewRecurringDates(new Date(formData.game_date), {
        pattern: recurrencePattern,
        customInterval: recurrencePattern === 'custom' ? parseInt(customInterval) : undefined,
        endType,
        occurrenceCount: endType === 'count' ? parseInt(occurrenceCount) : undefined,
        endDate: endType === 'date' && endDate ? new Date(endDate) : undefined,
      })

      if (result.success && result.dates.length > 0) {
        setPreviewDates(result.dates)

        // Check for conflicts
        const conflictCheck = await checkRecurringConflicts(result.dates, parseInt(formData.location_id))

        if (conflictCheck.success) {
          setConflicts(conflictCheck.conflicts)
        }
      }
    }

    generatePreview()
  }, [isRecurring, formData.game_date, formData.location_id, recurrencePattern, customInterval, endType, occurrenceCount, endDate, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRecurring && mode === 'create') {
        // Validate series name
        if (!seriesName.trim()) {
          toast.error('Series name is required for recurring games')
          setLoading(false)
          return
        }

        // Recurring game creation
        const result = await createRecurringGames({
          seriesName: seriesName.trim(),
          game_date: new Date(formData.game_date),
          location_id: parseInt(formData.location_id),
          max_players: formData.max_players ? parseInt(formData.max_players) : undefined,
          min_players: parseInt(formData.min_players),
          description: formData.description || undefined,
          game_type: formData.game_type || undefined,
          recurrence: {
            pattern: recurrencePattern,
            customInterval: recurrencePattern === 'custom' ? parseInt(customInterval) : undefined,
            endType,
            occurrenceCount: endType === 'count' ? parseInt(occurrenceCount) : undefined,
            endDate: endType === 'date' && endDate ? new Date(endDate) : undefined,
          },
        })

        if (result.success) {
          toast.success(result.message)
          router.push('/dashboard/games')
        } else {
          toast.error(result.message)
        }
      } else {
        // Single game creation or edit
        const data = {
          game_date: new Date(formData.game_date),
          location_id: parseInt(formData.location_id),
          max_players: formData.max_players ? parseInt(formData.max_players) : undefined,
          min_players: parseInt(formData.min_players),
          description: formData.description || undefined,
          game_type: formData.game_type || undefined,
        }

        const result = mode === 'create' ? await createGame(data) : await updateGame(game!.id, data, applyToSeries)

        if (result.success) {
          toast.success(result.message)
          router.push('/dashboard/games')
        } else {
          toast.error(result.message)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
      {/* Date and Time */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Date and Time (UTC) <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={formData.game_date}
          onChange={e => setFormData({ ...formData, game_date: e.target.value })}
          required
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      {/* Recurring Game Toggle (only in create mode) */}
      {mode === 'create' && (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Switch id="recurring-toggle" checked={isRecurring} onCheckedChange={setIsRecurring} />
          <label htmlFor="recurring-toggle" className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Make this a recurring game
          </label>
        </div>
      )}

      {mode === 'edit' && game?.league_id && (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <Switch id="series-update-toggle" checked={applyToSeries} onCheckedChange={setApplyToSeries} />
          <label htmlFor="series-update-toggle" className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Apply to all subsequent games in the series
          </label>
        </div>
      )}

      {/* Recurring Options */}
      {isRecurring && mode === 'create' && (
        <div className="flex flex-col gap-4 rounded-lg border border-basket-400/20 bg-basket-400/5 p-4 dark:border-basket-400/15 dark:bg-basket-400/5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-basket-400">Recurring Schedule</p>

          {/* Series Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              Series Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={seriesName}
              onChange={e => setSeriesName(e.target.value)}
              maxLength={50}
              placeholder="e.g., Monday Night Basketball"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              required
            />
            <p className="mt-1 text-[11px] tabular-nums text-zinc-400">{seriesName.length}/50 characters</p>
          </div>

          {/* Pattern Selection */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              Repeat Pattern <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="pattern"
                  value="weekly"
                  checked={recurrencePattern === 'weekly'}
                  onChange={e => setRecurrencePattern(e.target.value as 'weekly' | 'monthly' | 'custom')}
                  className="h-3.5 w-3.5 accent-basket-400"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Weekly</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="pattern"
                  value="monthly"
                  checked={recurrencePattern === 'monthly'}
                  onChange={e => setRecurrencePattern(e.target.value as 'weekly' | 'monthly' | 'custom')}
                  className="h-3.5 w-3.5 accent-basket-400"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Monthly</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="pattern"
                  value="custom"
                  checked={recurrencePattern === 'custom'}
                  onChange={e => setRecurrencePattern(e.target.value as 'weekly' | 'monthly' | 'custom')}
                  className="h-3.5 w-3.5 accent-basket-400"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Custom</span>
              </label>
            </div>
          </div>

          {/* Custom Interval */}
          {recurrencePattern === 'custom' && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                Repeat every (days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={customInterval}
                onChange={e => setCustomInterval(e.target.value)}
                min="1"
                max="365"
                required
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              <p className="mt-1 text-[11px] text-zinc-400">Between 1 and 365 days</p>
            </div>
          )}

          {/* End Type Selection */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
              Ends <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  value="count"
                  checked={endType === 'count'}
                  onChange={e => setEndType(e.target.value as 'count' | 'date')}
                  className="h-3.5 w-3.5 accent-basket-400"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">After X occurrences</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  value="date"
                  checked={endType === 'date'}
                  onChange={e => setEndType(e.target.value as 'count' | 'date')}
                  className="h-3.5 w-3.5 accent-basket-400"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">On date</span>
              </label>
            </div>
          </div>

          {/* Occurrence Count */}
          {endType === 'count' && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                Number of games <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={occurrenceCount}
                onChange={e => setOccurrenceCount(e.target.value)}
                min="1"
                max="100"
                required
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              <p className="mt-1 text-[11px] text-zinc-400">Maximum 100 games</p>
            </div>
          )}

          {/* End Date */}
          {endType === 'date' && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                End date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={formData.game_date ? formData.game_date.split('T')[0] : ''}
                required
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>
          )}

          {/* Preview */}
          {previewDates.length > 0 && (
            <RecurringGamePreview
              dates={previewDates}
              conflicts={conflicts}
              locationName={locations.find(l => l.id === parseInt(formData.location_id))?.name || ''}
            />
          )}
        </div>
      )}

      {/* Location */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Location <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.location_id}
          onChange={e => setFormData({ ...formData, location_id: e.target.value })}
          required
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <option value="">Select a location</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name} - {location.city}
            </option>
          ))}
        </select>
      </div>

      {/* Min Players */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Minimum Players <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.min_players}
          onChange={e => setFormData({ ...formData, min_players: e.target.value })}
          required
          min="2"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      {/* Max Players */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Maximum Players (optional)</label>
        <input
          type="number"
          value={formData.max_players}
          onChange={e => setFormData({ ...formData, max_players: e.target.value })}
          min="2"
          placeholder="No limit"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Game Type */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Game Type (optional)</label>
        <input
          type="text"
          value={formData.game_type}
          onChange={e => setFormData({ ...formData, game_type: e.target.value })}
          placeholder="e.g., Pickup, Tournament, League"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Description (optional)</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="Add any special instructions or notes..."
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
        <Button type="submit" isLoading={loading} className="flex-1 bg-basket-400 text-white hover:bg-basket-300">
          {mode === 'create' ? 'Create Game' : 'Update Game'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
