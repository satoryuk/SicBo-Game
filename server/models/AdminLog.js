const mongoose = require('mongoose')

const AdminLogSchema = new mongoose.Schema({
  adminId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminName:  { type: String, required: true },
  action:     { type: String, required: true }, // e.g. 'ban_user', 'reset_balance'
  targetId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetName: { type: String },
  detail:     { type: String }, // extra info
}, { timestamps: true })

module.exports = mongoose.model('AdminLog', AdminLogSchema)
