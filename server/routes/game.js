const express = require('express');
const User    = require('../models/User');
const Round   = require('../models/Round');
const auth    = require('../middleware/auth');
const router  = express.Router();

const TOTAL_PAYOUTS = {4:50,5:18,6:14,7:12,8:8,9:6,10:6,11:6,12:6,13:8,14:12,15:14,16:18,17:50};

function rollDice() { return Math.floor(Math.random() * 6) + 1; }

function calcPayout(betType, betValue, betAmount, vals, total, isTriple) {
  if (betType === 'bigsmall') {
    if (isTriple) return 0;
    if (betValue === 'big'   && total >= 11) return betAmount * 2;
    if (betValue === 'small' && total <= 10) return betAmount * 2;
    return 0;
  }
  if (betType === 'number') {
    const count = vals.filter(v => v === betValue).length;
    return count === 0 ? 0 : betAmount * (count + 1);
  }
  if (betType === 'total') {
    return total === betValue ? betAmount * (TOTAL_PAYOUTS[betValue] + 1) : 0;
  }
  return 0;
}

// POST /api/game/roll
router.post('/roll', auth, async (req, res) => {
  try {
    const { betType, betValue, betAmount } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (betAmount > user.balance) return res.status(400).json({ message: 'Insufficient balance' });

    const vals     = [rollDice(), rollDice(), rollDice()];
    const total    = vals.reduce((a, b) => a + b, 0);
    const isTriple = vals[0] === vals[1] && vals[1] === vals[2];
    const payout   = calcPayout(betType, betValue, betAmount, vals, total, isTriple);
    const won      = payout > 0;

    user.balance     += payout - betAmount;
    user.totalRounds += 1;
    won ? user.totalWins++ : user.totalLosses++;
    if (user.balance < 0) user.balance = 0;
    await user.save();

    await Round.create({
      userId: user._id, username: user.username,
      diceValues: vals, total, betType, betValue,
      betAmount, payout, won
    });

    res.json({ vals, total, isTriple, payout, won, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/game/history
router.get('/history', auth, async (req, res) => {
  try {
    const rounds = await Round.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(20);
    res.json(rounds);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;