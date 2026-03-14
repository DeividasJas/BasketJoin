# Demo Account System — Design Spec

## Overview

Add a demo account to BasketJoin that allows portfolio visitors to try all features (including admin) without affecting real users. The demo experience is fully isolated — demo users only see demo data, real users only see real data.

## Key Decisions

| Decision       | Choice                                                      |
| -------------- | ----------------------------------------------------------- |
| Persistence    | Real — demo actions actually persist to the database        |
| Admin features | Pre-seeded fake users that demo admin can manage            |
| Data reset     | On each new demo login — wipe and re-seed                   |
| Access method  | "Try Demo" button on login page (one click, no credentials) |
| Isolation      | Fully isolated — demo user only sees demo-scoped data       |
| Implementation | `is_demo` boolean flag on all major models                  |

## 1. Schema Changes

Add `is_demo Boolean @default(false)` to the following models:

- **Users** — identifies demo user and seed users
- **Games** — demo-created games
- **Locations** — demo locations
- **League** — demo leagues
- **Game_registrations** — registrations involving demo data
- **LeagueMembership** — memberships involving demo data
- **PaymentSchedule** — payment schedules involving demo data
- **Payment** — payments involving demo data
- **Notification** — notifications involving demo data

The flag serves two purposes:

1. **Filtering**: queries return only `is_demo: true` or `is_demo: false` data based on current user
2. **Cleanup**: on demo login, `DELETE WHERE is_demo = true` across all tables, then re-seed

### Unique constraint update

The `Games` model has `@@unique([game_date, location_id])`. Since demo seed games could collide with real games at the same date/location, this constraint must be updated to include `is_demo`:

```prisma
@@unique([game_date, location_id, is_demo])
```

Other unique constraints (`Game_registrations: [user_id, game_id]`, `LeagueMembership: [user_id, league_id]`) are safe because both sides of the relationship are always demo-scoped — demo users only interact with demo entities.

## 2. Demo User & Seed Data

### Demo user account

- Email: `demo@basketjoin.com`
- Password: pre-hashed (login is via button, not credentials)
- Role: `ADMIN`
- `is_demo: true`
- The demo user record itself is NOT deleted on reset — only associated data is wiped and re-seeded

### Seed data (created fresh on each demo login)

| Entity             | Count  | Details                                                                                                     |
| ------------------ | ------ | ----------------------------------------------------------------------------------------------------------- |
| Seed users         | 4-5    | Mix of roles: 2-3 PLAYERs, 1 ORGANIZER, 1 ADMIN. Realistic names. All `is_demo: true`                       |
| Locations          | 2-3    | Basketball courts with varied capacity, pricing, court counts                                               |
| Leagues            | 1-2    | 1 ACTIVE (with memberships, payments, payment schedules), 1 UPCOMING                                        |
| Games              | 6-8    | Spread across statuses: SCHEDULED (upcoming), COMPLETED, IN_PROGRESS. Some tied to leagues, some standalone |
| Game registrations | ~15-20 | Seed users registered for various games, including the demo user                                            |
| Payments           | ~5-8   | Recorded payments for the active league, some PENDING payment schedules                                     |
| Notifications      | 2-3    | Unread notifications for the demo user                                                                      |

### Seed script

- Located at `src/lib/seedDemo.ts`
- Exported as `seedDemoData(demoUserId: string)` function
- Creates all seed data in a single Prisma transaction
- Returns void — errors throw

## 3. Demo Login Flow

### Server action: `loginAsDemo()`

Located in a new file `src/actions/demoActions.ts`.

**Steps:**

1. **Find or create** the demo user (`demo@basketjoin.com`) — ensures the user exists with `is_demo: true`, role `ADMIN`
2. **Wipe** all `is_demo: true` data in FK-safe order:
   - Payment
   - PaymentSchedule
   - LeagueMembership
   - Game_registrations
   - Notification
   - Games
   - League
   - Locations
   - Users (all `is_demo: true` EXCEPT the demo user itself)
