const Itinerary = require('../models/Itinerary');

async function listItineraries(req, res) {
  const itineraries = await Itinerary.find().sort({ title: 1 });
  return res.json(itineraries);
}

async function getItinerary(req, res) {
  const itinerary = await Itinerary.findOne({ id: req.params.id });
  if (!itinerary) {
    return res.status(404).json({ message: 'Itinerary not found.' });
  }
  return res.json(itinerary);
}

module.exports = { listItineraries, getItinerary };
