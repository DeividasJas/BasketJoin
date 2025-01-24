import { Game_registrations, Prisma } from "@prisma/client";
import { getGameByIdAndLocation } from "@/actions/gameActions";

export type Players = Prisma.PromiseReturnType<typeof getGameByIdAndLocation>["participantsData"];

export type Game = Prisma.PromiseReturnType<typeof getGameByIdAndLocation>["gameData"];

export type IsActivePlayer = Prisma.PromiseReturnType<typeof getGameByIdAndLocation>["isActivePlayer"];

export type CancelRegistration = {
  success: boolean;
  message?: string;
  registration?: Game_registrations;
};

export type RegisterToGameResult = {
  success: boolean;
  message: string;
  registration?: Game_registrations;
};

export type GetLatestGameByLocation = {
  success: boolean;
  message: string;
  // gameWithPlayers?:
};

// export type User = Prisma.PromiseReturnType<
//   typeof getCurrentUser
// >["currentUser"];