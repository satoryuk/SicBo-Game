const express = require("express");
const User = require("../models/User");
const Round = require("../models/Round");
const Transaction = require("../models/Transaction");
const AdminLog = require("../models/AdminLog");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();

// All routes require auth + admin role
router.use(auth, isAdmin);

// Helper: log admin action
const log = (adminId, adminName, action, targetId, targetName, detail) =>
  AdminLog.create({ adminId, adminName, action, targetId, targetName, detail });

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const [
      totalUsers,
      totalRounds,
      bannedUsers,
      flaggedUsers,
      transactions,
      recentRounds,
      pendingWithdrawals,
    ] = await Promise.all([
      User.countDocuments({ role: "player" }),
      Round.countDocuments(),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ isFlagged: true }),
      Transaction.find().sort({ createdAt: -1 }).limit(500),
      Round.find().sort({ createdAt: -1 }).limit(10),
      Transaction.countDocuments({ type: "withdraw", status: "pending" }),
    ]);

    const totalDeposits = transactions
      .filter((t) => t.type === "deposit")
      .reduce((s, t) => s + t.amount, 0);
    const totalWithdrawals = transactions
      .filter((t) => t.type === "withdraw" && t.status === "completed")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalBetCoins = transactions
      .filter((t) => t.type === "bet")
      .reduce((s, t) => s + Math.abs(t.coins), 0);
    const totalWinCoins = transactions
      .filter((t) => t.type === "win")
      .reduce((s, t) => s + t.coins, 0);
    const houseProfit = totalBetCoins - totalWinCoins;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await Round.distinct("userId", {
      createdAt: { $gte: since },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyRevenue = await Transaction.aggregate([
      { $match: { type: "deposit", createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Bet type distribution (last 500 rounds)
    const betTypes = await Round.aggregate([
      {
        $group: {
          _id: "$betType",
          count: { $sum: 1 },
          totalWagered: { $sum: "$betAmount" },
        },
      },
    ]);

    res.json({
      totalUsers,
      totalRounds,
      bannedUsers,
      flaggedUsers,
      activeUsers: activeUsers.length,
      totalDeposits,
      totalWithdrawals,
      houseProfit,
      netRevenue: totalDeposits - totalWithdrawals,
      pendingWithdrawals,
      dailyRevenue,
      recentRounds,
      betTypes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── USER MANAGEMENT ───────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: "player" };
    if (search) query.username = { $regex: search, $options: "i" };

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const rounds = await Round.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20);
    const txns = await Transaction.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ user, rounds, transactions: txns });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/ban", async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, bannedReason: reason || "Banned by admin" },
      { new: true },
    );
    await log(
      req.user.id,
      req.user.username,
      "ban_user",
      user._id,
      user.username,
      reason,
    );
    res.json({ message: `${user.username} has been banned` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/unban", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, bannedReason: "", isFlagged: false },
      { new: true },
    );
    await log(
      req.user.id,
      req.user.username,
      "unban_user",
      user._id,
      user.username,
      "",
    );
    res.json({ message: `${user.username} has been unbanned` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/reset-balance", async (req, res) => {
  try {
    const { coins } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { coins: coins ?? 1000 },
      { new: true },
    );
    await log(
      req.user.id,
      req.user.username,
      "reset_balance",
      user._id,
      user.username,
      `Set to ${coins} coins`,
    );
    res.json({
      message: `Balance reset to ${user.coins} coins`,
      coins: user.coins,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/add-coins", async (req, res) => {
  try {
    const { coins, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { coins } },
      { new: true },
    );
    await Transaction.create({
      userId: user._id,
      username: user.username,
      type: "bonus",
      amount: 0,
      coins,
      note: reason || `Admin added ${coins} coins`,
    });
    await log(
      req.user.id,
      req.user.username,
      "add_coins",
      user._id,
      user.username,
      `+${coins} coins: ${reason}`,
    );
    res.json({
      message: `Added ${coins} coins to ${user.username}`,
      coins: user.coins,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/users/:id/flag   — manually flag/unflag suspicious
router.post("/users/:id/flag", async (req, res) => {
  try {
    const { flagged } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isFlagged: flagged },
      { new: true },
    );
    await log(
      req.user.id,
      req.user.username,
      flagged ? "flag_user" : "unflag_user",
      user._id,
      user.username,
      "",
    );
    res.json({
      message: `${user.username} ${flagged ? "flagged" : "unflagged"}`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── TRANSACTIONS ──────────────────────────────────────────────────────────────
router.get("/transactions", async (req, res) => {
  try {
    const { type, status, page = 1, limit = 30 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const txns = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Transaction.countDocuments(query);
    res.json({ transactions: txns, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── WITHDRAWAL APPROVAL ────────────────────────────────────────────────────────
// GET /api/admin/withdrawals  — list pending withdrawals
router.get("/withdrawals", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const txns = await Transaction.find({ type: "withdraw", status: "pending" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Transaction.countDocuments({
      type: "withdraw",
      status: "pending",
    });
    res.json({ transactions: txns, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/withdrawals/:id/approve
router.post("/withdrawals/:id/approve", async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn || txn.type !== "withdraw" || txn.status !== "pending")
      return res.status(404).json({ message: "Pending withdrawal not found" });

    txn.status = "completed";
    txn.note += " — Approved by admin";
    await txn.save();

    await log(
      req.user.id,
      req.user.username,
      "approve_withdrawal",
      txn.userId,
      txn.username,
      `$${txn.amount} withdrawal approved`,
    );

    const io = req.app.get("io");
    if (io) {
      console.log(
        "Emitting withdrawal_approved event for user:",
        txn.userId.toString(),
      );
      io.emit("withdrawal_approved", {
        userId: txn.userId.toString(),
        amount: txn.amount,
        coins: Math.abs(txn.coins),
      });
    } else {
      console.log("IO instance not found!");
    }

    res.json({
      message: `Withdrawal of $${txn.amount} approved for ${txn.username}`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/withdrawals/:id/reject
router.post("/withdrawals/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const txn = await Transaction.findById(req.params.id);
    if (!txn || txn.type !== "withdraw" || txn.status !== "pending")
      return res.status(404).json({ message: "Pending withdrawal not found" });

    // Refund coins to user
    const coinsToRefund = Math.abs(txn.coins);
    await User.findByIdAndUpdate(txn.userId, {
      $inc: { coins: coinsToRefund },
    });

    txn.status = "rejected";
    txn.note += ` — Rejected: ${reason || "No reason given"}`;
    await txn.save();

    await Transaction.create({
      userId: txn.userId,
      username: txn.username,
      type: "bonus",
      amount: 0,
      coins: coinsToRefund,
      note: `Refund for rejected withdrawal`,
    });

    await log(
      req.user.id,
      req.user.username,
      "reject_withdrawal",
      txn.userId,
      txn.username,
      `$${txn.amount} rejected: ${reason}`,
    );

    const io = req.app.get("io");
    if (io) {
      io.emit("withdrawal_rejected", {
        userId: txn.userId.toString(),
        amount: txn.amount,
        coins: coinsToRefund,
        reason: reason || "No reason given",
      });
    }

    res.json({
      message: `Withdrawal rejected and ${coinsToRefund} coins refunded to ${txn.username}`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── ALL BETS LOG ──────────────────────────────────────────────────────────────
// GET /api/admin/rounds
router.get("/rounds", async (req, res) => {
  try {
    const { page = 1, limit = 30, userId } = req.query;
    const query = userId ? { userId } : {};
    const rounds = await Round.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Round.countDocuments(query);
    res.json({ rounds, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── SUSPICIOUS USERS ──────────────────────────────────────────────────────────
// GET /api/admin/suspicious
router.get("/suspicious", async (req, res) => {
  try {
    const users = await User.find({ isFlagged: true, role: "player" }).select(
      "-password",
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── GAME SETTINGS ─────────────────────────────────────────────────────────────
// Stored in-memory with a simple JSON file fallback
const fs = require("fs");
const path = require("path");
const SETTINGS_FILE = path.join(__dirname, "../config/gameSettings.json");

function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
  } catch {
    return { minBet: 1, maxBet: 10000, maintenanceMode: false };
  }
}

function saveSettings(s) {
  try {
    fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2));
  } catch (e) {
    console.error("Could not save settings:", e.message);
  }
}

router.get("/settings", (req, res) => res.json(loadSettings()));

router.put("/settings", (req, res) => {
  const current = loadSettings();
  const updated = { ...current, ...req.body };
  saveSettings(updated);
  res.json({ message: "Settings updated", settings: updated });
});

// ── ADMIN LOGS ────────────────────────────────────────────────────────────────
router.get("/logs", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AdminLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await AdminLog.countDocuments();
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
