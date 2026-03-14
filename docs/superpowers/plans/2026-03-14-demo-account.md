# Demo Account System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully isolated demo account with one-click login, real persistence, and data reset — allowing portfolio visitors to try all features including admin.

**Architecture:** Add `is_demo` boolean to 9 Prisma models. Demo user sees only demo-scoped data; real users see only real data. On each demo login, wipe all demo data and re-seed. Helper functions centralize demo detection. Server-side signIn via NextAuth v5.

**Tech Stack:** Next.js 16, NextAuth.js v5, Prisma 7, PostgreSQL, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-14-demo-account-design.md`

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/lib/demo.ts` | `isDemoUser()` and `demoFilter()` helpers — single source of truth for demo detection |
| `src/lib/seedDemo.ts` | `wipeDemoData()` and `seedDemoData()` — cleanup and seeding in Prisma transactions |
| `src/actions/demoActions.ts` | `loginAsDemo()` server action — orchestrates wipe, seed, and signIn |

### Modified files
| File | Change summary |
|------|---------------|
| `prisma/schema.prisma` | Add `is_demo` to 9 models, update Games unique constraint |
| `src/types/next-auth.d.ts` | Add `is_demo` to Session, User, JWT types |
| `src/auth.ts` | Fetch `is_demo` in JWT callback, expose in session, guard OAuth signIn |
| `src/app/api/auth/register/route.ts` | Block `demo@basketjoin.com` registration |
| `src/app/(auth)/login/page.tsx` | Add "Try Demo" button |
| `src/app/(app)/layout.tsx` | Pass `isDemo` to Header |
| `src/components/header.tsx` | Show "Demo Mode" badge |
| `src/actions/actions.ts` | Add demo filter to 5 read functions |
| `src/actions/gameActions.ts` | Add demo filter to reads, `is_demo` flag to creates |
| `src/actions/adminGameActions.ts` | Add demo filter to reads, `is_demo` flag to creates |
| `src/actions/adminLocationActions.ts` | Add demo filter to reads, `is_demo` flag to creates |
| `src/actions/adminUserActions.ts` | Add demo filter to user queries |
| `src/actions/leagueActions.ts` | Add demo filter to reads, `is_demo` flag to creates |
| `src/actions/leagueMembershipActions.ts` | Add demo filter to reads, `is_demo` flag to creates |
| `src/actions/paymentActions.ts` | Add demo filter to reads, `is_demo` flag to creates |
| `src/actions/recurringGameActions.ts` | Add demo filter to reads, `is_demo` flag to creates |
| 10 page components under `src/app/(app)/(with-layout)/` | Add demo filter to direct Prisma queries |

---

## Chunk 1: Schema, Auth & Foundation

### Task 1: Add `is_demo` to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `is_demo` field to all 9 models**

Add `is_demo Boolean @default(false)` to each model:

```prisma
// In Users model (after is_active field, ~line 119):
is_demo            Boolean              @default(false)

// In Games model (after modified_at field, ~line 143):
is_demo            Boolean              @default(false)

// In Game_registrations model (after modified_at, ~line 168):
is_demo            Boolean              @default(false)

// In Locations model (after modified_at, ~line 185):
is_demo            Boolean              @default(false)

// In Notification model (after created_at, ~line 195):
is_demo            Boolean              @default(false)

// In League model (after modified_at, ~line 231):
is_demo            Boolean              @default(false)

// In LeagueMembership model (after modified_at, ~line 255):
is_demo            Boolean              @default(false)

// In PaymentSchedule model (after paid_at, ~line 280):
is_demo            Boolean              @default(false)

// In Payment model (after created_at, ~line 303):
is_demo            Boolean              @default(false)
```

- [ ] **Step 2: Update Games unique constraint**

Change the existing constraint at ~line 151:
```prisma
// FROM:
@@unique([game_date, location_id])
// TO:
@@unique([game_date, location_id, is_demo])
```

- [ ] **Step 3: Run migration**

Run: `npx prisma migrate dev --name add_is_demo`
Expected: Migration creates successfully, adds `is_demo` column with default `false` to all 9 tables.

- [ ] **Step 4: Generate Prisma client**

