const mongoose = require('mongoose')

const DailyBonusSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:     { type: String, required: true },
  streakDay:    { type: Number, required: true },   // which day of streak (1,2,3...)
  coinsAwarded: { type: Number, required: true },   // coins given for this day
  claimedAt:    { type: Date,   default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('DailyBonus', DailyBonusSchema)
