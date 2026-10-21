const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');

function signAdminToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toAdminUser(admin) {
  return { id: admin._id.toString(), name: admin.name, email: admin.email };
}

// No public registration — admin accounts are created only via `npm run seed:admin`.
async function login(req, res) {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    return res.status(401).json({ message: 'No admin account found with this email.' });
  }
  const matches = await bcrypt.compare(password || '', admin.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: 'Incorrect password.' });
  }
  const token = signAdminToken(admin);
  return res.json({ token, admin: toAdminUser(admin) });
}

module.exports = { login };
