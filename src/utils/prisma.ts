import { PrismaClient } from '@/generated/prisma/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL!
  const isAccelerate = databaseUrl.startsWith('prisma+postgres://')

  if (isAccelerate) {
    // Production: route through Accelerate (connection pooling + caching)
    return new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate())
  }

  // Local: direct PostgreSQL via adapter
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
