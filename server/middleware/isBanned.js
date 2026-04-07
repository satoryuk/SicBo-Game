const User = require('../models/User')

const isBanned = async (req, res, next) => {
  const user = await User.findById(req.user.id)
  if (user?.isBanned) {
    return res.status(403).json({ message: `Account banned: ${user.bannedReason}` })
  }
  next()
}
module.exports = isBanned
