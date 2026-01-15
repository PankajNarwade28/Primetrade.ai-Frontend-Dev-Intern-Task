# 🔐 Environment Variables Setup Guide

This guide explains all environment variables used in the PrimeTrade Frontend application and how to configure them properly.

---

## 📝 Quick Setup

Create a `.env.local` file in the `primetrade_frontend` directory:

```env
# Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password_here
PGDATABASE=primetrade

# JWT Authentication
JWT_SECRET=your_very_long_random_secret_key_minimum_32_characters_recommended_64

# Node Environment
NODE_ENV=development
```

---

## 🔑 Environment Variables Explained

### Database Configuration

#### `PGHOST`
- **Description:** PostgreSQL server hostname
- **Development:** `localhost` (local machine)
- **Production:** Your database server IP or hostname
- **Example:** `localhost`, `db.example.com`, `192.168.1.100`
- **Required:** ✅ Yes

#### `PGPORT`
- **Description:** PostgreSQL server port number
- **Default:** `5432`
- **Development:** `5432`
- **Production:** Usually `5432` (default PostgreSQL port)
- **Example:** `5432`, `5433`
- **Required:** ⚠️ Optional (defaults to 5432 if not set)

#### `PGUSER`
- **Description:** PostgreSQL username for authentication
- **Development:** `postgres` (default superuser)
- **Production:** Create dedicated user with limited permissions
- **Example:** `postgres`, `primetrade_user`, `app_user`
- **Required:** ✅ Yes
- **Security:** Never use superuser in production!

#### `PGPASSWORD`
- **Description:** PostgreSQL user password
- **Development:** Your local PostgreSQL password
- **Production:** Strong, randomly generated password
- **Example:** `MySecureP@ssw0rd123`, `Kj8#mP2$nQ9&vL4`
- **Required:** ✅ Yes
- **Security:** 
  - Minimum 12 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - Never commit to version control
  - Store securely (use secret management in production)

#### `PGDATABASE`
- **Description:** Name of the PostgreSQL database
- **Development:** `primetrade`
- **Production:** `primetrade` or your custom name
- **Example:** `primetrade`, `primetrade_production`, `myapp_db`
- **Required:** ✅ Yes

---

### Authentication Configuration

#### `JWT_SECRET`
- **Description:** Secret key for signing and verifying JWT tokens
- **Development:** Any string with minimum 32 characters
- **Production:** Cryptographically secure random string (64+ characters)
- **Required:** ✅ Yes
- **Security:** 
  - NEVER reuse across environments
  - NEVER commit to version control
  - Change immediately if compromised
  - Use different secrets for dev/staging/production

**Generate Secure JWT Secret:**

```bash
# Method 1: Using OpenSSL (Recommended)
openssl rand -base64 64

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Method 3: Using PowerShell (Windows)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Example Output:**
```
Kj8mP2nQ9vL4wXh5sT6uY7rZ1aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5
```

---

### Node Environment

#### `NODE_ENV`
- **Description:** Specifies the application environment
- **Values:** `development`, `production`, `test`
- **Development:** `development`
- **Production:** `production`
- **Required:** ⚠️ Optional (Next.js auto-detects)
- **Effects:**
  - `development`: Enables detailed error messages, hot reload
  - `production`: Optimizations enabled, minimal error details
  - `test`: For running tests

---

## 🌍 Environment-Specific Configurations

### Development Environment

**File:** `.env.local`

```env
# Development Database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=dev_password_123
PGDATABASE=primetrade_dev

# Development JWT Secret (can be simple)
JWT_SECRET=dev_secret_key_minimum_32_characters_1234567890

# Node Environment
NODE_ENV=development
```

**Characteristics:**
- Local database connection
- Simpler JWT secret (still 32+ chars)
- Verbose error messages
- Hot module replacement enabled

---

### Staging Environment

**File:** `.env.staging` (or environment variables in hosting platform)

```env
# Staging Database
PGHOST=staging-db.example.com
PGPORT=5432
PGUSER=primetrade_staging
PGPASSWORD=StrongStagingPassword#2024
PGDATABASE=primetrade_staging

# Staging JWT Secret (strong, unique)
JWT_SECRET=staging_Kj8mP2nQ9vL4wXh5sT6uY7rZ1aB3cD4eF5gH6iJ7kL8m

# Node Environment
NODE_ENV=production
```

**Characteristics:**
- Remote database connection
- Strong, unique JWT secret
- Production-like configuration
- Used for pre-release testing

---

### Production Environment

**File:** Environment variables in hosting platform (Vercel, AWS, etc.)

```env
# Production Database (example: managed PostgreSQL)
PGHOST=prod-db-cluster.us-east-1.rds.amazonaws.com
PGPORT=5432
PGUSER=primetrade_prod
PGPASSWORD=VeryStrongProdPassword#2024$Secure
PGDATABASE=primetrade_production

# Production JWT Secret (cryptographically secure)
JWT_SECRET=prod_xY9zA8bC7dE6fG5hI4jK3lM2nO1pQ0rS9tU8vW7xY6zA5bC4dE3fG2hI1jK0

