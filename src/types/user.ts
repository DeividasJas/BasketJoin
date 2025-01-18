import { Prisma } from "@prisma/client";
import {
  getLatestGameByLocation,
  getAllGames,
  getCurrentUser,
} from "@/actions/actions";

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

// export type GameAndPlayers = Prisma.PromiseReturnType<
//   typeof latestGameAndPlayers
// >;

// export type IsPlaying = Prisma.PromiseReturnType<
//   typeof latestGameAndPlayers
// >["isActive"];
// export type LatestGame = Prisma.PromiseReturnType<
//   typeof latestGameAndPlayers
// >["latestGame"];
// export type Player = Prisma.PromiseReturnType<
//   typeof latestGameAndPlayers
// >["participants"];

export type latestGameByLocation = Prisma.PromiseReturnType<
  typeof getLatestGameByLocation
>["latestGameWithPLayers"];

export type AllGames = Prisma.PromiseReturnType<typeof getAllGames>["allGames"];

export type User = Prisma.PromiseReturnType<
  typeof getCurrentUser
>["currentUser"];

export type Game = {
  game_date: Date;
  game_id: number;
  location: {
    id: number;
    name: string;
  };
};
