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
  // Set created_at to 60 days ago so seed games (up to 30 days old) show in attendance
  const demoCreatedAt = new Date()
  demoCreatedAt.setDate(demoCreatedAt.getDate() - 60)

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
        created_at: demoCreatedAt,
      },
    })
  } else {
    // Reset all demo user data on each login
    await prisma.users.update({
      where: { id: demoUser.id },
      data: {
        given_name: 'Demo',
        family_name: 'Admin',
        username: null,
        phone_number: null,
        picture: null,
        role: 'ADMIN',
        is_active: true,
        created_at: demoCreatedAt,
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
      payment_due_dates: JSON.stringify([daysAgo(25).toISOString(), daysFromNow(5).toISOString(), daysFromNow(35).toISOString()]),
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
  await prisma.league.create({
    data: {
      name: 'Summer Shootout 2026',
      description: 'Casual summer league with 3v3 tournaments',
      location_id: university.id,
      start_date: daysFromNow(45),
      end_date: daysFromNow(120),
      status: 'UPCOMING',
      gym_rental_cost: 12000,
      guest_fee_per_game: 1500,
      payment_due_dates: JSON.stringify([daysFromNow(40).toISOString(), daysFromNow(75).toISOString()]),
      min_players: 6,
      max_players: 24,
      game_type: '3v3',
      game_description: '3v3 half-court tournament style',
      schedule_type: 'CUSTOM',
      custom_dates: JSON.stringify([daysFromNow(50).toISOString(), daysFromNow(57).toISOString(), daysFromNow(64).toISOString()]),
      is_demo: true,
    },
  })

  // --- Seed Games ---
  const [leagueWeek1, leagueWeek2, leagueWeek3, leagueWeek4, leagueWeek5, pickupNext, openRun, pickupLast] = await Promise.all([
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
    // In-progress game — started at the top of the current hour
    prisma.games.create({
      data: {
        game_date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0),
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
  const games = [leagueWeek1, leagueWeek2, leagueWeek3, leagueWeek4, leagueWeek5, pickupNext, openRun, pickupLast]
  // Demo user misses league week 2 and last week's pickup
  const demoMissedGameIds = new Set([leagueWeek2.id, pickupLast.id])
  const registrationData = []
  for (const game of games) {
    const playersForGame = game.status === 'SCHEDULED' ? allPlayers.slice(0, 4) : allPlayers
    for (const playerId of playersForGame) {
      // Skip demo user for missed games
      if (playerId === demoUserId && demoMissedGameIds.has(game.id)) continue
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
      }),
    ),
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
        status: isPaid ? ('PAID' as const) : new Date(dueDates[i]) < now ? ('OVERDUE' as const) : ('PENDING' as const),
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
        game_id: leagueWeek4.id,
        type: 'GAME_REMINDER',
        message: `Upcoming game on ${leagueWeek4.game_date.toLocaleDateString()} at Downtown Recreation Center`,
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
        game_id: leagueWeek1.id,
        type: 'GAME_COMPLETED',
        message: 'League game week 1 has been completed. Check the results!',
        read: true,
        is_demo: true,
      },
    ],
  })
}
