import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function seedPastGames() {
  // Clear existing games and registrations
  await prisma.gameRegistration.deleteMany()
  await prisma.game.deleteMany()

  // Create 20 past games in the last 6 months
  const pastGames = await Promise.all(
    Array.from({ length: 20 }).map(async () => {
      return prisma.game.create({
        data: {
          gameDate: faker.date.past({ years: 0.5 })
        }
      })
    })
  )

  console.log(`Seeded ${pastGames.length} past games`)
}

seedPastGames()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export {}