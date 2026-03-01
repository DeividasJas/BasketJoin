import { Game_registrations, Prisma } from '@/generated/prisma/client/client'
import { getGameByIdAndLocation } from '@/actions/gameActions'

export type Players = Awaited<ReturnType<typeof getGameByIdAndLocation>>['participantsData']

export type Game = Awaited<ReturnType<typeof getGameByIdAndLocation>>['gameData']

export type IsActivePlayer = Awaited<ReturnType<typeof getGameByIdAndLocation>>['isActivePlayer']

export type CancelRegistration = {
  success: boolean
  message?: string
  registration?: Game_registrations
}

export type RegisterToGameResult = {
  success: boolean
  message: string
  registration?: Game_registrations
}

export type GetLatestGameByLocation = {
  success: boolean
  message: string
  // gameWithPlayers?:
}

// League System Types

export type LeagueWithRelations = Prisma.LeagueGetPayload<{
  include: {
    location: true
    games: true
    memberships: true
    payments: true
    payment_schedules: true
  }
}>

export type LeagueMembershipWithRelations = Prisma.LeagueMembershipGetPayload<{
  include: {
    user: true
    league: true
    payment_schedules: true
    payments: true
  }
}>

export type PaymentScheduleWithRelations = Prisma.PaymentScheduleGetPayload<{
  include: {
    league: true
    membership: {
      include: {
        user: true
      }
    }
    payments: true
  }
}>

export type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: {
    user: true
    league: true
    membership: true
    payment_schedule: true
  }
}>

export type CreateLeagueResult = {
  success: boolean
  message: string
  league?: LeagueWithRelations
}

export type CreateMembershipResult = {
  success: boolean
  message: string
  membership?: LeagueMembershipWithRelations
}

export type RecordPaymentResult = {
  success: boolean
  message: string
  payment?: PaymentWithRelations
}

// export type User = Prisma.PromiseReturnType<
//   typeof getCurrentUser
// >["currentUser"];
