export function getNextGamesDates(count: number = 4): Date[] {
  const nextGames: Date[] = [];
  const now = new Date();
  
  // Find the next upcoming Wednesday at 10 PM
  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + ((2 - now.getDay() + 7) % 7)); // 3 represents Wednesday
  nextWednesday.setHours(20, 0, 0, 0); // 22:00 = 10 PM

  // If current time is past Wednesday 10 PM, move to next week
  if (now > nextWednesday) {
    nextWednesday.setDate(nextWednesday.getDate() + 7);
  }

  // Generate the next 'count' number of dates
  for (let i = 0; i < count; i++) {
    const gameDate = new Date(nextWednesday);
    gameDate.setDate(nextWednesday.getDate() + (i * 7));
    nextGames.push(gameDate);
  }

  // Verify first date hasn't passed and adjust if needed
  if (nextGames.length > 0 && now > nextGames[0]) {
    // If first date has passed, generate new dates starting from next week
    return getNextGamesDates(count);
  }

  return nextGames;
}