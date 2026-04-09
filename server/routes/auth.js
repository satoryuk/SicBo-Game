const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const DailyBonus = require("../models/DailyBonus");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");
const router = express.Router();

// Generate tokens
function generateTokens(userId, username, role) {
  const accessToken = jwt.sign(
    { id: userId, username, role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );

  return { accessToken, refreshToken };
}

// Coin reward per streak day (caps at day 7+)
function streakBonus(day) {
  const table = [50, 75, 100, 150, 200, 300, 500];
  return table[Math.min(day - 1, table.length - 1)];
}

// Check if two dates are on consecutive calendar days
function isNextDay(lastDate, now) {
  const last = new Date(lastDate);
  const d1 = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d2 - d1 === 86400000; // exactly 1 day apart
}

function isSameDay(lastDate, now) {
  const last = new Date(lastDate);
  return (
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate()
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists)
      return res.status(400).json({ message: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      loginStreak: 1,
      lastLoginDate: new Date(),
    });

    const { accessToken, refreshToken } = generateTokens(
      user._id,
      username,
      user.role,
    );

    // Store refresh token in database
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        username,
        role: user.role,
        coins: user.coins,
        rank: user.rank,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    if (user.isBanned)
      return res
        .status(403)
        .json({ message: `Account banned: ${user.bannedReason}` });

    // ── Daily bonus / login streak ──────────────────────────────────────────
    const now = new Date();
    let bonusCoins = 0;
    let newStreak = user.loginStreak || 0;
    let bonusGranted = false;

    if (!user.lastLoginDate || !isSameDay(user.lastLoginDate, now)) {
      if (user.lastLoginDate && isNextDay(user.lastLoginDate, now)) {
        newStreak += 1; // consecutive day → extend streak
      } else {
        newStreak = 1; // streak broken or first login
      }
      bonusCoins = streakBonus(newStreak);
      bonusGranted = true;

      // Award bonus coins & record
      await User.findByIdAndUpdate(user._id, {
        $inc: { coins: bonusCoins },
        loginStreak: newStreak,
        lastLoginDate: now,
      });

      await DailyBonus.create({
        userId: user._id,
        username: user.username,
        streakDay: newStreak,
        coinsAwarded: bonusCoins,
        claimedAt: now,
      });

      await Transaction.create({
        userId: user._id,
        username: user.username,
        type: "bonus",
        amount: 0,
        coins: bonusCoins,
        note: `Daily login bonus — Day ${newStreak} streak`,
      });
    } else {
      // Already logged in today — just update lastLoginDate timestamp
      await User.findByIdAndUpdate(user._id, { lastLoginDate: now });
    }

    const updated = await User.findById(user._id);

    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.username,
      user.role,
    );

    // Store refresh token in database
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: updated._id,
        username: updated.username,
        role: updated.role,
        coins: updated.coins,
        rank: updated.rank,
        loginStreak: updated.loginStreak,
      },
      bonusGranted,
      bonusCoins,
      streakDay: newStreak,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/profile  (alias: /me)
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me  — alias used by Wallet.jsx and other components
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/refresh — refresh access token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    // Find user and verify refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (user.isBanned) {
      return res
        .status(403)
        .json({ message: `Account banned: ${user.bannedReason}` });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id, user.username, user.role);

    // Update refresh token in database
    await User.findByIdAndUpdate(user._id, {
      refreshToken: tokens.refreshToken,
    });

    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/logout — invalidate refresh token
router.post("/logout", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
