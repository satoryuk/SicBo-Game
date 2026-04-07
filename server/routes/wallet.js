const express     = require('express')
const User        = require('../models/User')
const Transaction = require('../models/Transaction')
const auth        = require('../middleware/auth')
const isBanned    = require('../middleware/isBanned')
const router      = express.Router()

const RATE = 100 // $1 = 100 coins

// POST /api/wallet/deposit  — real money → coins (instant)
router.post('/deposit', auth, isBanned, async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0)  return res.status(400).json({ message: 'Invalid amount' })
    if (amount > 10000)          return res.status(400).json({ message: 'Max deposit is $10,000' })

    const coins = amount * RATE

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { coins, realBalance: amount } },
      { new: true }
    )

    await Transaction.create({
      userId: user._id, username: user.username,
      type: 'deposit', amount, coins, status: 'completed',
      note: `Deposited $${amount} → ${coins} coins`,
    })

    res.json({ coins: user.coins, realBalance: user.realBalance, addedCoins: coins })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/wallet/withdraw  — coins → real money (PENDING — needs admin approval)
router.post('/withdraw', auth, isBanned, async (req, res) => {
  try {
    const { coins } = req.body
    if (!coins || coins <= 0) return res.status(400).json({ message: 'Invalid amount' })

    const user = await User.findById(req.user.id)
    if (!user)              return res.status(404).json({ message: 'User not found' })
    if (user.coins < coins) return res.status(400).json({ message: 'Not enough coins' })
    if (coins < RATE)       return res.status(400).json({ message: `Minimum withdrawal is ${RATE} coins ($1)` })

    const money = coins / RATE

    // Deduct coins immediately (hold them during pending)
    await User.findByIdAndUpdate(req.user.id, { $inc: { coins: -coins } })

    const txn = await Transaction.create({
      userId:   user._id,
      username: user.username,
      type:     'withdraw',
      amount:   money,
      coins:    -coins,
      status:   'pending',
      note:     `Withdrawal request: ${coins} coins → $${money.toFixed(2)} (pending approval)`,
    })

    const updated = await User.findById(req.user.id)
    res.json({
      coins:         updated.coins,
      pendingMoney:  money,
      transactionId: txn._id,
      message:       'Withdrawal request submitted. Pending admin approval.',
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/wallet/transactions  — personal history
router.get('/transactions', auth, async (req, res) => {
  try {
    const txns = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(50)
    res.json(txns)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
