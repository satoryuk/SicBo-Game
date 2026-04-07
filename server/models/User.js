const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true, trim: true },
  password:      { type: String, required: true },
  role:          { type: String, enum: ['player', 'admin'], default: 'player' },

  // Wallet
  coins:         { type: Number, default: 1000 },
  realBalance:   { type: Number, default: 0 },      // total real money deposited

  // Game stats
  totalWins:    { type: Number, default: 0 },
  totalLosses:  { type: Number, default: 0 },
  totalRounds:  { type: Number, default: 0 },
  totalWagered: { type: Number, default: 0 },       // total coins wagered
  biggestWin:   { type: Number, default: 0 },       // biggest single win payout

  // Rank (computed from totalRounds, stored for quick display)
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'VIP'],
    default: 'Bronze',
  },

  // Daily bonus / login streak
  loginStreak:   { type: Number, default: 0 },
  lastLoginDate: { type: Date, default: null },

  // Moderation
  isBanned:      { type: Boolean, default: false },
  bannedReason:  { type: String, default: '' },

  // Suspicious flag
  isFlagged:     { type: Boolean, default: false },
}, { timestamps: true })

// Helper: compute rank from totalRounds
UserSchema.methods.computeRank = function () {
  if (this.totalRounds >= 500) return 'VIP'
  if (this.totalRounds >= 200) return 'Gold'
  if (this.totalRounds >=  50) return 'Silver'
  return 'Bronze'
}

module.exports = mongoose.model('User', UserSchema)