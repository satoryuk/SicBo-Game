const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  password:     { type: String, required: true },
  balance:      { type: Number, default: 1000 },
  totalWins:    { type: Number, default: 0 },
  totalLosses:  { type: Number, default: 0 },
  totalRounds:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);