const express = require('express');

const { listOrders, placeOrder, cancelOrder } = require('../controllers/orderController');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(listOrders));
router.post('/', asyncHandler(placeOrder));
router.patch('/:id/cancel', asyncHandler(cancelOrder));

module.exports = router;
