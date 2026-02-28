'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cancelRegistration } from '@/actions/gameActions'
import { IsActivePlayer } from '@/types/prismaTypes'
import { useRouter } from 'next/navigation'

export function CancelRegistrationBtn({
  gameId,
  isActive,
  setChange = () => {},
  props,
}: {
  gameId: number
  isActive: IsActivePlayer
  setChange?: React.Dispatch<React.SetStateAction<boolean>>
  props?: string
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleClick = async () => {
    try {
      setIsLoading(true)
      const { success, message } = await cancelRegistration(gameId)

      if (!success) {
        toast.error(message)
      } else {
        setChange(prev => !prev)
        toast.success(message)
        router.refresh()
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      disabled={!isActive || isLoading}
      variant="ghost"
      isLoading={isLoading}
      onClick={handleClick}
      className={`px-4 text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:text-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 ${props}`}
    >
      Cancel
    </Button>
  )
}
