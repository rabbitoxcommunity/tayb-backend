const router = require('express').Router()
const auth = require('../middleware/auth')
const c = require('../controllers/enquiryController')

router.post('/', c.create)           // public — contact form
router.get('/', auth, c.getAll)
router.get('/:id', auth, c.getOne)
router.put('/:id/status', auth, c.updateStatus)
router.delete('/:id', auth, c.remove)

module.exports = router
