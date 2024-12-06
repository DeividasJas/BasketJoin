import { postNewGame } from "@/actions/actions";

export function getNextGamesDates(count: number = 4): Date[] {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Vilnius",
  });
  const nowDate = new Date(now);
  const nextGames: Date[] = [];

  // Calculate first Tuesday at 8 PM in Lithuanian time
  const nextTuesday = new Date(now);
  nextTuesday.setDate(nowDate.getDate() + ((2 - nowDate.getDay() + 7) % 7));
  nextTuesday.setHours(20, 0, 0, 0);

  // Adjust if first date is in the past
  if (nowDate > nextTuesday) {
    nextTuesday.setDate(nextTuesday.getDate() + 7);
  }

  // Generate game dates
  for (let i = 0; i < count; i++) {
    const gameDate = new Date(nextTuesday);
    gameDate.setDate(nextTuesday.getDate() + i * 7);
    nextGames.push(gameDate);
  }

  // Post first game date
  postNewGame(nextGames[0]);

  return nextGames;
}
