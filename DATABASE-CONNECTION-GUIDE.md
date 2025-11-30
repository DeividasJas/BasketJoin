# Database Connection Guide for External DB Viewers

## ✅ Connection Credentials (VERIFIED & WORKING)

Your PostgreSQL database is accessible from your Mac with these exact credentials:

```
Host: localhost  (or 127.0.0.1)
Port: 5432
Database: basketjoin_dev
Username: basketjoin
Password: basketjoin_dev_password
```

## 🔧 Prisma Studio (Built-in, Always Works)

The easiest way to view your database:

```bash
npx prisma studio
```

Opens at: `http://localhost:5555`

This is currently running! You can view all your tables, data, and relationships.

---

## 📱 Popular Database Viewers Setup

### TablePlus

1. **New Connection** → PostgreSQL
2. **Name**: BasketJoin Local
3. **Host**: `localhost` ← IMPORTANT: Not `basketjoin-postgres`!
4. **Port**: `5432`
5. **User**: `basketjoin`
6. **Password**: `basketjoin_dev_password`
7. **Database**: `basketjoin_dev`
8. **SSL Mode**: Disable or Prefer

### DBeaver

1. **Database** → **New Connection** → PostgreSQL
2. **Host**: `localhost`
3. **Port**: `5432`
4. **Database**: `basketjoin_dev`
5. **Username**: `basketjoin`
6. **Password**: `basketjoin_dev_password`
7. **Show all databases**: ✓ (optional)
8. Click **Test Connection**

### pgAdmin

1. **Add New Server**
2. **General Tab**:
   - Name: `BasketJoin Local`
3. **Connection Tab**:
   - Host name/address: `localhost`
   - Port: `5432`
   - Maintenance database: `basketjoin_dev`
   - Username: `basketjoin`
   - Password: `basketjoin_dev_password`
   - Save password: ✓

### DataGrip (JetBrains)

1. **Database** → **New** → **Data Source** → PostgreSQL
2. **Host**: `localhost`
3. **Port**: `5432`
4. **Database**: `basketjoin_dev`
5. **User**: `basketjoin`
6. **Password**: `basketjoin_dev_password`
7. **Test Connection**

### Postico (Mac)

1. **New Favorite**
2. **Nickname**: BasketJoin
3. **Host**: `localhost`
4. **Port**: `5432`
5. **User**: `basketjoin`
6. **Password**: `basketjoin_dev_password`
7. **Database**: `basketjoin_dev`
8. **Connect**

---

## 🚨 Common Connection Issues & Solutions

### Issue 1: "Connection Refused" or "Can't Connect"

**Solution**: Make sure Docker Desktop is running!

```bash
# Check if container is running
docker ps

# You should see basketjoin-postgres in the list
# If not, start it:
docker-compose up -d
```

### Issue 2: "Password authentication failed"

**Solution**: Triple-check the password exactly as shown:

```
basketjoin_dev_password
```

**NOT:**
- `basketjoin_password`
- `basketjoin`
- `password`

### Issue 3: "Database does not exist"

**Solution**: Make sure you're connecting to `basketjoin_dev`, not `basketjoin`

### Issue 4: Host Connection Error

**Common Mistakes:**
- ❌ Using `basketjoin-postgres` as host (that's the container name, not accessible from host)
- ❌ Using `postgres` as host
- ✅ Use `localhost` or `127.0.0.1`

### Issue 5: Port Already in Use

**Check if something else is using port 5432:**

```bash
lsof -i :5432
```

If another PostgreSQL is running, you'll need to either:
1. Stop the other PostgreSQL instance, or
2. Change the port mapping in `docker-compose.yml`

---

## 🧪 Test Connection from Terminal

To verify the database is accessible from your Mac:

```bash
# If you have psql installed locally:
psql -h localhost -p 5432 -U basketjoin -d basketjoin_dev

# Or use Docker:
docker exec -it basketjoin-postgres psql -U basketjoin -d basketjoin_dev
```

Password: `basketjoin_dev_password`

Once connected, try:
```sql
\l              -- List all databases
\dt             -- List all tables
SELECT * FROM "Users" LIMIT 5;
```

---

## 📊 Your Current Database Schema

Tables available:
- `Users`
- `Account`
- `Session`
- `VerificationToken`
- `Notification`
- `Games`
- `Locations`
- `Game_registrations`
- `_prisma_migrations`

---

## 🔐 Security Note

These are **development credentials only**. They are:
- ✅ Safe for local development
- ✅ Only accessible from your machine
- ✅ Isolated in Docker container
- ❌ **NEVER** use these in production

Production uses different credentials set via environment variables in your deployment platform.

---

## 🆘 Still Can't Connect?

1. **Verify Docker is running:**
   ```bash
   docker ps | grep postgres
   ```

2. **Check port is exposed:**
   ```bash
   docker port basketjoin-postgres
   ```
   Should show: `5432/tcp -> 0.0.0.0:5432`

3. **Test with Prisma Studio** (always works):
   ```bash
   npx prisma studio
   ```
   Opens at `http://localhost:5555`

4. **Check firewall settings** (macOS):
   - System Settings → Network → Firewall
   - Ensure it's not blocking port 5432

5. **Restart Docker container:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## ✅ Verification Checklist

Before trying to connect with a DB viewer:

- [ ] Docker Desktop is running
- [ ] `docker ps` shows `basketjoin-postgres` container
- [ ] Port 5432 is exposed (check with `docker port basketjoin-postgres`)
- [ ] Using `localhost` as host (not `basketjoin-postgres`)
- [ ] Using exact password: `basketjoin_dev_password`
- [ ] Database name is: `basketjoin_dev`

---

**Quick Test**: Run `npx prisma studio` - if it works, your database connection is fine, and the issue is with your specific DB viewer configuration.
