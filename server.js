require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./src/config/db')

const app = express()

connectDB()

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', require('./src/routes/auth'))
app.use('/api/projects', require('./src/routes/projects'))
app.use('/api/gallery', require('./src/routes/gallery'))
app.use('/api/enquiries', require('./src/routes/enquiries'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`TayB API running on port ${PORT}`))
