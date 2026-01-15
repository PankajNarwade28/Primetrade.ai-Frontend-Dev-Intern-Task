# PrimeTrade Frontend - Scalable Web App with Authentication & Dashboard

A modern, scalable full-stack web application built with Next.js, featuring JWT-based authentication, user profile management, and CRUD operations for task management.

## 🚀 Features

### Frontend
- ✅ Built with **Next.js 16** and **React 19**
- ✅ Responsive design using **Material UI** and **TailwindCSS**
- ✅ Client-side and server-side form validation
- ✅ Protected routes with JWT authentication
- ✅ Real-time search and filtering
- ✅ Modern UI with loading states and error handling

### Backend
- ✅ RESTful API routes using **Next.js API Routes**
- ✅ JWT-based authentication with secure httpOnly cookies
- ✅ Password hashing with **bcrypt**
- ✅ PostgreSQL database integration
- ✅ Comprehensive error handling and validation
- ✅ CRUD operations with search/filter capabilities

### Security
- ✅ Password hashing (bcrypt with 10 salt rounds)
- ✅ JWT token authentication (7-day expiration)
- ✅ HttpOnly cookies to prevent XSS attacks
- ✅ Server-side and client-side input validation
- ✅ Protected API routes with authentication middleware
- ✅ SQL injection prevention using parameterized queries

## 📋 Tech Stack

**Frontend:**
- Next.js 16
- React 19
- Material UI 7
- TailwindCSS 4
- TypeScript

**Backend:**
- Next.js API Routes
- Node.js
- JWT (jsonwebtoken)
- bcryptjs

**Database:**
- PostgreSQL
- pg (node-postgres)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Git

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd PrimetradeFrontend.ai/primetrade_frontend
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Database Setup

1. Create a PostgreSQL database:
```bash
createdb primetrade_db
```

2. Run the schema:
```bash
psql -d primetrade_db -f db/schema.sql
```

3. (Optional) Seed sample data:
```bash
psql -d primetrade_db -f db/seed.sql
```

See [db/README.md](db/README.md) for detailed database setup instructions.

### Step 4: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=your_database_user
PGPASSWORD=your_database_password
PGDATABASE=primetrade_db

# JWT Secret (generate with: openssl rand -base64 64)
JWT_SECRET=your_very_long_random_secret_key_minimum_32_characters

# Node Environment
NODE_ENV=development
```

### Step 5: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
primetrade_frontend/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js       # Login endpoint
│   │   │   ├── signup/route.js      # Signup endpoint
│   │   │   └── logout/route.js      # Logout endpoint
│   │   ├── profile/route.js         # User profile GET/PUT
│   │   └── tasks/
│   │       ├── route.js             # Tasks GET/POST
│   │       └── [id]/route.js        # Task GET/PUT/DELETE
│   ├── auth/page.js                 # Login/Signup page
│   ├── dashboard/page.jsx           # Main dashboard
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
├── components/
│   └── Navbar.jsx                   # Navigation component
├── lib/
│   ├── auth.js                      # Authentication utilities
│   └── db.js                        # Database connection
├── db/
│   ├── schema.sql                   # Database schema
│   ├── seed.sql                     # Sample data
│   └── README.md                    # Database setup guide
├── middleware.js                    # Route protection middleware
├── package.json
└── README.md
```

## 🔐 Authentication Flow

1. **Signup**: User creates account → Password hashed → Stored in database
2. **Login**: Credentials validated → JWT token generated → Stored in httpOnly cookie
3. **Protected Routes**: Middleware validates JWT → Allows/denies access
4. **Logout**: Cookie cleared → User redirected to login

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/auth/logout`
Logout user and clear authentication cookie.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Profile Endpoints

#### GET `/api/profile`
Get current user's profile (requires authentication).

**Response:**
```json
{
  "profile": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

#### PUT `/api/profile`
Update user profile (requires authentication).

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "newmail@example.com"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": { /* updated profile */ }
}
```

### Tasks Endpoints

#### GET `/api/tasks`
Get all tasks for authenticated user with optional filters.

**Query Parameters:**
- `search` - Search in title/description
- `status` - Filter by status (pending, in-progress, completed)
- `sortBy` - Sort field (created_at, updated_at, title, status)
- `order` - Sort order (ASC, DESC)

**Example:**
```
GET /api/tasks?search=project&status=in-progress&sortBy=created_at&order=DESC
```

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Complete project",
      "description": "Finish the assignment",
      "status": "in-progress",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### POST `/api/tasks`
Create a new task (requires authentication).

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "pending"
}
```

**Response:**
```json
{
  "message": "Task created successfully",
  "task": { /* created task */ }
}
```

#### GET `/api/tasks/[id]`
Get a specific task (requires authentication).

**Response:**
```json
{
  "task": { /* task details */ }
}
```

