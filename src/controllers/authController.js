const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const admin = await Admin.findOne({ email })
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' })

    res.json({ token: signToken(admin._id), admin: { id: admin._id, email: admin.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.me = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password')
    res.json(admin)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Run once to seed the first admin: POST /api/auth/seed
exports.seed = async (req, res) => {
  try {
    const count = await Admin.countDocuments()
    if (count > 0) return res.status(403).json({ message: 'Admin already exists' })
    const { email, password } = req.body
    const admin = await Admin.create({ email, password })
    res.status(201).json({ message: 'Admin created', email: admin.email })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
