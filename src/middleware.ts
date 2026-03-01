import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(req => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Protected routes
  const protectedRoutes = ['/profile', '/dashboard', '/game-status', '/schedule']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if trying to access protected route while not logged in
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Check admin role for /dashboard/admin routes
  if (pathname.startsWith('/dashboard/admin') && isLoggedIn) {
    const userRole = req.auth?.user?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Redirect to home if trying to access login/signup while logged in
  if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const runtime = 'nodejs'

export const config = {
  matcher: ['/game-status/:path*', '/dashboard/:path*', '/schedule/:path*', '/profile/:path*', '/login', '/signup'],
}
