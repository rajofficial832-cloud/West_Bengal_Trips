const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const itineraryRoutes = require('./routes/itineraries');
const orderRoutes = require('./routes/orders');
const adminAuthRoutes = require('./routes/adminAuth');
const adminUserRoutes = require('./routes/adminUsers');
const adminItineraryRoutes = require('./routes/adminItineraries');
const adminOrderRoutes = require('./routes/adminOrders');
const adminAnalyticsRoutes = require('./routes/adminAnalytics');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/itineraries', adminItineraryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error.' });
});

module.exports = app;
