'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface ConflictGame {
  id: number
  game_date: Date
}

interface RecurringGamePreviewProps {
  dates: Date[]
  conflicts: ConflictGame[]
  locationName: string
}

export default function RecurringGamePreview({ dates, conflicts, locationName }: RecurringGamePreviewProps) {
  const [showAllDates, setShowAllDates] = useState(false)

  if (dates.length === 0) {
    return null
  }

  const conflictDates = new Set(conflicts.map(c => new Date(c.game_date).toISOString()))

  const hasConflicts = conflicts.length > 0
  const displayDates = showAllDates ? dates : dates.slice(0, 5)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isConflict = (date: Date) => {
    return conflictDates.has(new Date(date).toISOString())
  }

  return (
    <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Preview</p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="tabular-nums">{dates.length}</span> game{dates.length !== 1 ? 's' : ''} at{' '}
          <span className="font-medium text-zinc-600 dark:text-zinc-300">{locationName}</span>
        </p>
      </div>

      {/* Conflict Warning */}
      {hasConflicts && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-500/5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
          <div className="text-xs">
            <p className="font-medium text-red-600 dark:text-red-400">
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
            </p>
            <p className="text-red-500/80 dark:text-red-400/70">Conflicting games will be skipped during creation</p>
          </div>
        </div>
      )}

      {/* Dates List */}
      <div className="flex flex-col gap-1">
        {displayDates.map((date, index) => {
          const conflict = isConflict(date)
          return (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                conflict ? 'bg-red-50 dark:bg-red-500/5' : 'bg-green-50 dark:bg-green-500/5'
              }`}
            >
              {conflict ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-400" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500 dark:text-green-400" />
              )}
              <span className={`tabular-nums ${conflict ? 'text-red-600 dark:text-red-300' : 'text-zinc-700 dark:text-zinc-300'}`}>{formatDate(date)}</span>
              {conflict && <span className="ml-auto text-[10px] text-red-500 dark:text-red-400">Already exists</span>}
            </div>
          )
        })}
      </div>

      {/* Show More Button */}
      {dates.length > 5 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAllDates(!showAllDates)}
          className="mt-2 h-7 w-full text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {showAllDates ? 'Show less' : `View all ${dates.length} dates`}
        </Button>
      )}
    </div>
  )
}
