const router = require('express').Router()
const auth = require('../middleware/auth')
const { login, me, seed } = require('../controllers/authController')

router.post('/login', login)
router.post('/seed', seed)
router.get('/me', auth, me)

module.exports = router
