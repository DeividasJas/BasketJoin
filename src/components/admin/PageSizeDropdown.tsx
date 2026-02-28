'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function PageSizeDropdown({ pageSize }: { pageSize: number }) {
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

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/dashboard/games?${createQueryString('pageSize', e.target.value)}`)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        id="pageSize"
        value={pageSize}
        onChange={handlePageSizeChange}
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-600 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>
      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">per page</span>
    </div>
  )
}
