# GitHub Actions Setup for Prisma Migrations

Prisma Postgres is only accessible through Accelerate's proxy, so Vercel's build servers cannot run `prisma migrate deploy` directly. A GitHub Action handles migrations instead.

## Setup Steps

### 1. Add `DIRECT_URL` Secret to GitHub

1. Go to **https://github.com/DeividasJas/BasketJoin/settings/secrets/actions**
2. Click **New repository secret**
3. Name: `DIRECT_URL`
4. Value: your direct Postgres connection string (`postgres://...@db.prisma.io:5432/...`)
5. Click **Add secret**

### 2. Update Vercel Build Command

1. Go to **Vercel Dashboard > Project Settings > General > Build & Development Settings**
2. Change **Build Command** from:
   ```
   npx prisma generate && npx prisma migrate deploy && next build
   ```
   to:
   ```
   npx prisma generate && next build
   ```
3. Click **Save**

## How It Works

The workflow at `.github/workflows/prisma-migrate.yml` runs automatically:

- **On push to `main`**: Runs `prisma migrate deploy` to apply pending migrations to production
- **On PRs to `main`**: Runs `prisma migrate status` to validate migrations without applying them

It only triggers when Prisma-related files change (`prisma/migrations/**`, `prisma/schema.prisma`, `prisma.config.ts`).

## Running Migrations Manually

If you need to apply migrations outside of the workflow:

```bash
# From your local machine (with DIRECT_URL in .env)
npx prisma migrate deploy
```
