'use server'

import { signIn } from '@/auth'
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo'
import { ensureDemoUser, wipeDemoData, seedDemoData } from '@/lib/seedDemo'

export async function loginAsDemo() {
  const demoUserId = await ensureDemoUser()
  await wipeDemoData(demoUserId)
  await seedDemoData(demoUserId)

  // Server-side signIn throws NEXT_REDIRECT to perform the redirect
  await signIn('credentials', {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    redirectTo: '/schedule',
  })
}
