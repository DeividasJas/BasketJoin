'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createLocation, updateLocation } from '@/actions/adminLocationActions'
import { Button } from '@/components/ui/button'

type Location = {
  id: number
  name: string
  address: string
  city: string
  description: string | null
  capacity: number | null
  court_count: number
  price_per_game: number | null
}

type LocationFormProps = {
  mode: 'create' | 'edit'
  location?: Location
}

export default function LocationForm({ mode, location }: LocationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: location?.name || '',
    address: location?.address || '',
    city: location?.city || '',
    description: location?.description || '',
    capacity: location?.capacity?.toString() || '',
    court_count: location?.court_count.toString() || '1',
    price_per_game: location?.price_per_game?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        description: formData.description || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        court_count: parseInt(formData.court_count),
        price_per_game: formData.price_per_game ? parseInt(formData.price_per_game) : undefined,
      }

      const result = mode === 'create' ? await createLocation(data) : await updateLocation(location!.id, data)

      if (result.success) {
        toast.success(result.message)
        router.push('/dashboard/locations')
      } else {
        toast.error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Location Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Downtown Basketball Court"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Address */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          required
          placeholder="e.g., 123 Main Street"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* City */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.city}
          onChange={e => setFormData({ ...formData, city: e.target.value })}
          required
          placeholder="e.g., New York"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Court Count */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Number of Courts <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.court_count}
          onChange={e => setFormData({ ...formData, court_count: e.target.value })}
          required
          min="1"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      {/* Capacity */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Venue Capacity (optional)</label>
        <input
          type="number"
          value={formData.capacity}
          onChange={e => setFormData({ ...formData, capacity: e.target.value })}
          min="10"
          placeholder="Maximum number of players"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Price per game */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Price per Game (optional)</label>
        <input
          type="number"
          value={formData.price_per_game}
          onChange={e => setFormData({ ...formData, price_per_game: e.target.value })}
          min="0"
          placeholder="Cost in dollars"
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
          placeholder="Add details about parking, facilities, access instructions..."
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
        <Button type="submit" isLoading={loading} className="flex-1 bg-basket-400 text-white hover:bg-basket-300">
          {mode === 'create' ? 'Create Location' : 'Update Location'}
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          variant="ghost"
          className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
