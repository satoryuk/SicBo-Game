const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes        = require("./routes/auth");
const gameRoutes        = require("./routes/game");
const walletRoutes      = require("./routes/wallet");
const adminRoutes       = require("./routes/admin");
const leaderboardRoutes = require("./routes/leaderboard");
const { initSocket } = require("./socket/gameSocket");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Allow multiple origins for CORS
const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth",        authRoutes);
app.use("/api/game",        gameRoutes);
app.use("/api/wallet",      walletRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

initSocket(io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
