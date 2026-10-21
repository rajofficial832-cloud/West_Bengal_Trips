const Itinerary = require('../models/Itinerary');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function pickDefined(source, keys) {
  const result = {};
  keys.forEach((key) => {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  });
  return result;
}

const ITINERARY_FIELDS = ['title', 'location', 'durationDays', 'basePricePerPerson', 'image', 'description', 'highlights'];

async function createItinerary(req, res) {
  const { title, location, durationDays, basePricePerPerson, image, description, highlights } = req.body;
  if (!title || !location || !durationDays || !basePricePerPerson || !image || !description) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }
  const id = slugify(title);
  const existing = await Itinerary.findOne({ id });
  if (existing) {
    return res.status(409).json({ message: 'An itinerary with a similar title already exists.' });
  }
  const itinerary = await Itinerary.create({
    id,
    title,
    location,
    durationDays,
    basePricePerPerson,
    image,
    description,
    highlights: Array.isArray(highlights) ? highlights : [],
  });
  return res.status(201).json(itinerary);
}

async function updateItinerary(req, res) {
  const updates = pickDefined(req.body, ITINERARY_FIELDS);
  const itinerary = await Itinerary.findOneAndUpdate({ id: req.params.id }, updates, {
    new: true,
    runValidators: true,
  });
  if (!itinerary) {
    return res.status(404).json({ message: 'Itinerary not found.' });
  }
  return res.json(itinerary);
}

async function deleteItinerary(req, res) {
  const itinerary = await Itinerary.findOneAndDelete({ id: req.params.id });
  if (!itinerary) {
    return res.status(404).json({ message: 'Itinerary not found.' });
  }
  return res.status(204).send();
}

module.exports = { createItinerary, updateItinerary, deleteItinerary };
