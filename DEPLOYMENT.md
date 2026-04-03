# Render Deployment Guide

## Prerequisites

1. GitHub account
2. MongoDB Atlas account (free)
3. Render account (free)

## Step 1: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/sicbo`)
5. Replace `<password>` with your actual password

## Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sicbo-game.git
git push -u origin main
```

## Step 3: Deploy Server on Render

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `sicbo-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Any random string (e.g., `your-super-secret-jwt-key-12345`)
   - `CLIENT_URL`: Leave blank for now (will add after client deployment)
   - `NODE_ENV`: `production`

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your server URL (e.g., `https://sicbo-server.onrender.com`)

## Step 4: Deploy Client on Render

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `sicbo-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free

4. Add Environment Variable:
   - `REACT_APP_API_URL`: Your server URL from Step 3 (e.g., `https://sicbo-server.onrender.com`)

5. Click "Create Static Site"
6. Wait for deployment
7. Copy your client URL (e.g., `https://sicbo-client.onrender.com`)

## Step 5: Update Server CORS

1. Go back to your server service on Render
2. Go to "Environment" tab
3. Add/Update `CLIENT_URL` variable with your client URL from Step 4
4. Service will auto-redeploy

## Done! 🎉

Your app is now live at your client URL!

## Important Notes

- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Free tier has 750 hours/month (enough for one service)
- Both services get free SSL certificates

## Troubleshooting

- Check logs in Render dashboard if deployment fails
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify all environment variables are set correctly
