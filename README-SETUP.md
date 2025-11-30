# BasketJoin - Local Development Setup Guide

## ⚠️ Problem Solved

Your project wasn't running because:
1. **Database mismatch**: Schema expects PostgreSQL, but credentials were wrong
2. **Missing migrations**: The `prisma/migrations` folder wasn't committed initially
3. **Docker not running**: PostgreSQL container needs to be started

## ✅ Solution: PostgreSQL for Both Dev & Production

### Benefits:
- ✅ **One schema file** - No maintaining separate dev/prod schemas
- ✅ **Consistency** - Same database type in development and production
- ✅ **Proper enums** - Native PostgreSQL enum support (not strings)
- ✅ **Team sync** - Everyone uses same database, migrations track all changes

---

## 🚀 Quick Start (After Pulling)

### 1. Start Docker Desktop
**IMPORTANT**: Make sure Docker Desktop is running on your Mac!

### 2. Start PostgreSQL Container
```bash
docker-compose up -d
```

This starts the PostgreSQL database in the background.

### 3. Apply Migrations
```bash
npx prisma migrate deploy
```

This applies all your committed migrations to the local database.

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Start Development Server
```bash
pnpm dev
```

---

## 📦 Environment Files

### `.env` (Committed to Git)
- Contains **development defaults** (local PostgreSQL)
- Production values are **commented out**
- Safe to commit - no secrets exposed

### `.env.local` (NOT committed)
- Your **personal development settings**
- Created automatically for you
- Can customize without affecting others

---

## 🗃️ Database Configuration

### Development Database (Docker PostgreSQL):
```
Host: localhost
Port: 5432
Database: basketjoin_dev
Username: basketjoin
Password: basketjoin_dev_password
```

**Connection String**:
```
postgresql://basketjoin:basketjoin_dev_password@localhost:5432/basketjoin_dev
```

### Production Database (Prisma Postgres):
Set these in your deployment platform (Vercel/Netlify):
```
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY
DIRECT_URL=postgres://YOUR_DIRECT_URL
```

---

## 📝 Making Schema Changes

### Workflow:

1. **Edit `prisma/schema.prisma`**
   ```prisma
   model YourNewModel {
     id String @id @default(cuid())
     // ... your fields
   }
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
   
   This:
   - Creates a new migration file
   - Applies it to your local database
   - Regenerates Prisma Client

3. **Commit & Push**
   ```bash
   git add prisma/
   git commit -m "Add YourNewModel schema"
   git push
   ```

### When Teammates Pull:

```bash
git pull
npx prisma migrate deploy  # Apply new migrations
npx prisma generate         # Regenerate client
```

---

## 🔧 Useful Commands

### View Database in GUI
```bash
npx prisma studio
```
Opens at `http://localhost:5555`

### Check Migration Status
```bash
npx prisma migrate status
```

### Reset Database (Fresh Start)
```bash
docker-compose down -v      # Delete database
docker-compose up -d        # Recreate database
npx prisma migrate deploy   # Apply all migrations
```

### Stop PostgreSQL
```bash
docker-compose down
```

### View Docker Logs
```bash
docker-compose logs postgres
```

---

## ❓ Troubleshooting

### "Can't reach database server"
**Solution**: Start Docker Desktop, then run:
```bash
docker-compose up -d
```

### "Migration failed"
**Solution**: Reset database and try again:
```bash
docker-compose down -v
docker-compose up -d
npx prisma migrate deploy
```

### "Prisma Client not found"
**Solution**: Regenerate the client:
```bash
npx prisma generate
```

### Check if PostgreSQL is running:
```bash
docker ps
```
You should see `basketjoin-postgres` in the list.

---

## 📊 Migrations

Your existing migrations are in `prisma/migrations/`:
- `20251128141323_init/` - Initial schema
- `20251128142804_improved_schema/` - Schema improvements

These are **version controlled** and should be **committed to git**.

### Why Commit Migrations?

✅ **Version history** - Track schema evolution
✅ **Team sync** - Everyone has same schema
✅ **Production safe** - Deploy with confidence
✅ **Rollback capability** - Can revert if needed

---

## 🔄 Development vs Production

### Development (Local):
- Uses Docker PostgreSQL
- Runs on `localhost:5432`
- Data is local to your machine
- Can reset/delete freely
- Migrations stored in `prisma/migrations/`

### Production (Prisma Postgres):
- Cloud-hosted PostgreSQL
- Accessed via Prisma Accelerate
- Same schema as development
- Same migrations applied
- Connection pooling & caching included

---

## 🎯 Key Points

1. **Always start Docker** before running the app
2. **Run `prisma migrate deploy`** after pulling schema changes
3. **Commit migrations** to git
4. **Use `npx prisma studio`** to view/edit data
5. **Production uses same schema** - just different connection string

---

## 📱 Docker Compose Info

The `docker-compose.yml` file contains:
- PostgreSQL 16 Alpine (lightweight)
- Port mapping: `5432:5432`
- Volume for data persistence
- Health checks
- ARM64 platform support (M1/M2 Macs)

Data is stored in Docker volume `postgres_data` - survives container restarts!

---

**Ready to Start?**

1. ✅ Start Docker Desktop
2. ✅ Run `docker-compose up -d`
3. ✅ Run `npx prisma migrate deploy`
4. ✅ Run `pnpm dev`

Your app will be running at `http://localhost:3000` (or 3001 if 3000 is busy)!
