const CartEntry = require('../models/CartEntry');
const Itinerary = require('../models/Itinerary');
const Order = require('../models/Order');

function toOrder(doc) {
  return {
    id: doc._id.toString(),
    items: doc.items,
    total: doc.total,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}

async function listOrders(req, res) {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
  return res.json(orders.map(toOrder));
}

async function placeOrder(req, res) {
  const cartEntries = await CartEntry.find({ userId: req.userId });
  if (cartEntries.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty.' });
  }
  const itineraryIds = cartEntries.map((entry) => entry.itineraryId);
  const itineraries = await Itinerary.find({ id: { $in: itineraryIds } });
  const priceById = new Map(itineraries.map((itinerary) => [itinerary.id, itinerary.basePricePerPerson]));

  const items = cartEntries.map((entry) => {
    const price = priceById.get(entry.itineraryId) || 0;
    return {
      itineraryId: entry.itineraryId,
      groupSize: entry.groupSize,
      travelDate: entry.travelDate,
      itemTotal: price * entry.groupSize,
    };
  });
  const total = items.reduce((sum, item) => sum + item.itemTotal, 0);

  const order = await Order.create({ userId: req.userId, items, total, status: 'active' });
  await CartEntry.deleteMany({ userId: req.userId });

  return res.status(201).json(toOrder(order));
}

async function cancelOrder(req, res) {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status: 'cancelled' },
    { new: true }
  );
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  return res.json(toOrder(order));
}

module.exports = { listOrders, placeOrder, cancelOrder };
