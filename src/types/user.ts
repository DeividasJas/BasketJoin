import { latestGameAndPlayers } from '@/actions/actions';
import { Prisma } from '@prisma/client';

export type KindeUser = {
  id: string;
  email: string;
  family_name: string;
  given_name: string;
  picture?: string;
  phone_number?: string;
};

// export type Player = GameRegistration & {
//   user: User;
//   game: Game;
// };

export type GameAndPlayers = Prisma.PromiseReturnType<
  typeof latestGameAndPlayers
>;

export type IsPlaying = Prisma.PromiseReturnType<
  typeof latestGameAndPlayers
>['isActive'];
export type LatestGame = Prisma.PromiseReturnType<
  typeof latestGameAndPlayers
>['latestGame'];
export type Player = Prisma.PromiseReturnType<
  typeof latestGameAndPlayers
>['participants'];


export type SinglePlayer = NonNullable<Player>[number];