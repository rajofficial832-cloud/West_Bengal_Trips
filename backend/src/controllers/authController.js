const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toAuthUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

async function signup(req, res) {
  const { name, email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });
  const token = signToken(user);
  return res.status(201).json({ token, user: toAuthUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: 'No account found with this email.' });
  }
  const matches = await bcrypt.compare(password || '', user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: 'Incorrect password.' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'Your account has been deactivated.' });
  }
  const token = signToken(user);
  return res.json({ token, user: toAuthUser(user) });
}

// Demo-only: no ownership verification (email link/current password), matches prior local-only behavior.
async function resetPassword(req, res) {
  const { email, newPassword } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !newPassword) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email.' });
  }
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  return res.json({ message: 'Password updated.' });
}

module.exports = { signup, login, resetPassword };
