'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { registerToGame } from '@/actions/gameActions'
import { IsActivePlayer } from '@/types/prismaTypes'
import { usePathname, useRouter } from 'next/navigation'

export default function RegistrationBtn({
  gameId,
  isActive,
  setChange = () => {},
  props,
  disabled,
}: {
  gameId: number
  isActive: IsActivePlayer
  setChange?: React.Dispatch<React.SetStateAction<boolean>>
  props?: string
  disabled?: boolean
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleClick = async () => {
    try {
      setIsLoading(prev => !prev)
      const { success, message } = await registerToGame(gameId)

      if (!success) {
        toast.error(message)
        return
      }

      toast.success(message)

      if (pathname !== `/game-status/${gameId}`) {
        setTimeout(() => {
          router.push(`/game-status/${gameId}`)
        }, 500)
      } else {
        setChange(prev => !prev)
      }

      router.refresh()
    } catch {
      toast.error('Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className={`bg-basket-400 px-6 text-white shadow-sm transition-all hover:bg-basket-300 hover:shadow-md disabled:bg-basket-400/40 ${props}`}
      disabled={isActive || isLoading || disabled}
      onClick={handleClick}
      isLoading={isLoading}
      variant="default"
    >
      Join Game
    </Button>
  )
}
