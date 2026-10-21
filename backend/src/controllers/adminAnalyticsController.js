const Itinerary = require('../models/Itinerary');
const Order = require('../models/Order');
const User = require('../models/User');

async function getAnalytics(req, res) {
  const [totalUsers, totalItineraries, totalOrders] = await Promise.all([
    User.countDocuments(),
    Itinerary.countDocuments(),
    Order.countDocuments(),
  ]);

  const breakdownAgg = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
  ]);
  const breakdown = { active: { count: 0, revenue: 0 }, cancelled: { count: 0, revenue: 0 } };
  breakdownAgg.forEach((row) => {
    if (row._id === 'active' || row._id === 'cancelled') {
      breakdown[row._id] = { count: row.count, revenue: row.revenue };
    }
  });

  const topItinerariesAgg = await Order.aggregate([
    { $match: { status: 'active' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.itineraryId',
        bookings: { $sum: 1 },
        revenue: { $sum: '$items.itemTotal' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);
  const itineraryIds = topItinerariesAgg.map((row) => row._id);
  const itineraries = await Itinerary.find({ id: { $in: itineraryIds } });
  const itineraryById = new Map(itineraries.map((item) => [item.id, item]));
  const topItineraries = topItinerariesAgg.map((row) => ({
    itineraryId: row._id,
    title: itineraryById.get(row._id)?.title || row._id,
    bookings: row.bookings,
    revenue: row.revenue,
  }));

  const timeSeriesAgg = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$total', 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const timeSeries = timeSeriesAgg.map((row) => ({ month: row._id, orders: row.orders, revenue: row.revenue }));

  return res.json({
    totals: { totalUsers, totalItineraries, totalOrders, totalRevenue: breakdown.active.revenue },
    breakdown,
    topItineraries,
    timeSeries,
  });
}

module.exports = { getAnalytics };
