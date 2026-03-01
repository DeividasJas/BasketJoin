# Prisma Commands Reference

## Database Migrations

### Create a new migration
```bash
npx prisma migrate dev --name <migration_name>
```
Creates a new migration file and applies it to the database.

### Apply pending migrations
```bash
npx prisma migrate deploy
```
Applies all pending migrations (used in production).

### Reset database
```bash
npx prisma migrate reset
```
Drops the database, recreates it, and applies all migrations.

### View migration status
```bash
npx prisma migrate status
```
Shows which migrations have been applied.

## Database Push (Development)

### Push schema changes without migrations
```bash
npx prisma db push
```
Pushes schema changes directly to the database without creating migration files. Useful for prototyping.

## Prisma Client

### Generate Prisma Client
```bash
npx prisma generate
```
Generates the Prisma Client based on your schema. Run after schema changes.

## Database Seeding

### Seed the database
```bash
npx prisma db seed
```
Runs the seed script defined in package.json.

## Studio (GUI)

### Open Prisma Studio
```bash
npx prisma studio
```
Opens a GUI to view and edit your database data.

## Schema Management

### Format schema file
```bash
npx prisma format
```
Formats your Prisma schema file.

### Validate schema
```bash
npx prisma validate
```
Validates your Prisma schema for errors.

## Introspection

### Pull schema from existing database
```bash
npx prisma db pull
```
Introspects your database and updates the Prisma schema.

## Common Workflows

### Development workflow
1. Update `schema.prisma`
2. `npx prisma migrate dev --name <change_description>`
3. Prisma Client is auto-generated

### Production deployment
1. `npx prisma generate`
2. `npx prisma migrate deploy`

### Quick prototyping
1. Update `schema.prisma`
2. `npx prisma db push`
3. `npx prisma generate`