3. **Re-seed** — call `seedDemoData(demoUserId)`
4. **Sign in** — programmatically sign in as the demo user via the **server-side** `signIn` from `@/auth` (NOT the client-side `signIn` from `next-auth/react`). In NextAuth.js v5, server-side `signIn` throws a `NEXT_REDIRECT` error to perform the redirect, so the redirect target (`/schedule`) must be passed as a parameter to `signIn` rather than handled as a separate step.

### Concurrency consideration

If two visitors click "Try Demo" simultaneously, they share the same demo account. The second login will wipe the first visitor's in-progress data. This is acceptable for a portfolio project — concurrent demo usage is unlikely, and each visitor gets a clean slate regardless.

## 4. Query Filtering & Action Guards

### Helper utility: `src/lib/demo.ts`

```typescript
// Returns whether the current session user is a demo user
async function isDemoUser(): Promise<boolean>

// Returns the is_demo filter value for queries
async function demoFilter(): Promise<boolean>
```

These check `session.user.is_demo` (added to JWT/session — see section 5).

### Read operations

Every server action that queries data adds the demo filter:

```typescript
const isDemo = await demoFilter()
// In every query:
where: { ...existingFilters, is_demo: isDemo }
```

### Write operations

Every server action that creates data sets the flag:

```typescript
const isDemo = await isDemoUser()
// In every create:
data: { ...fields, is_demo: isDemo }
```

### Affected action files

| File                         | Read changes                                                                               | Write changes                             |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `actions.ts`                 | Filter `getLatestGame`, `getLatestGameId`, `getGameById`, `getAllUserGames`, `getUserById` | N/A                                       |
| `gameActions.ts`             | Filter games, registrations                                                                | Set flag on register                      |
| `adminGameActions.ts`        | Filter admin game list                                                                     | Set flag on create/update                 |
| `adminLocationActions.ts`    | Filter locations                                                                           | Set flag on create                        |
| `adminUserActions.ts`        | Filter user list to demo users only                                                        | N/A (role changes stay within demo users) |
| `leagueActions.ts`           | Filter leagues                                                                             | Set flag on create                        |
| `leagueMembershipActions.ts` | Filter memberships                                                                         | Set flag on join                          |
| `paymentActions.ts`          | Filter payments                                                                            | Set flag on record                        |
| `recurringGameActions.ts`    | Filter `checkRecurringConflicts`, `getSeriesGames`, `checkFutureGamesInSeries`             | Set flag on create                        |
| `userActions.ts`             | No change (operates on current user)                                                       | No change                                 |

### Affected page components (direct Prisma queries)

These page components make direct `prisma.*` calls and also need `is_demo` filtering:

| Page                                            | Queries to filter                                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dashboard/admin/page.tsx`                      | `prisma.users.findMany`, `.groupBy`, `.count`, `prisma.games.count`, `prisma.league.count`, `prisma.payment.aggregate`, `prisma.paymentSchedule.count` |
| `dashboard/payments/page.tsx`                   | `prisma.league.findMany`, `prisma.paymentSchedule.findMany`                                                                                            |
| `dashboard/leagues/page.tsx`                    | `prisma.league.findMany`                                                                                                                               |
| `dashboard/leagues/[id]/page.tsx`               | `prisma.league.findUnique` (with includes)                                                                                                             |
| `dashboard/leagues/[id]/edit/page.tsx`          | `prisma.league.findUnique`, `prisma.locations.findMany`                                                                                                |
| `dashboard/leagues/new/page.tsx`                | `prisma.locations.findMany`                                                                                                                            |
| `dashboard/locations/[id]/edit/page.tsx`        | `prisma.locations.findUnique`                                                                                                                          |
| `dashboard/games/[id]/reschedule/page.tsx`      | `prisma.games.findUnique`                                                                                                                              |
| `dashboard/games/[id]/change-location/page.tsx` | `prisma.games.findUnique`                                                                                                                              |
| `leagues/[id]/page.tsx`                         | `prisma.league.findUnique`                                                                                                                             |

## 5. Auth Integration

### JWT token

In `src/auth.ts`, add `is_demo` to the JWT callback:

Consolidate with the existing role fetch into a single DB query:

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
}
```