#### PUT `/api/tasks/[id]`
Update a task (requires authentication).

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed"
}
```

**Response:**
```json
{
  "message": "Task updated successfully",
  "task": { /* updated task */ }
}
```

#### DELETE `/api/tasks/[id]`
Delete a task (requires authentication).

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

## 🧪 Testing the API

### Using the Application
1. Navigate to [http://localhost:3000/auth](http://localhost:3000/auth)
2. Create an account or login
3. Access the dashboard to create and manage tasks
4. Update your profile from the dashboard

### Using Postman/Thunder Client

Import this collection or test manually:

```json
{
  "info": {
    "name": "PrimeTrade API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/signup",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

## 🚀 Production Deployment & Scaling

### Frontend-Backend Integration Scaling Strategy

#### 1. **Current Architecture (Monolithic Next.js)**
- **Pros**: Simple deployment, single codebase, serverless-ready
- **Cons**: Tight coupling, harder to scale independently

#### 2. **Scaling to Microservices**

For production scale, consider this migration path:

```
Phase 1 (Current): Monolithic Next.js
├── Frontend (React/Next.js)
└── Backend (API Routes)

Phase 2: Separated Architecture
├── Frontend: Next.js (Static/SSR)
├── API Gateway: Express/Fastify
├── Auth Service: Node.js + JWT
├── Task Service: Node.js
└── Profile Service: Node.js

Phase 3: Microservices + Cloud
├── Frontend: Vercel/Netlify CDN
├── API Gateway: AWS API Gateway/Kong
├── Services: Docker + Kubernetes
├── Database: Amazon RDS/Supabase
└── Cache: Redis/Memcached
```

#### 3. **Immediate Scaling Steps**

**a) Database Optimization:**
```sql
-- Add connection pooling (already implemented)
-- Implement read replicas for heavy read operations
-- Add database indexing (already done in schema.sql)
-- Use Redis for session management
```

**b) API Rate Limiting:**
```javascript
// Add to middleware.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

**c) Caching Strategy:**
- Implement Redis for frequently accessed data
- Cache user profiles for 5 minutes
- Cache task lists with invalidation on CRUD operations

**d) CDN & Static Assets:**
- Serve static files through CDN (Cloudflare/AWS CloudFront)
- Optimize images with Next.js Image component
- Enable Brotli/Gzip compression

#### 4. **Horizontal Scaling**

**Load Balancer Configuration:**
```nginx
upstream nextjs_backend {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://nextjs_backend;
    }
}
```

**Docker Compose for Multi-Instance:**
```yaml
version: '3.8'
services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
  
  postgres:
    image: postgres:15
    
  redis:
    image: redis:7-alpine
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
```

#### 5. **Monitoring & Observability**

- Add logging with Winston or Pino
- Implement APM (New Relic, DataDog)
- Use Sentry for error tracking
- Monitor database performance
- Track API response times

#### 6. **Security Enhancements for Production**

- Implement rate limiting per user/IP
- Add CORS configuration
- Enable HTTPS only (SSL/TLS)
- Implement refresh tokens alongside JWT
- Add API versioning (/api/v1/...)
- Enable SQL injection prevention (already using parameterized queries)
- Add input sanitization library
- Implement CSP (Content Security Policy) headers

#### 7. **Database Scaling**

```
Read Replicas:
Master DB (Write) → Replica 1 (Read)
                  → Replica 2 (Read)
                  → Replica 3 (Read)

Sharding Strategy:
- Shard by user_id for multi-tenant architecture
- Use PostgreSQL partitioning for large tables
```

#### 8. **Cost-Effective Deployment Options**

**For MVP/Small Scale:**
- Vercel (Frontend + API Routes): $20/month
- Supabase (PostgreSQL): Free tier → $25/month
- Total: ~$25-45/month

**For Medium Scale:**
- AWS/GCP with load balancer: ~$100-300/month
- Managed PostgreSQL (RDS/Cloud SQL): ~$50-150/month
- Redis Cache: ~$10-30/month
- Total: ~$160-480/month

**For Large Scale:**
- Kubernetes cluster: $300-1000/month
- Managed services: $200-500/month
- CDN: $50-200/month
- Total: $550-1700/month

### Deployment Instructions

#### Vercel Deployment (Recommended for MVP)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Add: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, JWT_SECRET
```

#### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t primetrade-app .
docker run -p 3000:3000 --env-file .env.local primetrade-app
```

## 🤝 Contributing

This project was built as part of a Frontend Developer Intern assignment. Feel free to fork and improve!

## 📄 License

MIT License

## 👤 Author

Built for PrimeTrade Frontend Developer Intern Assignment

## 📞 Support

For questions or issues, please create an issue in the GitHub repository or contact the development team.

---

**Note**: This project demonstrates modern web development practices including security, scalability, and clean code architecture. It's production-ready with proper error handling, validation, and authentication mechanisms.
