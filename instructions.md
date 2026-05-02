# Setup Instructions - Elijah Dbsys

This project is a full-stack delivery application with a Node.js/Express backend and a React frontend. Follow these steps to get everything running.

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL Server** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **npm** (comes with Node.js)

## Project Structure

```
Elijah_Dbsys/
├── backend/                    # Express.js + MySQL API
└── Pick-A-Roo-Case-Study/      # React + Vite frontend
```

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pickaroo

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

**Important:** 
- Set `DB_PASSWORD` to your actual MySQL root password
- Use a strong, random string for `JWT_SECRET` (at least 32 characters)

### 4. Initialize Database

Run the database setup script to create tables and schema:

```bash
npm run db:init
```

This creates:
- `USERS` table (customer, store owner, admin roles)
- `STORES` table
- `PRODUCTS` table
- `ORDERS` table
- `ORDER_ITEMS` table
- `DELIVERIES` table

### 5. (Optional) Seed Sample Users

Populate the database with test users:

```bash
npm run db:seed-users
```

Sample credentials will be created for testing.

### 6. Start Backend Development Server

```bash
npm run dev
```

The backend will run at `http://localhost:5000`

**Expected output:**
```
Server running on port 5000
Database connected successfully
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory (in a new terminal)

```bash
cd Pick-A-Roo-Case-Study
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `Pick-A-Roo-Case-Study/` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:5173
```

**Notes:**
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- `APP_URL`: Local development URL (change for production)

### 4. Start Frontend Development Server

```bash
npm run dev
```

The frontend will run at `http://localhost:5173`

**Expected output:**
```
VITE v6.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## Running Both Services

### Option 1: Terminal Tabs/Windows

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Pick-A-Roo-Case-Study
npm run dev
```

### Option 2: Using a Process Manager (Production-like)

Install and use `concurrently` (optional):

```bash
npm install -g concurrently
```

From the root directory:
```bash
concurrently "cd backend && npm run dev" "cd Pick-A-Roo-Case-Study && npm run dev"
```

---

## Available API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get current user profile

### Stores
- `GET /api/stores` - List all stores
- `POST /api/stores` - Create store (requires STORE_OWNER or ADMIN role)

### Products
- `GET /api/products?storeId=1&page=1&limit=10` - List products with pagination
- `POST /api/products` - Create product (requires store owner/admin)

### Orders
- `POST /api/orders` - Create order (with items array)
- `PATCH /api/orders/:id/assign-shopper` - Assign shopper to order

### Deliveries
- `POST /api/deliveries` - Create delivery assignment

### Authorization Header

Include JWT token in all authenticated requests:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Testing the Setup

### 1. Test Backend Connectivity

```bash
curl http://localhost:5000/api/stores
```

### 2. Create Test User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","userType":"CUSTOMER"}'
```

### 3. Open Frontend in Browser

Navigate to `http://localhost:5173` - you should see the React app.

---

## Build for Production

### Backend
```bash
npm run start
```

### Frontend
```bash
npm run build
npm run preview
```

---

## Troubleshooting

### MySQL Connection Error
**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solution:**
1. Ensure MySQL Server is running
2. Verify DB credentials in `.env` match your MySQL setup
3. Check MySQL is listening on port 3306: `mysql -u root -p`

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE :::5000`

**Solution:**
- Backend: Change `PORT` in `.env`
- Frontend: Run `npm run dev -- --port 5174`

### Dependencies Won't Install
**Problem:** `npm ERR! code ERESOLVE unable to resolve dependency tree`

**Solution:**
```bash
npm install --legacy-peer-deps
```

### Database Initialization Fails
**Problem:** `Error: Access denied for user`

**Solution:**
1. Verify `DB_USER` and `DB_PASSWORD` in `.env`
2. Ensure the user has permissions to create databases
3. Manually create database: `mysql -u root -p -e "CREATE DATABASE pickaroo;"`

### Frontend Can't Connect to Backend
**Problem:** CORS errors or 404 responses

**Solution:**
1. Verify backend is running on port 5000
2. Check frontend `.env` has correct `APP_URL`
3. Verify API calls use correct endpoints

---

## Project Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | Node.js, Express.js |
| Backend Database | MySQL |
| Frontend Framework | React 19 |
| Frontend Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Authentication | JWT (JSON Web Tokens) |
| AI Integration | Google GenAI |
| State Management | Zustand |
| HTTP Client | Axios |

---

## Additional Commands

### Backend
```bash
npm run dev          # Start with hot reload
npm run start        # Start production server
npm run db:init      # Initialize database
npm run db:seed-users  # Seed test users
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run TypeScript type check
npm run clean        # Remove dist directory
```

---

## Need Help?

1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Ensure ports 5000 and 5173 are not in use
4. Check MySQL server status and permissions
5. Review backend README at `backend/README.md`

Good luck! 🚀
