import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // DIRECT_URL is the raw PostgreSQL connection for migrations in production
    // Falls back to DATABASE_URL for local dev where they're the same
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
  migrations: {
    path: 'prisma/migrations',
  },
})
