const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// Always fetches role from DB so old tokens without 'role' still work
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Fetch fresh user so isBanned / role changes take effect immediately
    const user = await User.findById(decoded.id).select('username role isBanned bannedReason')
    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = {
      id:       user._id.toString(),
      username: user.username,
      role:     user.role,
    }
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = authMiddleware