### Session object

In the session callback, expose `is_demo`:

```typescript
async session({ session, token }) {
  // ... existing logic ...
  session.user.is_demo = token.is_demo as boolean
  return session
}
```

### Type extensions

Update `src/types/next-auth.d.ts` to include `is_demo: boolean` on the session user and JWT token types.

## 6. UI Changes

### Login page (`src/app/(auth)/login/page.tsx`)

- Add a "Try Demo" button below the sign-in card, separated by a visual divider
- Secondary/outlined style so it doesn't compete with the primary "Sign in" button
- Loading state while the wipe/seed/login process runs
- Text: "Try Demo" with a subtitle like "Explore all features with a demo account"

### Demo mode indicator

- A small badge in the app header showing "Demo Mode" when `session.user.is_demo === true`
- Subtle styling — informational, not intrusive
- Lets visitors know they're in a sandbox

## 7. File Changes Summary

### New files

| File                         | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `src/lib/demo.ts`            | `isDemoUser()` and `demoFilter()` helpers |
| `src/lib/seedDemo.ts`        | Seed data creation function               |
| `src/actions/demoActions.ts` | `loginAsDemo()` server action             |

### Modified files

| File                                           | Change                                                                                                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                         | Add `is_demo` field to 9 models, update Games unique constraint                                                                                                   |
| `src/auth.ts`                                  | Consolidate JWT callback to fetch `role` + `is_demo` in one query; add `is_demo` to session callback; guard OAuth `signIn` callback against `demo@basketjoin.com` |
| `src/types/next-auth.d.ts`                     | Add `is_demo` to type declarations                                                                                                                                |
| `src/app/(auth)/login/page.tsx`                | Add "Try Demo" button                                                                                                                                             |
| `src/app/api/auth/register/route.ts`           | Block registration with `demo@basketjoin.com` email                                                                                                               |
| `src/actions/actions.ts`                       | Add demo filtering to reads                                                                                                                                       |
| `src/actions/gameActions.ts`                   | Add demo filtering to reads, flag to writes                                                                                                                       |
| `src/actions/adminGameActions.ts`              | Add demo filtering to reads, flag to writes                                                                                                                       |
| `src/actions/adminLocationActions.ts`          | Add demo filtering to reads, flag to writes                                                                                                                       |
| `src/actions/adminUserActions.ts`              | Add demo filtering to user list                                                                                                                                   |
| `src/actions/leagueActions.ts`                 | Add demo filtering to reads, flag to writes                                                                                                                       |
| `src/actions/leagueMembershipActions.ts`       | Add demo filtering to reads, flag to writes                                                                                                                       |
| `src/actions/paymentActions.ts`                | Add demo filtering to reads, flag to writes                                                                                                                       |
| `src/actions/recurringGameActions.ts`          | Add demo filtering to reads, flag to writes                                                                                                                       |
| ~10 page components with direct Prisma queries | Add demo filtering (see Section 4 table)                                                                                                                          |
| App header component                           | Add "Demo Mode" badge                                                                                                                                             |

## 8. Edge Cases

- **Concurrent demo sessions**: Acceptable — second login resets first visitor's data. Portfolio traffic is low.
- **Demo email via OAuth**: The OAuth `signIn` callback in `auth.ts` must reject sign-in attempts where the resolved email is `demo@basketjoin.com`. This prevents someone from creating a Google/Facebook account with that email and hijacking the demo user.
- **Demo email via registration**: The registration endpoint (`/api/auth/register`) must reject `demo@basketjoin.com`. Added to modified files list.
- **Demo data in production migrations**: The `is_demo` default is `false`, so existing data is unaffected. Seed runs only on demo login, not on deploy.
- **NextAuth Session/Account models**: These lack `is_demo` but don't need it. JWT strategy (`strategy: 'jwt'`) means no `Session` rows accumulate. `Account` records are only created for OAuth users, and the demo user logs in via credentials, so no cleanup needed.
- **Demo user profile edits**: If the demo user changes their name/phone via `updateUserForm`, it persists until the next demo login resets the seed users (but not the demo user record itself). This is acceptable.
