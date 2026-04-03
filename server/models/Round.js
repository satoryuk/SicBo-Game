const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:   { type: String, required: true },
  diceValues: { type: [Number], required: true },
  total:      { type: Number, required: true },
  betType:    { type: String, enum: ['bigsmall', 'number', 'total'], required: true },
  betValue:   { type: mongoose.Schema.Types.Mixed, required: true },
  betAmount:  { type: Number, required: true },
  payout:     { type: Number, required: true },
  won:        { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Round', RoundSchema);