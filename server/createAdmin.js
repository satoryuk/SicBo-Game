/**
 * Run this script once to create an admin account:
 *   node createAdmin.js
 *
 * Credentials: admin / admin123
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const User     = require('./models/User')

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  const existing = await User.findOne({ username: 'admin' })
  if (existing) {
    // Make sure it has admin role even if it was created before
    existing.role = 'admin'
    await existing.save()
    console.log('ℹ️  User "admin" already exists — role set to admin.')
    console.log('   Username : admin')
    console.log('   Password : (unchanged from when it was created)')
    process.exit(0)
  }

  const hashed = await bcrypt.hash('admin123', 10)
  await User.create({
    username:  'admin',
    password:  hashed,
    role:      'admin',
    coins:     0,
    loginStreak: 0,
  })

  console.log('🎉 Admin account created!')
  console.log('   Username : admin')
  console.log('   Password : admin123')
  console.log('')
  console.log('⚠️  Change the password after first login!')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
