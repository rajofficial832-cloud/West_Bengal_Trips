const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI environment variable.');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
