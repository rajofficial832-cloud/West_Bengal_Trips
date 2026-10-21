const CartEntry = require('../models/CartEntry');
const User = require('../models/User');

function toAdminUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
  };
}

async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 });
  return res.json(users.map(toAdminUser));
}

async function setUserActive(req, res) {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive must be a boolean.' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json(toAdminUser(user));
}

async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  await CartEntry.deleteMany({ userId: user._id });
  return res.status(204).send();
}

module.exports = { listUsers, setUserActive, deleteUser };
