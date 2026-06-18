const router = require('express').Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const c = require('../controllers/galleryController')

router.get('/', c.getAll)
router.post('/', auth, upload.array('images', 30), c.upload)
router.put('/:id', auth, c.update)
router.delete('/:id', auth, c.remove)

module.exports = router
