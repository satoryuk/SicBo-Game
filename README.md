# Sic Bo Game

A real-time multiplayer Sic Bo dice game built with React, Node.js, Express, Socket.io, and MongoDB.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Production Tips](#production-tips)
- [Troubleshooting](#troubleshooting)
- [Command Reference](#command-reference)

## Features

- User authentication (register/login)
- Real-time dice rolling with Socket.io
- Balance management
- Bet history tracking
- Leaderboard with top players
- Responsive UI
- Health check endpoint for monitoring
- Production-ready configuration

## Quick Start

Get running locally in 5 minutes:

```bash
# 1. Clone and navigate
git clone https://github.com/YOUR_USERNAME/sicbo-game.git
cd sicbo-game

# 2. Setup backend
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# 3. Setup frontend (new terminal)
cd client
npm install
cp .env.example .env

# 4. Start backend
cd server
npm start

# 5. Start frontend (new terminal)
cd client
npm start
```

Visit `http://localhost:3000` and start playing!

## Project Structure

```
sicbo-app/
├── server/
│   ├── server.js              # Express + Socket.io entry point
│   ├── .env                   # MongoDB URI + JWT secret
│   ├── config/db.js           # Database connection
│   ├── models/User.js         # User schema (balance, wins, rounds)
│   ├── models/Round.js        # Bet history schema
│   ├── middleware/auth.js     # JWT protection
│   ├── routes/auth.js         # Register & Login
│   ├── routes/game.js         # Roll dice + history
│   ├── routes/leaderboard.js  # Top players
│   └── socket/gameSocket.js   # Real-time events
├── client/
│   ├── src/
│   │   ├── App.js             # Routes setup
│   │   ├── socket.js          # Socket.io client
│   │   ├── context/AuthContext.js  # Login state
│   │   ├── pages/Login.jsx    # Register/Login page
│   │   ├── pages/Game.jsx     # Main game page
│   │   └── pages/Leaderboard.jsx  # Top players page
└── README.md
```

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Setup Steps

1. **Install Backend Dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Configure Backend Environment**

   ```bash
   cp .env.example .env
   ```

   Edit `server/.env`:

   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/sicbo
   JWT_SECRET=your_jwt_secret_key_change_in_production
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd client
   npm install
   ```

4. **Configure Frontend Environment**

   ```bash
   cp .env.example .env
   ```

   Edit `client/.env`:

   ```env
   REACT_APP_API_URL=http://localhost:5001
   ```

5. **Start MongoDB**

   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows - runs automatically as service
   ```

6. **Run the Application**

   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd client
   npm start
   ```

### How to Play

1. Register or login with your credentials
2. Place your bets on the game board
3. Click "Roll Dice" to play
4. Win or lose based on the dice outcome
5. Check the leaderboard to see top players

## Deployment

### Prerequisites for Deployment

1. **MongoDB Atlas Account** (free tier)
   - Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string
   - Whitelist all IPs (0.0.0.0/0)

2. **GitHub Repository**

   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sicbo-game.git
   git push -u origin main
   ```

3. **Render Account** (free tier at [render.com](https://render.com))

### Deploy to Render (Recommended)

#### Option 1: Using Blueprint (One-Click)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render detects `render.yaml` and creates both services
5. Set environment variables when prompted

#### Option 2: Manual Setup

**Deploy Backend:**

1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name**: `sicbo-server`
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: (add after frontend deployment)

5. Deploy and copy the server URL

**Deploy Frontend:**

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `sicbo-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free

4. Add Environment Variable:
   - `REACT_APP_API_URL`: Your backend URL

5. Deploy and copy the client URL

**Update Backend CORS:**

1. Go back to backend service
2. Add/update `CLIENT_URL` with your frontend URL
3. Service auto-redeploys

### Deployment Checklist

Before deploying:

- [ ] All features tested locally
- [ ] `.env` files in `.gitignore`
- [ ] Strong JWT secret generated
- [ ] MongoDB Atlas configured
- [ ] Code pushed to GitHub
- [ ] Environment variables prepared

After deploying:

- [ ] Health check works: `https://your-server.onrender.com/health`
- [ ] Can register/login
- [ ] Game functionality works
- [ ] No CORS errors
- [ ] WebSocket connection stable

### Alternative Platforms

**Vercel (Frontend):**

```bash
cd client
npm install -g vercel
vercel
```

**Heroku (Backend):**

```bash
cd server
heroku create sicbo-server
heroku config:set MONGODB_URI=your_connection_string
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

## Environment Variables

### Backend (server/.env)

```env
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sicbo
JWT_SECRET=your_64_character_random_string
CLIENT_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
```

### Frontend (client/.env)

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

**Important:** Never commit `.env` files to Git!

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Game

- `POST /api/game/roll` - Roll dice (protected)
- `GET /api/game/history` - Get bet history (protected)

### Leaderboard

- `GET /api/leaderboard` - Get top players (protected)

## Socket Events

- `connection` - Client connects
- `disconnect` - Client disconnects
- `roll_dice` - Emit dice roll result
- `balance_update` - Update user balance

## License

MIT

## Production Tips

### Security Best Practices

- Use strong, randomly generated JWT secrets (64+ characters)
- Never commit `.env` files to version control
- Enable MongoDB authentication and encryption
- Implement rate limiting for API endpoints
- Keep dependencies updated: `npm audit fix`

### Performance Optimization

- Add database indexes for frequently queried fields
- Implement caching for leaderboard data
- Use connection pooling for MongoDB
- Compress API responses
- Optimize frontend bundle size

### Monitoring

- Monitor `/health` endpoint with uptime services
- Set up error tracking (Sentry, Rollbar)
- Review server logs regularly
- Track database performance metrics
- Monitor WebSocket connection stability

## Troubleshooting

### Backend Issues

**MongoDB connection fails:**

- Verify connection string is correct
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Ensure database user has proper permissions

**Port already in use:**

```bash
# Find process using port
lsof -i :5001  # macOS/Linux
netstat -ano | findstr :5001  # Windows
```

**CORS errors:**

- Verify `CLIENT_URL` environment variable
- Check URL matches frontend exactly (no trailing slash)

### Frontend Issues

**API calls fail:**

- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for errors
- Test backend health endpoint directly

**Build fails:**

- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check for missing dependencies

### Deployment Issues

**Service won't start on Render:**

- Check logs in Render Dashboard
- Verify all environment variables are set
- Ensure build and start commands are correct

**Free tier services sleep:**

- First request after 15 minutes takes 30-50 seconds
- Consider upgrading to paid tier for always-on service

## Command Reference

### Development Commands

```bash
# Start backend (development mode with auto-reload)
cd server && npm run dev

# Start frontend
cd client && npm start

# Build frontend for production
cd client && npm run build

# Clear all game data
cd server && npm run clear-data

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Git Commands

```bash
# Initial setup
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sicbo-game.git
git push -u origin main

# Regular updates
git add .
git commit -m "Your message"
git push
```

### Testing Commands

```bash
# Test health endpoint
curl http://localhost:5001/health

# Test registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Check for outdated packages
npm outdated

# Security audit
npm audit
npm audit fix
```

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Render Documentation](https://render.com/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Ready to deploy?** Follow the [Deployment](#deployment) section and start with the checklist! 🎲
