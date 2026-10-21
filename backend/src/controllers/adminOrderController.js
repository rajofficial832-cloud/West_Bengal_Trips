const Order = require('../models/Order');

function toAdminOrder(doc) {
  const userId = doc.userId;
  // userId may be populated ({name,email}) from listOrders, or a raw ObjectId after findByIdAndUpdate.
  const user = userId && typeof userId === 'object' && 'name' in userId
    ? { id: userId._id.toString(), name: userId.name, email: userId.email }
    : null;
  return {
    id: doc._id.toString(),
    userId: user,
    items: doc.items,
    total: doc.total,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}

async function listOrders(req, res) {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email');
  return res.json(orders.map(toAdminOrder));
}

async function cancelOrder(req, res) {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  return res.json(toAdminOrder(order));
}

module.exports = { listOrders, cancelOrder };

