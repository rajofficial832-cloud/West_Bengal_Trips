const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    durationDays: { type: Number, required: true },
    basePricePerPerson: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);
