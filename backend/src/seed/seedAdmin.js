require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const SALT_ROUNDS = 10;

async function seed() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password) {
    console.error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.');
    process.exit(1);
  }

  await connectDB();
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await Admin.findOneAndUpdate(
    { email: normalizedEmail },
    { name: name.trim(), email: normalizedEmail, passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin account ready: ${normalizedEmail}`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Admin seeding failed:', error);
  process.exit(1);
});
