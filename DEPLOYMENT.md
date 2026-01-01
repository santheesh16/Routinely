# Deployment Guide for Routinely

This guide will help you deploy the Routinely habit tracker application on Render using Docker.

## Prerequisites

1. **Clerk Account**: Sign up at [clerk.com](https://clerk.com) and create an application
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) for free tier
3. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Set up MongoDB Atlas

1. Create a new cluster (choose the free M0 tier)
2. Create a database user (remember the username and password)
3. Add your IP address to the network access whitelist (or use 0.0.0.0/0 for development)
4. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/routinely?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual password

## Step 2: Set up Clerk

1. Create a new application in Clerk
2. Get your keys from the Clerk dashboard:
   - **Publishable Key**: Found in API Keys section (starts with `pk_`)
   - **Secret Key**: Found in API Keys section (starts with `sk_`)
3. Configure authentication methods (email, social, etc.)
4. Set up redirect URLs:
   - After sign in: `https://your-app-name.onrender.com/`
   - After sign up: `https://your-app-name.onrender.com/`

## Step 3: Deploy Backend on Render

1. Go to Render dashboard and click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `routinely-backend` (or your preferred name)
   - **Environment**: Docker
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`

4. Add environment variables:
   ```
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   CLERK_SECRET_KEY=<your-clerk-secret-key>
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-name.onrender.com
   ```

5. Click "Create Web Service"
6. Note the service URL (e.g., `https://routinely-backend.onrender.com`)

## Step 4: Deploy Frontend on Render

1. Go to Render dashboard and click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `routinely-frontend` (or your preferred name)
   - **Environment**: Docker
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `frontend/Dockerfile`

4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-name.onrender.com/api
   VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
   ```

5. Update the frontend Dockerfile to use environment variables at build time:
   - The Vite build needs these at build time, so you may need to adjust the Dockerfile

6. Click "Create Web Service"
7. Note the service URL (e.g., `https://routinely-frontend.onrender.com`)

## Step 5: Update Configuration

1. **Update Backend FRONTEND_URL**: Go to backend service settings and update `FRONTEND_URL` to your frontend URL
2. **Update Clerk Redirect URLs**: Add your production URLs to Clerk dashboard
3. **Rebuild Services**: Trigger a rebuild on both services after updating environment variables

## Alternative: Using Render's Native Build (Without Docker)

If you prefer not to use Docker, you can deploy using Render's native build:

### Backend:
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: `backend`

### Frontend:
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npm run preview` (or use a static site service)
- **Root Directory**: `frontend`

For frontend, consider using Render's Static Site service instead:
1. Select "Static Site" instead of "Web Service"
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`

## Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/routinely?retryWrites=true&w=majority
CLERK_SECRET_KEY=sk_live_your_secret_key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

## Health Checks

Render will automatically check:
- Backend: `https://your-backend.onrender.com/api/health`
- Frontend: `https://your-frontend.onrender.com/`

## Troubleshooting

1. **Build Failures**: Check build logs in Render dashboard
2. **Environment Variables**: Ensure all variables are set correctly
3. **CORS Issues**: Verify `FRONTEND_URL` matches your frontend URL exactly
4. **Database Connection**: Verify MongoDB Atlas network access includes Render's IPs (or use 0.0.0.0/0)
5. **Authentication**: Verify Clerk keys are correct and redirect URLs are configured

## Free Tier Limits

- **Render**: 
  - Services spin down after 15 minutes of inactivity (free tier)
  - First request may take longer due to cold start
- **MongoDB Atlas**: 
  - 512MB storage
  - Shared resources
- **Clerk**: 
  - Free tier includes up to 10,000 monthly active users

## Custom Domain (Optional)

1. In Render dashboard, go to your service settings
2. Click "Custom Domains"
3. Add your domain and follow DNS configuration instructions

## Monitoring

- Monitor service health in Render dashboard
- Check logs for errors
- Monitor MongoDB Atlas for database performance
- Track usage in Clerk dashboard
