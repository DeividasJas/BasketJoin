'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Links } from '@/types/navLinks'

export default function Header({ isAuthenticated, navLinksArray, userRole, isDemo }: { isAuthenticated: boolean; navLinksArray: Links[]; userRole: string; isDemo: boolean }) {
  const pathname = usePathname()

  const navLinks = navLinksArray.map(({ href, label, requiredRoles }) => {
    if (href == '/') {
      return (
        <li key={href} className="flex items-center">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image src={'/basketball.svg'} width="28" height="28" alt="basketball" priority={true} />
          </Link>
        </li>
      )
    }

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(userRole)) {
        return null
      }
    }

    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href as string))

    return (
      <li key={href as string}>
        <Link
          href={href}
          className={`relative px-3 py-2 text-[13px] font-medium transition-colors sm:px-4 ${
            isActive ? 'text-basket-400' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          {label}
          {isActive && <span className="absolute inset-x-1 -bottom-[13px] h-[2px] rounded-full bg-basket-400 sm:inset-x-2" />}
        </Link>
      </li>
    )
  })

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 order-last border-t border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sm:sticky sm:top-0 sm:order-first sm:border-b sm:border-t-0">
      <nav className="mx-auto max-w-[900px]">
        <ul className="flex items-center justify-around py-3 sm:py-4">
          {navLinks}
          {isDemo && (
            <li>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Demo Mode
              </span>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
