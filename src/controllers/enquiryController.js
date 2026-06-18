const Enquiry = require('../models/Enquiry')

exports.create = async (req, res) => {
  try {
    const { name, email, phone, company, service, budget, message } = req.body
    if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required' })
    const enquiry = await Enquiry.create({ name, email, phone, company, service, budget, message })
    res.status(201).json(enquiry)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = status ? { status } : {}
    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Enquiry.countDocuments(filter),
    ])
    res.json({ enquiries, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
    if (!enquiry) return res.status(404).json({ message: 'Not found' })
    if (enquiry.status === 'new') { enquiry.status = 'read'; await enquiry.save() }
    res.json(enquiry)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!enquiry) return res.status(404).json({ message: 'Not found' })
    res.json(enquiry)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
