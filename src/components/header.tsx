'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Links } from '@/types/navLinks'

export default function Header({ isAuthenticated, navLinksArray, userRole }: { isAuthenticated: boolean; navLinksArray: Links[]; userRole: string }) {
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
          className={`relative whitespace-nowrap px-2 py-2 text-[12px] font-medium transition-colors sm:px-4 sm:text-[13px] ${
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
        <ul className="flex items-center justify-around overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:py-4 [&::-webkit-scrollbar]:hidden">
          {navLinks}
        </ul>
      </nav>
    </header>
  )
}
