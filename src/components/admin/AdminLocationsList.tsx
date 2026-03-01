'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { toggleLocationActive, deleteLocation, forceDeleteLocation } from '@/actions/adminLocationActions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PageSizeDropdown from './PageSizeDropdown'
import { MapPin, Users, Trophy, DollarSign, Gamepad2, Edit, RotateCcw, CheckCircle, Trash2 } from 'lucide-react'

type Location = {
  id: number
  name: string
  address: string
  city: string
  description: string | null
  capacity: number | null
  court_count: number
  price_per_game: number | null
  is_active: boolean
  image_url: string | null
  _count: {
    games: number
  }
}

export default function AdminLocationsList({
  locations,
  cities,
  totalLocations,
  pageSize,
}: {
  locations: Location[]
  cities: string[]
  totalLocations: number
  pageSize: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<number | null>(null)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams],
  )

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    router.push(`/dashboard/locations?${createQueryString(e.target.name, e.target.value)}`)
  }

  const handleToggleActive = async (locationId: number) => {
    setLoading(locationId)
    const result = await toggleLocationActive(locationId)
    setLoading(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = async (locationId: number) => {
    if (!confirm('Are you sure you want to delete this location?')) {
      return
    }

    setLoading(locationId)
    const result = await deleteLocation(locationId)
    setLoading(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else if (result.requiresConfirmation) {
      if (confirm(result.message + '\n\nAre you sure you want to permanently delete?')) {
        setLoading(locationId)
        const forceResult = await forceDeleteLocation(locationId)
        setLoading(null)

        if (forceResult.success) {
          toast.success(forceResult.message)
          router.refresh()
        } else {
          toast.error(forceResult.message)
        }
      }
    } else {
      toast.error(result.message)
    }
  }

  const selectClasses =
    'rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          name="search"
          placeholder="Search locations..."
          defaultValue={searchParams.get('search') || ''}
          onChange={handleFilterChange}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <select name="isActive" value={searchParams.get('isActive') || 'all'} onChange={handleFilterChange} className={selectClasses}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select name="city" value={searchParams.get('city') || ''} onChange={handleFilterChange} className={selectClasses}>
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <PageSizeDropdown pageSize={pageSize} />
        </div>
      </div>

      <p className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
        {locations.length} of {totalLocations}
      </p>

      <div className="flex flex-col gap-2.5">
        {locations.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">No locations found</p>
        ) : (
          locations.map(location => (
            <div
              key={location.id}
              className={`group relative overflow-hidden rounded-xl border bg-white transition-all hover:shadow-sm dark:bg-zinc-900 ${
                location.is_active
                  ? 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700/60 dark:hover:border-zinc-600'
                  : 'border-red-200/60 opacity-60 dark:border-red-900/30'
              }`}
            >
              {/* Active/inactive accent bar */}
              <div className={`absolute left-0 top-0 h-full w-1 ${location.is_active ? 'bg-green-500' : 'bg-red-400'}`} />

              <div className="py-3.5 pl-5 pr-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">{location.name}</p>
                      {!location.is_active && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500 dark:bg-red-500/10 dark:text-red-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                      {location.address}, {location.city}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-3 flex flex-wrap gap-3">
                  {location.capacity && (
                    <div className="rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800/60">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Capacity</p>
                      <p className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-200">{location.capacity}</p>
                    </div>
                  )}
                  <div className="rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800/60">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Courts</p>
                    <p className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-200">{location.court_count}</p>
                  </div>
                  {location.price_per_game && (
                    <div className="rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800/60">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Per Game</p>
                      <p className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-200">${location.price_per_game}</p>
                    </div>
                  )}
                  <div className="rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800/60">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Games</p>
                    <p className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-200">{location._count.games}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <Button asChild size="sm" className="h-7 bg-basket-400 text-[11px] text-white hover:bg-basket-300">
                    <Link href={`/dashboard/locations/${location.id}/edit`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    <Link href={`/dashboard/locations/${location.id}/games`}>
                      <Gamepad2 className="mr-1 h-3 w-3" />
                      Games ({location._count.games})
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(location.id)}
                    isLoading={loading === location.id}
                    className="h-7 text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {location.is_active ? (
                      <>
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Activate
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(location.id)}
                    isLoading={loading === location.id}
                    className="ml-auto h-7 text-[11px] text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