Run: `npx prisma generate`
Expected: Client regenerates with `is_demo` field on all models.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ src/generated/
git commit -m "Add is_demo field to 9 models for demo account isolation"
```

---

### Task 2: Auth type extensions

**Files:**
- Modify: `src/types/next-auth.d.ts`

- [ ] **Step 1: Add `is_demo` to all type declarations**

The file currently declares Session, User, and JWT interfaces. Add `is_demo: boolean` to each:

```typescript
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      is_demo: boolean
    } & DefaultSession['user']
  }

  interface User {
    role?: string
    is_demo?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    is_demo: boolean
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/next-auth.d.ts
git commit -m "Add is_demo to NextAuth type declarations"
```

---

### Task 3: Auth integration

**Files:**
- Modify: `src/auth.ts`

- [ ] **Step 1: Update JWT callback to fetch `is_demo`**

Replace the existing JWT callback (~lines 111-128) with a consolidated version that fetches both `role` and `is_demo` in one query:

```typescript
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.email = user.email
    token.picture = user.image
  }

  // Single DB fetch for both role and is_demo
  if (token.id && (!token.role || token.is_demo === undefined)) {
    const dbUser = await prisma.users.findUnique({
      where: { id: token.id as string },
      select: { role: true, is_demo: true },
    })
    token.role = dbUser?.role || 'PLAYER'
    token.is_demo = dbUser?.is_demo || false
  }

  return token
},
```

- [ ] **Step 2: Update session callback to expose `is_demo`**

In the session callback (~lines 129-137), add `is_demo`:

```typescript
async session({ session, token }) {
  if (token && session.user) {
    session.user.id = token.id as string
    session.user.email = token.email as string
    session.user.image = token.picture as string
    session.user.role = token.role as string
    session.user.is_demo = token.is_demo as boolean
  }
  return session
},
```

- [ ] **Step 3: Guard OAuth signIn callback against demo email**

In the signIn callback (~line 63-106), add a guard at the top of the OAuth branch:

```typescript
async signIn({ user, account }) {
  if (account?.provider === 'google' || account?.provider === 'facebook') {
    try {
      const email = user.email
      if (!email) {
        return false
      }

      // Block OAuth login for demo account email
      if (email === 'demo@basketjoin.com') {
        return false
      }

      // ... rest of existing OAuth logic
```

- [ ] **Step 4: Commit**

```bash
git add src/auth.ts
git commit -m "Add is_demo to JWT/session callbacks and guard OAuth against demo email"
```

---

### Task 4: Demo helper utilities

**Files:**
- Create: `src/lib/demo.ts`

- [ ] **Step 1: Create the demo helper file**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/demo.ts
git commit -m "Add demo helper utilities for is_demo detection and filtering"
```

---

### Task 5: Block demo email in registration

**Files:**
- Modify: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: Add guard at the top of the POST handler**

After parsing the request body and before the existing `findUnique` check, add:

```typescript
import { DEMO_EMAIL } from '@/lib/demo'

// Inside POST handler, after extracting email from body:
if (email === DEMO_EMAIL) {
  return NextResponse.json(
    { error: 'This email is reserved' },
    { status: 400 }
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/auth/register/route.ts
git commit -m "Block demo email address in registration endpoint"
```

---

## Chunk 2: Demo Login System

### Task 6: Seed data script

**Files:**
- Create: `src/lib/seedDemo.ts`

- [ ] **Step 1: Create the seed data file with wipe and seed functions**

```typescript
'use server'

import { prisma } from '@/utils/prisma'
import bcrypt from 'bcryptjs'
import { DEMO_EMAIL } from '@/lib/demo'

/**
 * Wipes all is_demo: true data in FK-safe order.
 * Keeps the demo user record itself.
 */
export async function wipeDemoData(demoUserId: string) {
  await prisma.$transaction([
    prisma.payment.deleteMany({ where: { is_demo: true } }),
    prisma.paymentSchedule.deleteMany({ where: { is_demo: true } }),
    prisma.leagueMembership.deleteMany({ where: { is_demo: true } }),
    prisma.game_registrations.deleteMany({ where: { is_demo: true } }),
    prisma.notification.deleteMany({ where: { is_demo: true } }),
    prisma.games.deleteMany({ where: { is_demo: true } }),
    prisma.league.deleteMany({ where: { is_demo: true } }),
    prisma.locations.deleteMany({ where: { is_demo: true } }),
    // Delete all demo users EXCEPT the main demo user
    prisma.users.deleteMany({
      where: { is_demo: true, id: { not: demoUserId } },
    }),
  ])
}

/**
 * Finds or creates the demo user account.
 * Returns the demo user's ID.
 */
export async function ensureDemoUser(): Promise<string> {
  let demoUser = await prisma.users.findUnique({
    where: { email: DEMO_EMAIL },
  })

  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('demo-password-not-used', 10)
    demoUser = await prisma.users.create({
      data: {
        email: DEMO_EMAIL,
        password: hashedPassword,
        given_name: 'Demo',
        family_name: 'Admin',
        role: 'ADMIN',
        is_demo: true,
      },
    })
  }

  return demoUser.id
}

/**
 * Seeds fresh demo data for a realistic demo experience.
 */
export async function seedDemoData(demoUserId: string) {
  // --- Seed Users ---
  const seedUsers = await Promise.all([
    prisma.users.create({
      data: {
        email: 'jane.player@demo.basketjoin.com',
        given_name: 'Jane',
        family_name: 'Smith',
        role: 'PLAYER',
        is_demo: true,
        password: null,
      },
    }),
    prisma.users.create({
      data: {
        email: 'mike.player@demo.basketjoin.com',
        given_name: 'Mike',
        family_name: 'Johnson',
        role: 'PLAYER',
        is_demo: true,
        password: null,
      },
    }),
    prisma.users.create({
      data: {
        email: 'sarah.player@demo.basketjoin.com',
        given_name: 'Sarah',
        family_name: 'Williams',
        role: 'PLAYER',
        is_demo: true,
        password: null,
      },
    }),
    prisma.users.create({
      data: {
        email: 'coach.tom@demo.basketjoin.com',
        given_name: 'Tom',
        family_name: 'Davis',
        role: 'ORGANIZER',
        is_demo: true,
        password: null,
      },
    }),
    prisma.users.create({
      data: {
        email: 'alex.admin@demo.basketjoin.com',
        given_name: 'Alex',
        family_name: 'Brown',
        role: 'ADMIN',
        is_demo: true,
        password: null,
      },
    }),
  ])

  const [jane, mike, sarah, tom, alex] = seedUsers
  const allPlayers = [demoUserId, jane.id, mike.id, sarah.id, tom.id, alex.id]

  // --- Seed Locations ---
  const locations = await Promise.all([
    prisma.locations.create({
      data: {
        name: 'Downtown Recreation Center',
        address: '123 Main Street',
        city: 'Springfield',
        description: 'Full-size indoor basketball court with bleachers',
        capacity: 30,
        court_count: 2,
        price_per_game: 7500, // $75.00
        is_active: true,
        is_demo: true,
      },
    }),
    prisma.locations.create({
      data: {
        name: 'Westside Community Gym',
        address: '456 Oak Avenue',
        city: 'Springfield',
        description: 'Single court gym, great for pickup games',
        capacity: 20,
        court_count: 1,
        price_per_game: 5000, // $50.00
        is_active: true,
        is_demo: true,
      },
    }),
    prisma.locations.create({
      data: {
        name: 'University Sports Complex',
        address: '789 College Road',
        city: 'Shelbyville',
        description: 'Premium facility with 3 courts and locker rooms',
        capacity: 50,
        court_count: 3,
        price_per_game: 12000, // $120.00
        is_active: true,
        is_demo: true,
      },
    }),
  ])

  const [downtown, westside, university] = locations

  // --- Date helpers ---
  const now = new Date()
  const daysFromNow = (days: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + days)
    d.setHours(19, 0, 0, 0)
    return d
  }
  const daysAgo = (days: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - days)
    d.setHours(19, 0, 0, 0)
    return d
  }

  // --- Seed League (ACTIVE) ---
  const activeLeague = await prisma.league.create({
    data: {
      name: 'Spring Basketball League 2026',
      description: 'Weekly competitive basketball league for all skill levels',
      location_id: downtown.id,
      start_date: daysAgo(30),
      end_date: daysFromNow(60),
      status: 'ACTIVE',
      gym_rental_cost: 7500,
      guest_fee_per_game: 1000,
      payment_due_dates: JSON.stringify([
        daysAgo(25).toISOString(),
        daysFromNow(5).toISOString(),
        daysFromNow(35).toISOString(),
      ]),
      min_players: 10,
      max_players: 20,
      game_type: '5v5',
      game_description: 'Full court 5v5 competitive games',
      schedule_type: 'RECURRING',
      recurring_pattern: JSON.stringify({
        frequency: 'WEEKLY',
        dayOfWeek: 3,
        time: '19:00',
      }),
      is_demo: true,
    },
  })

  // --- Seed League (UPCOMING) ---
  const upcomingLeague = await prisma.league.create({
    data: {
      name: 'Summer Shootout 2026',
      description: 'Casual summer league with 3v3 tournaments',
      location_id: university.id,
      start_date: daysFromNow(45),
      end_date: daysFromNow(120),
      status: 'UPCOMING',
      gym_rental_cost: 12000,
      guest_fee_per_game: 1500,
      payment_due_dates: JSON.stringify([
        daysFromNow(40).toISOString(),
        daysFromNow(75).toISOString(),
      ]),
      min_players: 6,
      max_players: 24,
      game_type: '3v3',
      game_description: '3v3 half-court tournament style',
      schedule_type: 'CUSTOM',
      custom_dates: JSON.stringify([
        daysFromNow(50).toISOString(),
        daysFromNow(57).toISOString(),
        daysFromNow(64).toISOString(),
      ]),
      is_demo: true,
    },
  })

  // --- Seed Games ---
  const games = await Promise.all([
    // Completed games
    prisma.games.create({
      data: {
        game_date: daysAgo(21),
        location_id: downtown.id,
        max_players: 20,
        min_players: 10,
        status: 'COMPLETED',
        description: 'League game week 1',
        organizer_id: demoUserId,
        game_type: '5v5',
        league_id: activeLeague.id,
        is_demo: true,
      },
    }),
    prisma.games.create({
      data: {
        game_date: daysAgo(14),
        location_id: downtown.id,
        max_players: 20,
        min_players: 10,
        status: 'COMPLETED',
        description: 'League game week 2',
        organizer_id: demoUserId,
        game_type: '5v5',
        league_id: activeLeague.id,
        is_demo: true,
      },
    }),
    // In-progress game
    prisma.games.create({
      data: {
        game_date: daysAgo(0),
        location_id: downtown.id,
        max_players: 20,
        min_players: 10,
        status: 'IN_PROGRESS',
        description: 'League game week 3 — happening now!',
        organizer_id: demoUserId,
        game_type: '5v5',
        league_id: activeLeague.id,
        is_demo: true,
      },
    }),
    // Upcoming scheduled games
    prisma.games.create({
      data: {
        game_date: daysFromNow(7),
        location_id: downtown.id,
        max_players: 20,
        min_players: 10,
        status: 'SCHEDULED',
        description: 'League game week 4',
        organizer_id: demoUserId,
        game_type: '5v5',
        league_id: activeLeague.id,
        is_demo: true,
      },
    }),
    prisma.games.create({
      data: {
        game_date: daysFromNow(14),
        location_id: downtown.id,
        max_players: 20,
        min_players: 10,
        status: 'SCHEDULED',
        description: 'League game week 5',
        organizer_id: demoUserId,
        game_type: '5v5',
        league_id: activeLeague.id,
        is_demo: true,
      },
    }),
    // Standalone games (not tied to a league)
    prisma.games.create({
      data: {
        game_date: daysFromNow(3),
        location_id: westside.id,
        max_players: 14,
        min_players: 8,
        status: 'SCHEDULED',
        description: 'Casual pickup game — all levels welcome',
        organizer_id: tom.id,
        game_type: 'Pickup',
        is_demo: true,
      },
    }),
    prisma.games.create({
      data: {
        game_date: daysFromNow(10),
        location_id: university.id,
        max_players: 30,
        min_players: 12,
        status: 'SCHEDULED',
        description: 'Open run at the university gym',
        organizer_id: tom.id,
        game_type: '5v5',
        is_demo: true,
      },
    }),
    prisma.games.create({
      data: {
        game_date: daysAgo(7),
        location_id: westside.id,
        max_players: 14,
        min_players: 8,
        status: 'COMPLETED',
        description: 'Last week pickup game',
        organizer_id: tom.id,
        game_type: 'Pickup',
        is_demo: true,
      },
    }),
  ])

  // --- Seed Game Registrations ---
  const registrationData = []
  for (const game of games) {
    // Register a random subset of players for each game
    const playersForGame =
      game.status === 'SCHEDULED'
        ? allPlayers.slice(0, 4) // Fewer for upcoming games
        : allPlayers // All for completed/in-progress
    for (const playerId of playersForGame) {
      registrationData.push({
        user_id: playerId,
        game_id: game.id,
        status: 'CONFIRMED' as const,
        registration_type: 'MEMBER' as const,
        is_demo: true,
      })
    }
  }

  await prisma.game_registrations.createMany({
    data: registrationData,
    skipDuplicates: true,
  })

  // --- Seed League Memberships ---
  const memberIds = [demoUserId, jane.id, mike.id, sarah.id]
  const memberships = await Promise.all(
    memberIds.map(userId =>
      prisma.leagueMembership.create({
        data: {
          user_id: userId,
          league_id: activeLeague.id,
          status: userId === sarah.id ? 'PENDING_PAYMENT' : 'ACTIVE',
          pro_rated_amount: 15000, // $150.00
          is_demo: true,
        },
      })
    )
  )

  // --- Seed Payment Schedules ---
  const dueDates = JSON.parse(activeLeague.payment_due_dates) as string[]
  const schedules = []
  for (const membership of memberships) {
    for (let i = 0; i < dueDates.length; i++) {
      const isPaid = i === 0 && membership.user_id !== sarah.id
      schedules.push({
        league_id: activeLeague.id,
        membership_id: membership.id,
        due_date: new Date(dueDates[i]),
        amount_due: 5000, // $50.00 per period
        amount_paid: isPaid ? 5000 : 0,
        status: isPaid
          ? ('PAID' as const)
          : new Date(dueDates[i]) < now
            ? ('OVERDUE' as const)
            : ('PENDING' as const),
        paid_at: isPaid ? daysAgo(20) : null,
        is_demo: true,
      })
    }
  }

  await prisma.paymentSchedule.createMany({ data: schedules })

  // --- Seed Payments (for paid schedules) ---
  const paidSchedules = await prisma.paymentSchedule.findMany({
    where: { league_id: activeLeague.id, status: 'PAID', is_demo: true },
  })

  if (paidSchedules.length > 0) {
    const paymentData = paidSchedules.map(schedule => {
      // Find the membership to get the user_id
      const membership = memberships.find(m => m.id === schedule.membership_id)
      return {
        user_id: membership!.user_id,
        league_id: activeLeague.id,
        membership_id: membership!.id,
        payment_schedule_id: schedule.id,
        payment_type: 'MEMBERSHIP_FEE' as const,
        amount: 5000,
        payment_method: 'BANK_TRANSFER',
        payment_date: daysAgo(20),
        is_demo: true,
      }
    })

    await prisma.payment.createMany({ data: paymentData })
  }

  // --- Seed Notifications ---
  await prisma.notification.createMany({
    data: [
      {
        user_id: demoUserId,
        game_id: games[3].id,
        type: 'GAME_REMINDER',
        message: `Upcoming game on ${games[3].game_date.toLocaleDateString()} at Downtown Recreation Center`,
        read: false,
        is_demo: true,
      },
      {
        user_id: demoUserId,
        type: 'LEAGUE_UPDATE',
        message: 'Spring Basketball League 2026 payment reminder: $50.00 due soon',
        read: false,
        is_demo: true,
      },
      {
        user_id: demoUserId,
        game_id: games[0].id,
        type: 'GAME_COMPLETED',
        message: 'League game week 1 has been completed. Check the results!',
        read: true,
        is_demo: true,
      },
    ],
  })
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/lib/seedDemo.ts` (or run the full build)
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/seedDemo.ts
git commit -m "Add demo data wipe and seed functions"
```

---

### Task 7: Demo login server action

**Files:**
- Create: `src/actions/demoActions.ts`

- [ ] **Step 1: Create the demo login action**

```typescript
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
```

**Important:** The server-side `signIn` from `@/auth` throws a `NEXT_REDIRECT` error to perform the redirect. This is expected NextAuth v5 behavior — the redirect target is passed via `redirectTo` rather than handled as a separate step. The `loginAsDemo` function will not return normally; it will redirect.

However, `signIn` with credentials provider calls the `authorize` function which checks the password via bcrypt. Since we set a known password (`demo-password-not-used`) during `ensureDemoUser`, this will work. The hashed password in the DB will match.

- [ ] **Step 2: Commit**

```bash
git add src/actions/demoActions.ts
git commit -m "Add loginAsDemo server action"
```

---

### Task 8: "Try Demo" button on login page

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Add the demo login button**

Import the action at the top:
```typescript
import { loginAsDemo } from '@/actions/demoActions'
```

Add a new state for demo loading:
```typescript
const [isDemoLoading, setIsDemoLoading] = useState(false)
```

Add a handler:
```typescript
const handleDemoLogin = async () => {
  setIsDemoLoading(true)
  setError('')
  try {
    await loginAsDemo()
  } catch {
    // signIn redirects by throwing — if we get here, something went wrong
    setError('Demo login failed. Please try again.')
  } finally {
    setIsDemoLoading(false)
  }
}
```

Add the button below the existing sign-in card's closing `</div>`, before the "Don't have an account?" text. Place it between the card and the signup link:

```tsx
{/* Demo access */}
<motion.div className="mt-4 w-full max-w-[400px]" variants={fadeUp}>
  <div className="relative mb-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-zinc-200 dark:border-zinc-700/50" />
    </div>
    <div className="relative flex justify-center text-xs">
      <span className="bg-zinc-50 px-3 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500">
        or
      </span>
    </div>
  </div>
  <Button
    type="button"
    onClick={handleDemoLogin}
    isLoading={isDemoLoading}
    className="h-12 w-full rounded-xl border border-zinc-200/80 bg-white/80 text-[13px] font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md active:scale-[0.98] disabled:opacity-60 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
  >
    Try Demo
    <span className="ml-2 text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
      Explore all features
    </span>
  </Button>
</motion.div>
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev` and visit `http://localhost:3000/login`
Expected: "Try Demo" button appears below the sign-in card with an "or" divider.

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/login/page.tsx
git commit -m "Add Try Demo button to login page"
```

---

### Task 9: Demo mode badge in header

**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Modify: `src/components/header.tsx`

- [ ] **Step 1: Pass `isDemo` from layout to header**

In `src/app/(app)/layout.tsx`, the layout already calls `auth()` and extracts session data. Add `isDemo`:

```typescript
const isDemo = session?.user?.is_demo ?? false
```

Pass it to the Header component:
```tsx
<Header isAuthenticated={isAuthenticated} navLinksArray={navLinksArray} userRole={userRole} isDemo={isDemo} />
```

- [ ] **Step 2: Add demo badge to header component**

In `src/components/header.tsx`, add `isDemo` to the props interface:

```typescript
// In the props type, add:
isDemo: boolean
```

Add the badge in the header bar, near the user info or navigation area:

```tsx
{isDemo && (
  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
    Demo Mode
  </span>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/layout.tsx src/components/header.tsx
git commit -m "Add Demo Mode badge to app header"
```

---

## Chunk 3: Query Filtering — Action Files

**Pattern:** For each action file, we apply two types of changes:
1. **List queries** (findMany, findFirst without specific ID, count, aggregate, groupBy) — add `is_demo: await demoFilter()` to the where clause
2. **Create operations** — add `is_demo: await isDemoUser()` to the data

For **findUnique/findFirst by specific ID** (e.g., `where: { id: gameId }`), the data is already scoped because the ID came from a filtered list. No change needed for these — they operate on records the user already has access to.

**Import to add at the top of each modified file:**
```typescript
import { isDemoUser, demoFilter } from '@/lib/demo'
```

---

### Task 10: Filter `actions.ts`

**Files:**
- Modify: `src/actions/actions.ts`

- [ ] **Step 1: Add demo filtering to read queries**

Add import:
```typescript
import { demoFilter } from '@/lib/demo'
```

Queries to update:

- `getAllUserGames` (line 13): `prisma.game_registrations.findMany` — add `is_demo: await demoFilter()` to where
- `getLatestGame` (line 37): `prisma.games.findFirst` — add `is_demo: await demoFilter()` to where
- `getLatestGameId` (line 63): `prisma.games.findFirst` — add `is_demo: await demoFilter()` to where
- `getAllGames` from `gameActions.ts` is separate — handled in next task

- [ ] **Step 2: Commit**

```bash
git add src/actions/actions.ts
git commit -m "Add demo filtering to actions.ts queries"
```

---

### Task 11: Filter `gameActions.ts`

**Files:**
- Modify: `src/actions/gameActions.ts`

- [ ] **Step 1: Add demo filtering to reads and writes**

Add imports:
```typescript
import { isDemoUser, demoFilter } from '@/lib/demo'
```

**Read queries to filter** (add `is_demo: await demoFilter()` to where):
- `getNextUpcomingGame` (line 64): `prisma.games.findFirst`
- `getFirstGameByLocationId` (line 137): `prisma.games.findFirst`
- `lastTenGamesFromUserRegistration` (line 293): `prisma.games.findMany`
- `getAllGames` (line 315): `prisma.games.findMany` — currently no where clause, add `where: { is_demo: await demoFilter() }`

**Write queries to flag** (add `is_demo: await isDemoUser()` to data):
- `registerToGame` (line 231): `prisma.game_registrations.create` — add `is_demo: await isDemoUser()` to data

- [ ] **Step 2: Commit**

```bash
git add src/actions/gameActions.ts
git commit -m "Add demo filtering to gameActions.ts"
```

---

### Task 12: Filter `adminGameActions.ts`

**Files:**
- Modify: `src/actions/adminGameActions.ts`

- [ ] **Step 1: Add demo filtering**

Add imports:
```typescript
import { isDemoUser, demoFilter } from '@/lib/demo'
```

**Read queries to filter:**
- `getAllGamesForAdmin` (line 405): `prisma.games.findMany` — add `is_demo: await demoFilter()` to the dynamic `whereClause` object
- `getAllGamesForAdmin` (line 438): `prisma.games.count` — same whereClause
- `getAllGamesForAdmin` (line 441): `prisma.league.findMany` — add `where: { is_demo: await demoFilter() }`
- `getAllLocations` (line 479): `prisma.locations.findMany` — add `is_demo: await demoFilter()` alongside existing `is_active: true`

**Write queries to flag:**
- `createGame` (line 34): `prisma.games.create` — add `is_demo: await isDemoUser()` to data

**Notification creates** (lines 187, 238, 289): `prisma.notification.createMany` — add `is_demo: await isDemoUser()` to each notification data object in the map

- [ ] **Step 2: Commit**

```bash
git add src/actions/adminGameActions.ts
git commit -m "Add demo filtering to adminGameActions.ts"
```

---

### Task 13: Filter `adminLocationActions.ts`

**Files:**
- Modify: `src/actions/adminLocationActions.ts`

- [ ] **Step 1: Add demo filtering**

Add imports:
```typescript
import { isDemoUser, demoFilter } from '@/lib/demo'
```

**Read queries to filter:**
- `getAllLocationsForAdmin` (line 265): `prisma.locations.findMany` — add `is_demo: await demoFilter()` to dynamic where
- `getAllLocationsForAdmin` (line 280): `prisma.locations.count` — same where
- `getAllLocationsForAdmin` (line 281): `prisma.locations.findMany` (distinct cities) — add `where: { is_demo: await demoFilter() }`

**Write queries to flag:**
- `createLocation` (line 35): `prisma.locations.create` — add `is_demo: await isDemoUser()` to data

- [ ] **Step 2: Commit**

```bash
git add src/actions/adminLocationActions.ts
git commit -m "Add demo filtering to adminLocationActions.ts"
```

---

### Task 14: Filter `adminUserActions.ts`

**Files:**
- Modify: `src/actions/adminUserActions.ts`

- [ ] **Step 1: Add demo filtering**

This file doesn't have list queries — it operates on specific user IDs. However, the admin user list is rendered in the **admin page component** (handled in Chunk 4). The `updateUserRole` and `toggleUserActive` functions operate on specific user IDs which are already scoped.

No changes needed to this action file — the filtering happens at the page level where users are listed.

- [ ] **Step 2: Commit** (skip if no changes)

---

### Task 15: Filter `leagueActions.ts`

**Files:**
- Modify: `src/actions/leagueActions.ts`

- [ ] **Step 1: Add demo filtering**

Add imports:
```typescript
import { isDemoUser, demoFilter } from '@/lib/demo'
```

**Read queries to filter:**
- `getAllLeagues` (line 673): `prisma.league.findMany` — add `where: { is_demo: await demoFilter() }`
- `getActiveLeagues` (line 788): `prisma.league.findMany` — add `is_demo: await demoFilter()` to existing where
- `getUpcomingLeagues` (line 818): `prisma.league.findMany` — add `is_demo: await demoFilter()` to existing where
- `getBrowsableLeagues` (line 848): `prisma.league.findMany` — add `is_demo: await demoFilter()` to existing where

**Write queries to flag:**
- `createLeague` (line 92): `prisma.league.create` — add `is_demo: await isDemoUser()` to data
- `generateGamesForLeague` (line 178): `prisma.games.createMany` — add `is_demo: await isDemoUser()` to each game data object
- `regenerateFutureGames` (line 407): `prisma.game_registrations.createMany` — add `is_demo: await isDemoUser()` to each registration data object
- `completeLeague` (line 584): `prisma.payment.createMany` — add `is_demo: await isDemoUser()` to each payment data object

- [ ] **Step 2: Commit**

```bash
git add src/actions/leagueActions.ts
git commit -m "Add demo filtering to leagueActions.ts"
```

---

### Task 16: Filter `leagueMembershipActions.ts`

**Files:**
- Modify: `src/actions/leagueMembershipActions.ts`

- [ ] **Step 1: Add demo filtering**

Add imports:
```typescript
import { isDemoUser, demoFilter } from '@/lib/demo'
```

**Read queries to filter:**
- `getUserMemberships` (line 340): `prisma.leagueMembership.findMany` — add `is_demo: await demoFilter()` to where
- `getLeagueMemberships` (line 370): `prisma.leagueMembership.findMany` — add `is_demo: await demoFilter()` to where

**Write queries to flag:**
- `joinLeague` (line 80): `prisma.leagueMembership.create` — add `is_demo: await isDemoUser()` to data
- `joinLeague` (line 108): `prisma.game_registrations.createMany` — add `is_demo: await isDemoUser()` to each registration data object

- [ ] **Step 3: Commit**

```bash
git add src/actions/leagueMembershipActions.ts
git commit -m "Add demo filtering to leagueMembershipActions.ts"
```

---

### Task 17: Filter `paymentActions.ts`

**Files:**
- Modify: `src/actions/paymentActions.ts`

- [ ] **Step 1: Add demo filtering**

Add imports:
```typescript
import { isDemoUser, demoFilter } from '@/lib/demo'
```

**Read queries to filter:**
- `getLeaguePayments` (line 221): `prisma.payment.findMany` — add `is_demo: await demoFilter()` to where
- `getUserPayments` (line 282): `prisma.payment.findMany` — add `is_demo: await demoFilter()` to where
- `getMembershipPaymentSchedule` (line 345): `prisma.paymentSchedule.findMany` — add `is_demo: await demoFilter()` to where
- `getLeaguePaymentSummary` (line 453, 461, 469): `prisma.payment.aggregate` — add `is_demo: await demoFilter()` to each where

**Write queries to flag:**
- `recordMembershipPayment` (line 68): `prisma.payment.create` — add `is_demo: await isDemoUser()` to data
- `recordGuestFee` (line 175): `prisma.payment.create` — add `is_demo: await isDemoUser()` to data

- [ ] **Step 2: Commit**

```bash
git add src/actions/paymentActions.ts
git commit -m "Add demo filtering to paymentActions.ts"
```

---

### Task 18: Filter `recurringGameActions.ts`

**Files:**
- Modify: `src/actions/recurringGameActions.ts`

- [ ] **Step 1: Add demo filtering**

Add imports:
```typescript
import { isDemoUser, demoFilter } from '@/lib/demo'
```

**Read queries to filter:**
- `checkRecurringConflicts` (line 94): `prisma.games.findMany` — add `is_demo: await demoFilter()` to where
- `getSeriesGames` (line 460): `prisma.games.findMany` — add `is_demo: await demoFilter()` to where
- `checkFutureGamesInSeries` (line 433): `prisma.games.count` — add `is_demo: await demoFilter()` to where

**Write queries to flag:**
- `createRecurringGames` (line 189): `prisma.league.create` — add `is_demo: await isDemoUser()` to data
- `createRecurringGames` (line 208): `tx.games.create` — add `is_demo: await isDemoUser()` to data

- [ ] **Step 2: Commit**

```bash
git add src/actions/recurringGameActions.ts
git commit -m "Add demo filtering to recurringGameActions.ts"
```

---

## Chunk 4: Query Filtering — Page Components

**Pattern:** Each page component that makes direct Prisma queries needs the same `is_demo` filter. These are all server components, so they can call `demoFilter()` directly.

**Import to add at the top of each modified page:**
```typescript
import { demoFilter } from '@/lib/demo'
```

Then at the top of the component function:
```typescript
const isDemo = await demoFilter()
```

---

### Task 19: Filter dashboard admin page

**Files:**
- Modify: `src/app/(app)/(with-layout)/dashboard/admin/page.tsx`

- [ ] **Step 1: Add demo filtering to all queries**

This page has ~10 Prisma calls. Add `is_demo: isDemo` to all where clauses:

- Line 25: `prisma.users.findMany` — add `where: { is_demo: isDemo }`
- Line 37: `prisma.users.groupBy` — add `where: { is_demo: isDemo }`
- Line 41: `prisma.users.count` — change to `where: { is_active: true, is_demo: isDemo }`
- Line 42: `prisma.users.count` — change to `where: { is_active: false, is_demo: isDemo }`
- Line 43: `prisma.games.count` — add `where: { is_demo: isDemo }`
- Line 44: `prisma.games.count` — change to `where: { status: 'SCHEDULED', is_demo: isDemo }`
- Line 45: `prisma.league.count` — add `where: { is_demo: isDemo }`
- Line 46: `prisma.league.count` — change to `where: { status: { in: ['ACTIVE', 'UPCOMING'] }, is_demo: isDemo }`
- Line 47: `prisma.payment.aggregate` — add `where: { is_demo: isDemo }`
- Line 48: `prisma.paymentSchedule.count` — change to `where: { status: 'OVERDUE', is_demo: isDemo }`

- [ ] **Step 2: Commit**

```bash
git add src/app/(app)/(with-layout)/dashboard/admin/page.tsx
git commit -m "Add demo filtering to admin dashboard page"
```

---

### Task 20: Filter dashboard payments page

**Files:**
- Modify: `src/app/(app)/(with-layout)/dashboard/payments/page.tsx`

- [ ] **Step 1: Add demo filtering**

- Line 28: `prisma.league.findMany` — add `is_demo: isDemo` to existing where
- Line 39-71: `prisma.paymentSchedule.findMany` — add `is_demo: isDemo` to the where clause (both conditional branches)

- [ ] **Step 2: Commit**

```bash
git add src/app/(app)/(with-layout)/dashboard/payments/page.tsx
git commit -m "Add demo filtering to payments page"
```

---

### Task 21: Filter dashboard leagues pages

**Files:**
- Modify: `src/app/(app)/(with-layout)/dashboard/leagues/page.tsx`
- Modify: `src/app/(app)/(with-layout)/dashboard/leagues/[id]/page.tsx`
- Modify: `src/app/(app)/(with-layout)/dashboard/leagues/[id]/edit/page.tsx`
- Modify: `src/app/(app)/(with-layout)/dashboard/leagues/new/page.tsx`

- [ ] **Step 1: Filter leagues list page**

- `dashboard/leagues/page.tsx` line 25: `prisma.league.findMany` — add `where: { is_demo: isDemo }`

- [ ] **Step 2: Filter league detail page**

- `dashboard/leagues/[id]/page.tsx` line 28: `prisma.league.findUnique` — add `is_demo: isDemo` to where (change from `findUnique` to `findFirst` with `where: { id, is_demo: isDemo }` since is_demo is not part of the unique constraint, OR verify the league ID is demo-scoped via a post-fetch check)

**Note:** For `findUnique` by ID, the simplest approach is to keep `findUnique` and add a post-fetch check:
```typescript
const league = await prisma.league.findUnique({ where: { id }, include: { ... } })
if (!league || league.is_demo !== isDemo) return notFound()
```

- [ ] **Step 3: Filter league edit page**

- `dashboard/leagues/[id]/edit/page.tsx` line 25: `prisma.league.findUnique` — add post-fetch check
- `dashboard/leagues/[id]/edit/page.tsx` line 48: `prisma.locations.findMany` — add `is_demo: isDemo` to existing where

- [ ] **Step 4: Filter new league page**

- `dashboard/leagues/new/page.tsx` line 24: `prisma.locations.findMany` — add `is_demo: isDemo` to existing where

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/(with-layout)/dashboard/leagues/
git commit -m "Add demo filtering to league dashboard pages"
```

---

### Task 22: Filter dashboard locations and games pages

**Files:**
- Modify: `src/app/(app)/(with-layout)/dashboard/locations/[id]/edit/page.tsx`
- Modify: `src/app/(app)/(with-layout)/dashboard/games/[id]/reschedule/page.tsx`
- Modify: `src/app/(app)/(with-layout)/dashboard/games/[id]/change-location/page.tsx`
- Modify: `src/app/(app)/(with-layout)/dashboard/games/[id]/edit/page.tsx`

- [ ] **Step 1: Filter location edit page**

- `locations/[id]/edit/page.tsx` line 21: `prisma.locations.findUnique` — add post-fetch check

- [ ] **Step 2: Filter game reschedule page**

- `games/[id]/reschedule/page.tsx` line 21: `prisma.games.findUnique` — add post-fetch check

- [ ] **Step 3: Filter game change-location page**

- `games/[id]/change-location/page.tsx` line 23: `prisma.games.findUnique` — add post-fetch check

- [ ] **Step 4: Filter game edit page**

- `games/[id]/edit/page.tsx` line 24: `prisma.games.findUnique` — add post-fetch check

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/(with-layout)/dashboard/locations/ src/app/(app)/(with-layout)/dashboard/games/
git commit -m "Add demo filtering to location and game dashboard pages"
```

---

### Task 23: Filter public leagues page

**Files:**
- Modify: `src/app/(app)/(with-layout)/leagues/[id]/page.tsx`

- [ ] **Step 1: Add demo filtering**

- Line 18: `prisma.league.findUnique` — add post-fetch check:
```typescript
const league = await prisma.league.findUnique({ where: { id }, include: { ... } })
if (!league || league.is_demo !== isDemo) return notFound()
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(app)/(with-layout)/leagues/[id]/page.tsx
git commit -m "Add demo filtering to public leagues page"
```

---

## Chunk 5: Verification & Smoke Test

### Task 24: Build verification

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run dev server and test demo flow**

Run: `npm run dev`

Manual smoke test:
1. Visit `/login` — verify "Try Demo" button appears
2. Click "Try Demo" — verify it logs in and redirects to `/schedule`
3. Verify "Demo Mode" badge appears in header
4. Navigate to `/dashboard/admin` — verify only demo users appear in the list
5. Navigate to `/dashboard/games` — verify only demo games appear
6. Navigate to `/dashboard/leagues` — verify only demo leagues appear
7. Navigate to `/dashboard/locations` — verify only demo locations appear
8. Create a new game — verify it appears in the list
9. Log out, log back in as demo — verify data is reset (the game you created should be gone)
10. Register as a real user — verify no demo data is visible

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "Fix any issues found during smoke testing"
```
