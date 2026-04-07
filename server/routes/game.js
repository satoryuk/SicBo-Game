const express      = require('express')
const User         = require('../models/User')
const Round        = require('../models/Round')
const Transaction  = require('../models/Transaction')
const auth         = require('../middleware/auth')
const isBanned     = require('../middleware/isBanned')
const router       = express.Router()

const TOTAL_PAYOUTS = { 4:50,5:18,6:14,7:12,8:8,9:6,10:6,11:6,12:6,13:8,14:12,15:14,16:18,17:50 }

function rollDice() { return Math.floor(Math.random() * 6) + 1 }

function calcPayout(betType, betValue, betAmount, vals, total, isTriple) {
  if (betType === 'bigsmall') {
    if (isTriple) return 0
    if (betValue === 'big'   && total >= 11) return betAmount * 2
    if (betValue === 'small' && total <= 10) return betAmount * 2
    return 0
  }
  if (betType === 'number') {
    const count = vals.filter(v => v === betValue).length
    return count === 0 ? 0 : betAmount * (count + 1)
  }
  if (betType === 'total') {
    return total === betValue ? betAmount * (TOTAL_PAYOUTS[betValue] + 1) : 0
  }
  return 0
}

// POST /api/game/roll
router.post('/roll', auth, isBanned, async (req, res) => {
  try {
    const { betType, betValue, betAmount } = req.body
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (betAmount > user.coins) return res.status(400).json({ message: 'Insufficient coins' })

    const vals     = [rollDice(), rollDice(), rollDice()]
    const total    = vals.reduce((a, b) => a + b, 0)
    const isTriple = vals[0] === vals[1] && vals[1] === vals[2]
    const payout   = calcPayout(betType, betValue, betAmount, vals, total, isTriple)
    const won      = payout > 0

    // Update stats
    const netChange    = payout - betAmount      // negative on loss
    const newBiggest   = won && payout > user.biggestWin ? payout : user.biggestWin

    user.coins        += netChange
    user.totalRounds  += 1
    user.totalWagered += betAmount
    won ? user.totalWins++ : user.totalLosses++
    user.biggestWin    = newBiggest
    user.rank          = user.computeRank()
    if (user.coins < 0) user.coins = 0

    // Suspicious: auto-flag if win rate > 70% after 20+ rounds
    if (user.totalRounds >= 20) {
      const wr = (user.totalWins / user.totalRounds) * 100
      user.isFlagged = wr > 70
    }

    await user.save()

    // Record bet transaction
    await Transaction.create({
      userId: user._id, username: user.username,
      type: 'bet', amount: 0, coins: -betAmount,
      note: `Bet ${betAmount} on ${betType}:${betValue}`,
    })

    // Record win transaction if won
    if (won) {
      await Transaction.create({
        userId: user._id, username: user.username,
        type: 'win', amount: 0, coins: payout,
        note: `Won ${payout} coins — dice: ${vals.join(',')}`,
      })
    }

    await Round.create({
      userId: user._id, username: user.username,
      diceValues: vals, total, betType, betValue,
      betAmount, payout, won,
    })

    res.json({ vals, total, isTriple, payout, won, coins: user.coins })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/game/history
router.get('/history', auth, async (req, res) => {
  try {
    const rounds = await Round.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(20)
    res.json(rounds)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/game/stats  — personal stats for Profile page
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const winRate = user.totalRounds > 0
      ? ((user.totalWins / user.totalRounds) * 100).toFixed(1)
      : '0.0'

    res.json({
      totalRounds:  user.totalRounds,
      totalWins:    user.totalWins,
      totalLosses:  user.totalLosses,
      totalWagered: user.totalWagered,
      biggestWin:   user.biggestWin,
      winRate,
      rank:         user.rank,
      loginStreak:  user.loginStreak,
      coins:        user.coins,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router