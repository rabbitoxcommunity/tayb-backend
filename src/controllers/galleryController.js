const cloudinary = require('../config/cloudinary')
const GalleryImage = require('../models/GalleryImage')

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'tayb/gallery', quality: 'auto', fetch_format: 'auto' },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })

exports.getAll = async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query
    const filter = category ? { category } : {}
    const images = await GalleryImage.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    const total = await GalleryImage.countDocuments(filter)
    res.json({ images, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.upload = async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' })

    const { category, caption } = req.body
    const uploaded = await Promise.all(
      req.files.map(async (f) => {
        const result = await uploadBuffer(f.buffer)
        return GalleryImage.create({
          url: result.secure_url,
          publicId: result.public_id,
          category,
          caption,
        })
      })
    )
    res.status(201).json(uploaded)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!image) return res.status(404).json({ message: 'Not found' })
    res.json(image)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id)
    if (!image) return res.status(404).json({ message: 'Not found' })
    if (image.publicId) await cloudinary.uploader.destroy(image.publicId)
    await image.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
