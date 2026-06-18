const cloudinary = require('../config/cloudinary')
const Project = require('../models/Project')

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `tayb/${folder}`, quality: 'auto', fetch_format: 'auto' },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })

exports.getAll = async (req, res) => {
  try {
    const { projectType, featured } = req.query
    const filter = {}
    if (projectType) filter.projectType = projectType
    if (featured) filter.featured = featured === 'true'
    const projects = await Project.find(filter).sort({ createdAt: -1 })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug })
    if (!project) return res.status(404).json({ message: 'Not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const parseArrayFields = (body) => {
  const data = { ...body, featured: body.featured === 'true' }
  if (typeof data.amenities === 'string') {
    try { data.amenities = JSON.parse(data.amenities) } catch { data.amenities = [] }
  }
  if (typeof data.nearbyLocations === 'string') {
    try { data.nearbyLocations = JSON.parse(data.nearbyLocations) } catch { data.nearbyLocations = [] }
  }
  return data
}

exports.create = async (req, res) => {
  try {
    const data = parseArrayFields(req.body)

    if (req.files?.coverImage?.[0]) {
      const result = await uploadBuffer(req.files.coverImage[0].buffer, 'projects')
      data.coverImage = { url: result.secure_url, publicId: result.public_id }
    }

    if (req.files?.images?.length) {
      data.images = await Promise.all(
        req.files.images.map(async (f) => {
          const r = await uploadBuffer(f.buffer, 'projects')
          return { url: r.secure_url, publicId: r.public_id }
        })
      )
    }

    const project = await Project.create(data)
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const data = parseArrayFields(req.body)

    if (req.files?.coverImage?.[0]) {
      const result = await uploadBuffer(req.files.coverImage[0].buffer, 'projects')
      data.coverImage = { url: result.secure_url, publicId: result.public_id }
    }

    if (req.files?.images?.length) {
      const newImages = await Promise.all(
        req.files.images.map(async (f) => {
          const r = await uploadBuffer(f.buffer, 'projects')
          return { url: r.secure_url, publicId: r.public_id }
        })
      )
      data.$push = { images: { $each: newImages } }
      delete data.images
    }

    const project = await Project.findByIdAndUpdate(req.params.id, data, { new: true })
    if (!project) return res.status(404).json({ message: 'Not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Not found' })

    const ids = [project.coverImage?.publicId, ...project.images.map((i) => i.publicId)].filter(Boolean)
    if (ids.length) await cloudinary.api.delete_resources(ids)

    await project.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.removeImage = async (req, res) => {
  try {
    const { publicId } = req.body
    await cloudinary.uploader.destroy(publicId)
    await Project.findByIdAndUpdate(req.params.id, {
      $pull: { images: { publicId } },
    })
    res.json({ message: 'Image removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
