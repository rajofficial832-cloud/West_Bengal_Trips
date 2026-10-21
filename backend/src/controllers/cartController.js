const CartEntry = require('../models/CartEntry');

function toCartEntry(doc) {
  return {
    itineraryId: doc.itineraryId,
    groupSize: doc.groupSize,
    travelDate: doc.travelDate,
  };
}

async function getCart(req, res) {
  const entries = await CartEntry.find({ userId: req.userId });
  return res.json(entries.map(toCartEntry));
}

async function upsertEntry(req, res) {
  const { itineraryId, groupSize, travelDate } = req.body;
  if (!itineraryId || !groupSize || !travelDate) {
    return res.status(400).json({ message: 'itineraryId, groupSize, and travelDate are required.' });
  }
  const entry = await CartEntry.findOneAndUpdate(
    { userId: req.userId, itineraryId },
    { groupSize, travelDate },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.json(toCartEntry(entry));
}

async function updateEntry(req, res) {
  const { groupSize } = req.body;
  if (!groupSize) {
    return res.status(400).json({ message: 'groupSize is required.' });
  }
  const entry = await CartEntry.findOneAndUpdate(
    { userId: req.userId, itineraryId: req.params.itineraryId },
    { groupSize },
    { new: true }
  );
  if (!entry) {
    return res.status(404).json({ message: 'Cart entry not found.' });
  }
  return res.json(toCartEntry(entry));
}

async function removeEntry(req, res) {
  await CartEntry.deleteOne({ userId: req.userId, itineraryId: req.params.itineraryId });
  return res.status(204).send();
}

async function clearCart(req, res) {
  await CartEntry.deleteMany({ userId: req.userId });
  return res.status(204).send();
}

module.exports = { getCart, upsertEntry, updateEntry, removeEntry, clearCart };
