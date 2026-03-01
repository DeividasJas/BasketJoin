import Image from 'next/image'
import { Users } from '@/generated/prisma/client/client'

export default function PlayerCard({ player }: { player: Users }) {
  const name = [player.given_name, player.family_name].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-zinc-200/80 dark:bg-zinc-700 dark:ring-zinc-700/80 sm:h-14 sm:w-14">
        <Image src={player.picture || '/avatar.svg'} width={56} height={56} priority={true} alt={name || 'Player'} className="h-full w-full object-cover" />
      </div>
      <span className="max-w-[72px] truncate text-center text-[11px] leading-tight text-zinc-600 dark:text-zinc-400">{name}</span>
    </div>
  )
}
