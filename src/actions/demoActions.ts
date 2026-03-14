'use server'

import { signIn } from '@/auth'
import { ensureDemoUser, wipeDemoData, seedDemoData } from '@/lib/seedDemo'

export async function loginAsDemo() {
  // 1. Ensure demo user exists
  const demoUserId = await ensureDemoUser()

  // 2. Wipe all existing demo data
  await wipeDemoData(demoUserId)

  // 3. Seed fresh demo data
  await seedDemoData(demoUserId)

  // 4. Sign in as demo user — server-side signIn throws NEXT_REDIRECT
  await signIn('credentials', {
    email: 'demo@basketjoin.com',
    password: 'demo-password-not-used',
    redirectTo: '/schedule',
  })
}
