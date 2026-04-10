const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const walletRoutes = require("./routes/wallet");
const adminRoutes = require("./routes/admin");
const leaderboardRoutes = require("./routes/leaderboard");
const { initSocket } = require("./socket/gameSocket");

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(
  Boolean,
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const mongoose = require("mongoose");

app.get("/", (req, res) => {
  res.status(200).json({
    message: "SicBo Game Server is running!",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || "development",
    database: dbStatus[dbState] || "unknown",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.set("io", io);

initSocket(io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
