# BasketJoin — Local & Production Setup Guide

## Architecture Overview

BasketJoin uses a **dual-mode Prisma setup** that auto-detects the environment based on the `DATABASE_URL` scheme:

| Environment | URL Scheme | Connection Method | Benefits |
|---|---|---|---|
| **Local** | `postgresql://` | PrismaPg adapter → Docker PostgreSQL | Zero latency, free, offline-capable |
| **Production** | `prisma+postgres://` | Accelerate extension → Prisma Postgres | Connection pooling, edge caching, serverless-friendly |

Detection happens in `src/utils/prisma.ts` — no `NODE_ENV` checks needed.

---

## Part 1: Local Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Node.js 18+ and npm

### Steps

#### 1. Start the PostgreSQL container

```bash
docker compose up -d
```

This spins up PostgreSQL 16 on `localhost:5432` with credentials from `.env` defaults.

#### 2. Confirm `.env.local` exists

Your `.env.local` should look like this (already set up):

```env
# Local PostgreSQL (Docker)
DATABASE_URL="postgresql://basketjoin:basketjoin_dev_password@localhost:5432/basketjoin_dev"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (dev credentials)
GOOGLE_CLIENT_ID="your-dev-client-id"
GOOGLE_CLIENT_SECRET="your-dev-client-secret"

# Node environment
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
npm run seed
```

#### 5. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`. The PrismaPg adapter path is used automatically because `DATABASE_URL` starts with `postgresql://`.

---

## Part 2: Prisma Postgres + Accelerate (Production)

### Step 1 — Create a Prisma Postgres database

1. Go to [console.prisma.io](https://console.prisma.io)
2. Create a new project (or use an existing one)
3. Click **Create database** → choose a region close to your Vercel deployment (e.g., `us-east-1`)
4. Wait for provisioning (~30 seconds)

### Step 2 — Get your connection URLs

After the database is created, Prisma Console shows two URLs:

| Variable | Looks like | Used for |
|---|---|---|
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=ey...` | Runtime queries (goes through Accelerate proxy) |
| `DIRECT_URL` | `postgres://username:password@db.prisma.io:5432/postgres?sslmode=require` | Prisma CLI migrations (`prisma migrate deploy`) |

Copy both. You'll need them in the next step.

### Step 3 — Configure Vercel environment variables

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add the following variables (select **Production** environment):

| Name | Value |
|---|---|
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY` |
| `DIRECT_URL` | `postgres://...@db.prisma.io:5432/postgres?sslmode=require` |
| `NEXTAUTH_SECRET` | A strong random string (`openssl rand -base64 32`) | 
| `NEXTAUTH_URL` | `https://your-domain.com` |
| `GOOGLE_CLIENT_ID` | Your production Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your production Google OAuth client secret |

> Do **NOT** set `NODE_ENV` — Vercel sets it to `production` automatically.

### Step 4 — Run production migrations

You need to apply your migration history to the Prisma Postgres database. Two options:

**Option A — From your local machine** (one-time setup):

```bash
# Temporarily set DIRECT_URL for the migration CLI
DIRECT_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require" \
  npx prisma migrate deploy
```

**Option B — In Vercel build command** (automatic on every deploy):

Update your Vercel build command to:

```
npx prisma generate && npx prisma migrate deploy && next build
```

`prisma migrate deploy` reads the `DIRECT_URL` from `prisma.config.ts` (falls back to `DATABASE_URL` if `DIRECT_URL` is not set). In production, `DIRECT_URL` points to the raw PostgreSQL connection, bypassing Accelerate — which is required for migrations.

### Step 5 — Deploy

```bash
git push origin main
```

Vercel auto-deploys. The app detects `prisma+postgres://` in `DATABASE_URL` and uses the Accelerate path automatically.

### Step 6 — Verify

1. Open your deployed app
2. Sign in, create a game, browse pages
3. Check the [Prisma Console](https://console.prisma.io) → **Queries** tab to confirm queries are flowing through Accelerate

---

## How It Works Under the Hood

### `src/utils/prisma.ts`

```
DATABASE_URL starts with...
├── "prisma+postgres://" → PrismaClient({ accelerateUrl }).$extends(withAccelerate())
└── "postgresql://"      → PrismaClient({ adapter: new PrismaPg(...) })
```

### `prisma.config.ts`

```
Prisma CLI migrations use:
  DIRECT_URL (if set) → raw PostgreSQL for production migrations
  DATABASE_URL (fallback) → works for local Docker PostgreSQL
```

---

## Free Tier Limits (Prisma Postgres)

| Resource | Free Tier |
|---|---|
| Operations | 100,000 / month |
| Storage | 500 MB |
| Databases | 5 |
| Accelerate cache | Included |

Sufficient for development and low-traffic production. Upgrade to a paid plan if you exceed these limits.

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
- Verify `DIRECT_URL` is set in Vercel env vars (not just `DATABASE_URL`)
- `DIRECT_URL` must be the raw `postgres://` URL, NOT the `prisma+postgres://` URL
- Try running migrations locally with the production `DIRECT_URL` to debug

### Prisma generate errors
```bash
# Regenerate the client after schema changes
npx prisma generate
```

### "PrismaClientInitializationError" on Vercel
- Ensure `npx prisma generate` runs before `next build` in your build command
- Check that `DATABASE_URL` is set for the correct Vercel environment (Production vs Preview)
