const express = require('express');
const User    = require('../models/User');
const router  = express.Router();

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ balance: -1 }).limit(10)
      .select('username balance totalWins totalLosses totalRounds');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;