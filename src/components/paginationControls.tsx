'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
}

export default function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams],
  )

  const handlePageChange = (page: number) => {
    router.push(`/dashboard/games?${createQueryString('page', String(page))}`)
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-20 text-xs text-zinc-500 hover:text-zinc-800 disabled:text-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200 dark:disabled:text-zinc-600"
      >
        Previous
      </Button>
      <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-20 text-xs text-zinc-500 hover:text-zinc-800 disabled:text-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200 dark:disabled:text-zinc-600"
      >
        Next
      </Button>
    </div>
  )
}
