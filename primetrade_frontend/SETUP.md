# 🚀 Quick Setup Guide - PrimeTrade Frontend

This guide will help you set up the PrimeTrade Frontend application from scratch in under 10 minutes.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

Check your installations:
```bash
node --version    # Should be v18+
npm --version     # Should be 8+
psql --version    # Should be 12+
git --version     # Any recent version
```

---

## 🔧 Step-by-Step Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd PrimetradeFrontend.ai/primetrade_frontend
```

### 2️⃣ Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

This will install:
- Next.js 16.1.1
- React 19.2.3
- Material UI 7.3.7
- PostgreSQL driver (pg)
- JWT libraries
- bcrypt for password hashing
- And all other dependencies

**Time:** ~2-3 minutes

---

### 3️⃣ Database Setup

#### Create PostgreSQL Database

**Option A: Using psql command line**
```bash
# Login to PostgreSQL (may prompt for password)
psql -U postgres

# Create database
CREATE DATABASE primetrade;

# Exit psql
\q
```

**Option B: Using createdb command**
```bash
createdb primetrade -U postgres
```

**Option C: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Enter name: `primetrade`
5. Click "Save"

#### Run Database Schema

Navigate to the project directory and run:

```bash
# Windows PowerShell
Get-Content db\schema.sql | psql -U postgres -d primetrade

# macOS/Linux or Windows Git Bash
psql -U postgres -d primetrade -f db/schema.sql
```

This creates two tables:
- `users` - Stores user accounts (id, email, password, name)
- `tasks` - Stores user tasks (id, user_id, title, description, status)

#### (Optional) Seed Sample Data

```bash
# Windows PowerShell
Get-Content db\seed.sql | psql -U postgres -d primetrade

# macOS/Linux or Windows Git Bash
psql -U postgres -d primetrade -f db/seed.sql
```

**Test Database Connection:**

```bash
cd primetrade_frontend
node test-db.js
```

You should see:
```
✅ Database connected successfully!
Found 3 users in database
```

**Time:** ~3-5 minutes

---

### 4️⃣ Environment Configuration

Create a `.env.local` file in the `primetrade_frontend` directory:

```bash
# Windows PowerShell
New-Item .env.local -ItemType File

# macOS/Linux
touch .env.local
```

Add the following configuration:

```env
# Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=primetrade

# JWT Secret Key (for authentication tokens)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_12345678901234567890

# Node Environment
NODE_ENV=development
```

**🔐 Security Notes:**
- Replace `your_postgres_password` with your actual PostgreSQL password
- For production, generate a secure JWT secret using:
  ```bash
  # Generate random 64-character key
  openssl rand -base64 64
  ```
- Never commit `.env.local` to version control (already in `.gitignore`)

**Time:** ~2 minutes

---

### 5️⃣ Start Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 2.3s
```

Open your browser and navigate to:
- **http://localhost:3000** - Main application

**Time:** ~30 seconds

---

## ✅ Verify Installation

### Test Authentication Flow

1. **Signup Page** (http://localhost:3000/auth)
   - Click "Sign Up"
   - Enter name, email, and password
   - Click "Sign Up" button
   - Should redirect to dashboard

2. **Dashboard** (http://localhost:3000/dashboard)
   - View your profile
   - Create a new task
   - Search and filter tasks
   - Edit your profile
   - Logout

3. **Login** (http://localhost:3000/auth)
   - Enter email and password
   - Should redirect to dashboard

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `connection refused` or `authentication failed`

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Check database exists:
   ```bash
   psql -U postgres -l | grep primetrade
   ```

3. Test connection:
   ```bash
   psql -U postgres -d primetrade -c "SELECT NOW();"
   ```

4. Verify `.env.local` credentials match your PostgreSQL setup

---

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find and kill process using port 3000

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

Or run on different port:
```bash
npm run dev -- -p 3001
```

---

### Module Not Found Errors

**Error:** `Cannot find module '@mui/material'` or similar

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### JWT or Authentication Errors

**Error:** `Invalid token` or `Authentication failed`

**Solutions:**
1. Clear browser cookies and localStorage
2. Verify `JWT_SECRET` is set in `.env.local`
3. Restart development server after changing `.env.local`

---

## 📚 Next Steps

After successful setup:

1. **Read API Documentation** - See [API.md](./API.md) for endpoint details
2. **Explore Database Schema** - Check [db/README.md](./db/README.md)
3. **Learn About Scaling** - Read [SCALING.md](./SCALING.md)
4. **Test with Postman** - Import [postman_collection.json](./postman_collection.json)

---

## 🆘 Still Having Issues?

1. Check the main [README.md](./README.md) for detailed information
2. Review error messages in:
   - Browser console (F12)
   - Terminal running `npm run dev`
   - PostgreSQL logs
3. Verify all prerequisites are correctly installed
4. Ensure firewall isn't blocking PostgreSQL (port 5432) or Next.js (port 3000)

---

## 🎯 Common Configuration Scenarios

### Using Different Database Name

If you want to use a different database name:

1. Create database: `createdb myapp -U postgres`
2. Update `.env.local`: `PGDATABASE=myapp`
3. Run schema: `psql -U postgres -d myapp -f db/schema.sql`

### Running on Custom Port

```bash
# Run on port 8080
npm run dev -- -p 8080
```

Update any hardcoded URLs if needed.

### Multiple Developers Setup

Each developer should:
1. Have their own `.env.local` file (not committed)
2. Use the same database schema (run `schema.sql`)
3. Can optionally use separate databases

---

## ✨ You're All Set!

Your PrimeTrade Frontend application is now ready to use. Happy coding! 🚀

For production deployment, see [SCALING.md](./SCALING.md).
