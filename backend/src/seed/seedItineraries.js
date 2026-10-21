require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Itinerary = require('../models/Itinerary');
const itineraries = require('./itineraries.json');

async function seed() {
  await connectDB();
  for (const itinerary of itineraries) {
    await Itinerary.findOneAndUpdate({ id: itinerary.id }, itinerary, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  console.log(`Seeded ${itineraries.length} itineraries.`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
