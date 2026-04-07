const express = require('express')
const User    = require('../models/User')
const auth    = require('../middleware/auth')
const router  = express.Router()

// GET /api/leaderboard — requires login (players only, no admin, no banned)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ role: 'player', isBanned: false })
      .sort({ totalWins: -1 })
      .limit(20)
      // SAFE fields only — no password, no realBalance, no email
      .select('username rank coins totalWins totalLosses totalRounds biggestWin')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router