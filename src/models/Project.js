const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
  url: String,
  publicId: String,
}, { _id: false })

const nearbyLocationSchema = new mongoose.Schema({
  name: String,
  distance: String,
}, { _id: false })

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  projectType: { type: String, required: true },
  propertyType: String,
  subDescription: String,
  mainDescription: String,
  location: String,
  year: String,
  featured: { type: Boolean, default: false },
  amenities: [String],
  nearbyLocations: [nearbyLocationSchema],
  coverImage: imageSchema,
  images: [imageSchema],
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)
