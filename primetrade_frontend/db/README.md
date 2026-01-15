# Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- Database connection credentials

## Environment Variables

Create a `.env.local` file in the `primetrade_frontend` directory with the following variables:

```env
# Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=your_database_user
PGPASSWORD=your_database_password
PGDATABASE=primetrade_db

# JWT Secret (generate a strong random string)
JWT_SECRET=your_very_long_random_secret_key_here

# Node Environment
NODE_ENV=development
```

## Database Setup Steps

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE primetrade_db;

# Connect to the database
\c primetrade_db
```

### 2. Run Schema

```bash
# From the primetrade_frontend directory
psql -U your_username -d primetrade_db -f db/schema.sql
```

Or using the connection string:
```bash
psql postgresql://username:password@localhost:5432/primetrade_db -f db/schema.sql
```

### 3. (Optional) Seed Sample Data

```bash
psql -U your_username -d primetrade_db -f db/seed.sql
```

## Verify Setup

Connect to your database and verify tables were created:

```sql
\dt  -- List all tables
\d users  -- Describe users table
\d tasks  -- Describe tasks table
```

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running: `pg_ctl status`
- Check your firewall settings
- Verify credentials in `.env.local`

### Permission Issues
- Grant necessary permissions to your database user:
```sql
GRANT ALL PRIVILEGES ON DATABASE primetrade_db TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
```

## Production Considerations

1. **Use Environment Variables**: Never commit `.env.local` to version control
2. **Strong JWT Secret**: Generate using: `openssl rand -base64 64`
3. **Database Backups**: Set up regular automated backups
4. **Connection Pooling**: Already configured in `lib/db.js` using pg Pool
5. **SSL Connections**: For production, enable SSL in PostgreSQL connection
