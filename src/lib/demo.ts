import { cache } from 'react'
import { auth } from '@/auth'

export const DEMO_EMAIL = 'demo@basketjoin.com'
export const DEMO_PASSWORD = 'demo-password-not-used'

/**
 * Returns whether the current session user is a demo user.
 * Memoized per request via React cache() to avoid redundant auth() calls.
 */
export const isDemoUser = cache(async (): Promise<boolean> => {
  const session = await auth()
  return session?.user?.is_demo ?? false
})
