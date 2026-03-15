# BasketJoin — Local & Production Setup Guide

## Architecture Overview

BasketJoin uses Prisma with the PrismaPg adapter for both local and production environments:

| Environment | Database | Connection |
|---|---|---|
| **Local** | Docker PostgreSQL | Direct via PrismaPg adapter |
| **Production** | Neon Serverless Postgres | Pooled connection via PrismaPg adapter |

Connection is configured via `DATABASE_URL` in environment files. See `.env.example` for reference.

---

## Part 1: Local Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Node.js 18+ and pnpm

### Steps

#### 1. Start the PostgreSQL container

```bash
docker compose up -d
```

This spins up PostgreSQL 16 on `localhost:5432` with credentials from `.env` defaults.

#### 2. Set up environment files

Copy `.env.example` to `.env` and fill in your Neon credentials. Then create `.env.local` for local development overrides:

```env
# .env.local — overrides .env for local development
DATABASE_URL="postgresql://basketjoin:basketjoin_dev_password@localhost:5432/basketjoin_dev"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-dev-client-id"
GOOGLE_CLIENT_SECRET="your-dev-client-secret"
NODE_ENV="development"
```

> `.env.local` is gitignored and overrides `.env` in Next.js.

#### 3. Generate the Prisma client & run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

#### 4. (Optional) Seed the database

```bash
pnpm run seed
```

#### 5. Start the dev server

```bash
pnpm run dev
```

App runs at `http://localhost:3000`.

---

## Part 2: Neon Serverless Postgres (Production)

### Step 1 — Create a Neon project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project (or use an existing one)
3. Choose a region close to your Vercel deployment

### Step 2 — Get your connection URLs

Neon provides two connection endpoints:

| Variable | URL Pattern | Used for |
|---|---|---|
| `DATABASE_URL` | `postgresql://...@ep-xxx-pooler.region.aws.neon.tech/neondb` | Runtime queries (pooled) |
| `DIRECT_URL` | `postgresql://...@ep-xxx.region.aws.neon.tech/neondb` | Prisma CLI migrations |

The pooler URL has `-pooler` in the hostname. The direct URL does not.

### Step 3 — Configure Vercel environment variables

Go to your Vercel project → **Settings** → **Environment Variables** and add:

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon pooler URL |
| `DIRECT_URL` | Neon direct URL |
| `NEXTAUTH_SECRET` | A strong random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-domain.com` |
| `GOOGLE_CLIENT_ID` | Your production Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your production Google OAuth client secret |

> Do **NOT** set `NODE_ENV` — Vercel sets it to `production` automatically.

### Step 4 — Run production migrations

Apply migration history to the Neon database:

**Option A — From your local machine** (one-time setup):

```bash
DATABASE_URL="postgresql://...@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" \
  npx prisma migrate deploy
```

**Option B — In CI/CD** (automatic on every deploy):

A GitHub Action (`.github/workflows/prisma-migrate.yml`) runs `prisma migrate deploy` automatically on push to main.

### Step 5 — Deploy

```bash
git push origin main
```

Vercel auto-deploys.

---

## How It Works Under the Hood

### `src/utils/prisma.ts`

```
DATABASE_URL → PrismaClient({ adapter: new PrismaPg(connectionString) })
```

### `prisma.config.ts`

```
Prisma CLI migrations use:
  DIRECT_URL (if set) → direct Neon connection (no pooler)
  DATABASE_URL (fallback) → works for local Docker PostgreSQL
```

---

## Troubleshooting

### "Can't reach database" locally
```bash
# Check if Docker container is running
docker compose ps

# Restart if needed
docker compose down && docker compose up -d
```

### Migrations fail in production
- Verify `DIRECT_URL` is set in Vercel env vars
- `DIRECT_URL` must be the direct Neon URL (without `-pooler` in hostname)
- Try running migrations locally with the production `DIRECT_URL` to debug

### Prisma generate errors
```bash
npx prisma generate
```

### "PrismaClientInitializationError" on Vercel
- Ensure `npx prisma generate` runs before `next build` in your build command
- Check that `DATABASE_URL` is set for the correct Vercel environment
