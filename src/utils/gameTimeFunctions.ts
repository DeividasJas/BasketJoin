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
    gameDate.setDate(nextWednesday.getDate() + i * 7);
    nextGames.push(gameDate);
  }

  // Verify first date hasn't passed and adjust if needed
  if (nextGames.length > 0 && now > nextGames[0]) {
    // If first date has passed, generate new dates starting from next week
    return getNextGamesDates(count);
  }

  // console.log(nextGames[0].toISOString());

  const newGameDate = async () => {
    console.log('NEXT GAMES',nextGames[0]);
    
    try {
      const url = process.env.NEXT_PUBLIC_SITE_URL;
      console.log('from GAME TIME url', url);
      const response = await fetch(`http://localhost:3000/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: nextGames[0] }),
      });

console.log(response);


      const data = await response.json();
      console.log(data); // Log the response from the API
    } catch (err) {
      console.error('Error posting new game date:', err);
    }
  };

  newGameDate();

  return nextGames;
}

export const latestGame = async () => {
  const response = await fetch('/api/games', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const gameData = await response.json();
  // console.log('GAME DATA', gameData);
  return gameData;
};
