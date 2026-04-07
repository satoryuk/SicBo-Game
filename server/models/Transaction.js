const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:    { type: String, required: true },
  type:        { type: String, enum: ['deposit', 'withdraw', 'bet', 'win', 'bonus'], required: true },

  // deposit/withdraw: real money amount
  amount:      { type: Number, required: true },

  // deposit: money → coins rate
  // withdraw: coins → money rate
  coins:       { type: Number, default: 0 },

  status:      { type: String, enum: ['completed', 'pending', 'rejected'], default: 'completed' },
  note:        { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', TransactionSchema)