# Node Environment
NODE_ENV=production
```

**Characteristics:**
- Managed database service (AWS RDS, Google Cloud SQL, etc.)
- Cryptographically secure JWT secret (64+ chars)
- Connection pooling enabled
- SSL/TLS for database connection
- Secrets stored in secret management service

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

**❌ BAD:**
```javascript
// Hardcoded in code
const JWT_SECRET = "my_secret_key";
```

**✅ GOOD:**
```javascript
// From environment variable
const JWT_SECRET = process.env.JWT_SECRET;
```

**Git Protection:**
Ensure `.env.local` is in `.gitignore`:
```gitignore
# Environment files
.env*.local
.env.production
.env.staging
```

---

### 2. Use Different Secrets Per Environment

Each environment should have unique secrets:

| Environment | JWT_SECRET | Database Password |
|------------|------------|-------------------|
| Development | `dev_secret_...` | `dev_password` |
| Staging | `staging_secret_...` | `staging_strong_pass` |
| Production | `prod_secret_...` | `prod_very_strong_pass` |

**Why?** If one environment is compromised, others remain secure.

---

### 3. Use Secret Management Services

For production, use dedicated secret management:

**Cloud Providers:**
- **Vercel:** Environment Variables in dashboard
- **AWS:** AWS Secrets Manager
- **Google Cloud:** Secret Manager
- **Azure:** Azure Key Vault
- **Heroku:** Config Vars

**Example (Vercel):**
1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Add each variable
4. Select environment (Production, Preview, Development)
5. Save

---

### 4. Rotate Secrets Regularly

- **JWT_SECRET:** Rotate every 90 days
- **Database Password:** Rotate every 60 days
- **Immediately after:** Team member departure, suspected breach

**Rotation Steps:**
1. Generate new secret
2. Update environment variable
3. Restart application
4. Invalidate old tokens (for JWT)
5. Monitor for issues

---

### 5. Database User Permissions

**❌ Development (acceptable):**
```sql
-- Using superuser (postgres)
PGUSER=postgres
```

**✅ Production:**
```sql
-- Create dedicated user with minimal permissions
CREATE USER primetrade_app WITH PASSWORD 'SecurePass#2024';
GRANT CONNECT ON DATABASE primetrade TO primetrade_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO primetrade_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO primetrade_app;
```

Then use:
```env
PGUSER=primetrade_app
PGPASSWORD=SecurePass#2024
```

---

## 🧪 Testing Environment Configuration

### Test Your Configuration

Create `test-env.js`:

```javascript
// Test environment variables
console.log('🔍 Testing Environment Configuration...\n');

const requiredVars = [
  'PGHOST',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  'JWT_SECRET'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    allPresent = false;
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 3)}***)`);
  }
});

// Check JWT_SECRET length
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log('\n⚠️  WARNING: JWT_SECRET should be at least 32 characters');
  allPresent = false;
}

if (allPresent) {
  console.log('\n✨ All environment variables configured correctly!');
} else {
  console.log('\n❌ Some environment variables are missing or invalid');
  process.exit(1);
}
```

Run test:
```bash
node test-env.js
```

---

## 🐳 Docker Environment

If using Docker, create `.env` file:

```env
# Docker uses .env (not .env.local)
PGHOST=postgres
PGPORT=5432
PGUSER=postgres
PGPASSWORD=docker_password
PGDATABASE=primetrade

JWT_SECRET=docker_jwt_secret_minimum_32_characters_12345678

NODE_ENV=development
```

**docker-compose.yml example:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${PGPASSWORD}
      POSTGRES_DB: ${PGDATABASE}
    ports:
      - "5432:5432"
```

---

## 📱 Environment Variable Hierarchy

Next.js loads environment variables in this order (last wins):

1. `.env` - All environments (committed)
2. `.env.local` - Local overrides (NOT committed)
3. `.env.development` - Development only
4. `.env.development.local` - Development local overrides
5. `.env.production` - Production only
6. `.env.production.local` - Production local overrides
7. System environment variables - Highest priority

**Recommendation:** Use `.env.local` for local development.

---

## 🚨 Common Issues and Solutions

### Issue: "Cannot connect to database"

**Check:**
1. PostgreSQL is running
2. `PGHOST` and `PGPORT` are correct
3. `PGUSER` and `PGPASSWORD` are correct
4. Database exists: `psql -l | grep primetrade`

### Issue: "JWT secret not defined"

**Solution:**
1. Ensure `JWT_SECRET` is in `.env.local`
2. Restart dev server after adding
3. Check for typos (must be `JWT_SECRET`)

### Issue: "Environment variable not loading"

**Solution:**
1. Restart Next.js dev server
2. Clear Next.js cache: `rm -rf .next`
3. Ensure variable is in `.env.local`
4. Check for syntax errors in `.env.local`

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Secret Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)

---

## ✅ Checklist

Before deploying, verify:

- [ ] All required environment variables are set
- [ ] JWT_SECRET is at least 32 characters (64+ for production)
- [ ] Database credentials are correct
- [ ] `.env.local` is in `.gitignore`
- [ ] Different secrets for each environment
- [ ] Production uses secret management service
- [ ] Database user has minimal required permissions
- [ ] Secrets are rotated regularly
- [ ] Team knows not to commit secrets

---

**Need help?** Check the main [README.md](./README.md) or [SETUP.md](./SETUP.md).
