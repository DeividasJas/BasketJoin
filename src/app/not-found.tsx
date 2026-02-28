import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">Page not found</p>
      <Button asChild variant="outline">
        <Link href="/schedule">Go to Schedule</Link>
      </Button>
    </div>
  )
}
