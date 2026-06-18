const router = require('express').Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const c = require('../controllers/projectController')

const fields = upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 20 }])

router.get('/', c.getAll)
router.get('/id/:id', c.getById)
router.get('/:slug', c.getOne)
router.post('/', auth, fields, c.create)
router.put('/:id', auth, fields, c.update)
router.delete('/:id', auth, c.remove)
router.delete('/:id/images', auth, c.removeImage)

module.exports = router
