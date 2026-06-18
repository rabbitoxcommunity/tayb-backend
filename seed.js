require('dotenv').config()
const mongoose = require('mongoose')
const Admin = require('./src/models/Admin')

const ADMIN_EMAIL = 'taybcontracting@gmail.com'
const ADMIN_PASSWORD = 'Tayb#@321!'

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')

  const existing = await Admin.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`)
  } else {
    await Admin.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    console.log(`Admin created — email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`)
  }

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch((err) => { console.error(err); process.exit(1) })
