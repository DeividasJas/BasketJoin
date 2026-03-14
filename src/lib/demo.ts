'use server'

import { auth } from '@/auth'

export const DEMO_EMAIL = 'demo@basketjoin.com'

/**
 * Returns whether the current session user is a demo user.
 */
export async function isDemoUser(): Promise<boolean> {
  const session = await auth()
  return session?.user?.is_demo ?? false
}

/**
 * Returns the is_demo filter value for Prisma queries.
 * Demo users see is_demo: true, real users see is_demo: false.
 */
export async function demoFilter(): Promise<boolean> {
  return isDemoUser()
}
