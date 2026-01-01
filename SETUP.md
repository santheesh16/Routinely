# Setup Instructions for Routinely

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Clerk account (sign up at https://clerk.com)

### Step 1: Clone and Install Dependencies

```bash
# Install root dependencies (for running both frontend and backend)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your keys:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)
4. Configure sign-in methods (email, etc.)

### Step 3: Set up MongoDB

#### Option A: Local MongoDB
- Install MongoDB locally
- MongoDB will run on `mongodb://localhost:27017/routinely`

#### Option B: MongoDB Atlas (Recommended for deployment)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string (format: `mongodb+srv://user:password@cluster.mongodb.net/routinely`)

### Step 4: Environment Variables

#### Backend (.env file in `backend/` directory)

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/routinely
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/routinely

CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_JWT_KEY=your_clerk_jwt_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important:** To get your `CLERK_JWT_KEY`:
1. Go to your Clerk Dashboard
2. Navigate to **API Keys** section
3. Find the **JWT Template** or **JWT Key** 
4. Copy the JWT key (it's a public key used for token verification)
5. Add it to your `.env` file as `CLERK_JWT_KEY`

Alternatively, you can create a JWT template in Clerk Dashboard under **JWT Templates** and use that template name in the frontend.

#### Frontend (.env file in `frontend/` directory)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Step 5: Run the Application

#### Option A: Run Both Services Together (from root)

```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 5173) concurrently.

#### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 6: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Build and run all services
docker-compose up

# Or run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

Note: You still need to set environment variables in `docker-compose.yml` or use `.env` files.

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running (if local)
   - Verify MongoDB URI in `.env`
   - Check network access (if using Atlas)

2. **Clerk Authentication Error**
   - Verify `CLERK_SECRET_KEY` is correct
   - Check token format in requests
   - Review Clerk dashboard for API key status

3. **Port Already in Use**
   - Change `PORT` in backend `.env`
   - Or stop the process using port 5000

### Frontend Issues

1. **API Connection Error**
   - Verify `VITE_API_URL` matches backend URL
   - Check CORS settings in backend
   - Ensure backend is running

2. **Clerk Authentication Issues**
   - Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
   - Check Clerk dashboard for redirect URLs
   - Clear browser cache and cookies

3. **Build Errors**
   - Delete `node_modules` and reinstall
   - Check Node.js version (18+ required)
   - Review error messages in terminal

### Common Commands

```bash
# Clean install (if having dependency issues)
rm -rf node_modules package-lock.json
npm install

# Backend only
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend only
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Sign up for an account in the application
2. Start tracking your habits:
   - Add budget transactions
   - Log gym sessions
   - Record DSA problems solved
   - Track German study sessions

3. Check out the dashboard for an overview of all your progress!

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to Render.
