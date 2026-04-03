# Sic Bo Game

A real-time multiplayer Sic Bo dice game built with React, Node.js, Express, Socket.io, and MongoDB.

## Features

- User authentication (register/login)
- Real-time dice rolling with Socket.io
- Balance management
- Bet history tracking
- Leaderboard with top players
- Responsive UI

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

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Server Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install express mongoose socket.io jsonwebtoken bcryptjs dotenv cors
   ```

3. Configure environment variables in `.env`:

   ```
   MONGODB_URI=mongodb://localhost:27017/sicbo
   JWT_SECRET=your_jwt_secret_key_change_in_production
   PORT=5000
   ```

4. Start the server:
   ```bash
   node server.js
   ```

### Client Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install react react-dom react-router-dom socket.io-client
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

## How to Play

1. Register or login with your credentials
2. Place your bets on the game board
3. Click "Roll Dice" to play
4. Win or lose based on the dice outcome
5. Check the leaderboard to see top players

## API Endpoints

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
