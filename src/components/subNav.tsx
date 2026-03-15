'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Links } from '@/types/navLinks'

export default function SubNav({ links }: { links: Links[] }) {
  const pathname = usePathname()

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-700/60">
      <div className="scrollbar-none -mb-px flex justify-center gap-0 overflow-x-auto sm:justify-start">
        {links.map(link => {
          const href = link.href as string
          const isExactRoot = links.some(l => (l.href as string).startsWith(href + '/'))
          const isActive = isExactRoot ? pathname === href : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`relative whitespace-nowrap px-4 py-3 text-center text-[13px] font-medium transition-colors ${
                isActive ? 'text-basket-400' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              {link.label}
              {isActive && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-basket-400" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
