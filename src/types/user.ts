import { getAllGames } from '@/actions/gameActions'

export type KindeUser = {
  id: string
  email: string
  family_name: string
  given_name: string
  picture?: string
  phone_number?: string
}

export type AllGames = Awaited<ReturnType<typeof getAllGames>>['allGames']

export type Game = {
  game_date: Date
  game_id: number
  location: {
    id: number
    name: string
  }
}
