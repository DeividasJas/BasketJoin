'use client'

import { useState, useEffect, Fragment } from 'react'
import { getGameByIdAndLocation } from '@/actions/gameActions'
import PlayerCard from './playerCard'
import { AnimatePresence, motion } from 'framer-motion'
import { CancelRegistrationBtn } from './cancelRegistrationBtn'
import RegistrationBtn from './registrationBtn'
import { toast } from 'sonner'
import { IsActivePlayer, Players } from '@/types/prismaTypes'

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
}

function SpotsProgressBar({ current, min, max }: { current: number; min: number; max: number }) {
  const fillPercent = Math.min((current / max) * 100, 100)
  const minPercent = (min / max) * 100

  return (
    <div className="mb-5 mt-3">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700/60">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-basket-400"
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Min players marker */}
        <div className="absolute top-0 h-full w-px bg-zinc-400 dark:bg-zinc-500" style={{ left: `${minPercent}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
        <span>{current} joined</span>
        <span>{min} min</span>
      </div>
    </div>
  )
}

function MilestoneMarker({ label, variant }: { label: string; variant: 'warning' | 'success' }) {
  const lineColor = variant === 'success' ? 'border-basket-400/40' : 'border-zinc-300 dark:border-zinc-600'
  const textColor = variant === 'success' ? 'text-basket-400' : 'text-zinc-400 dark:text-zinc-500'

  return (
    <motion.div className="col-span-full flex items-center gap-3 py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className={`h-px flex-1 border-t border-dashed ${lineColor}`} />
      <span className={`text-[10px] font-medium uppercase tracking-[0.15em] ${textColor}`}>{label}</span>
      <div className={`h-px flex-1 border-t border-dashed ${lineColor}`} />
    </motion.div>
  )
}

export default function PlayersList({
  gameId,
  isLoggedIn,
  isActivePlayer,
  participantsData,
  maxPlayers = 12,
  minPlayers = 10,
  gameDate,
}: {
  gameId: number
  isLoggedIn?: boolean
  isActivePlayer: IsActivePlayer
  participantsData: Players
  maxPlayers?: number
  minPlayers?: number
  gameDate?: Date
}) {
  const [change, setChange] = useState(false)
  const [players, setPlayers] = useState<Players>(participantsData)
  const [isActive, setIsPlaying] = useState<IsActivePlayer>(isActivePlayer)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { success, participantsData, isActivePlayer } = await getGameByIdAndLocation(gameId)
        if (!success) {
          return
        } else {
          setPlayers(participantsData)
          setIsPlaying(isActivePlayer)
        }
      } catch {
        toast.error('Failed to load players')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [change, gameId])

  return (
    <div>
      {/* Section header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">Roster</h2>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">·</span>
          <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {isLoading ? '—' : players?.length || 0} / {maxPlayers}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {!isLoading && players && <SpotsProgressBar current={players.length} min={minPlayers} max={maxPlayers} />}

      {/* Player grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-basket-400 dark:border-zinc-600 dark:border-t-basket-400" />
        </div>
      ) : (
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-4 gap-x-4 gap-y-4 xs:grid-cols-5 sm:grid-cols-6">
          <AnimatePresence>
            {players &&
              players.map((player, index) => {
                const showMinMarker = index === minPlayers
                const showMaxMarker = index === maxPlayers

                return (
                  <Fragment key={player.id}>
                    {showMinMarker && <MilestoneMarker label={`${minPlayers} minimum`} variant="success" />}
                    {showMaxMarker && <MilestoneMarker label={`${maxPlayers} full`} variant="warning" />}
                    <motion.div custom={index} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" className="flex justify-center">
                      <PlayerCard player={player} />
                    </motion.div>
                  </Fragment>
                )
              })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Action buttons — hidden if game has started or passed */}
      {(!gameDate || gameDate > new Date()) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <RegistrationBtn setChange={setChange} isActive={isActive} gameId={gameId} disabled={!isLoggedIn} />
          <CancelRegistrationBtn setChange={setChange} isActive={isActive} gameId={gameId} />
        </div>
      )}
    </div>
  )
}
