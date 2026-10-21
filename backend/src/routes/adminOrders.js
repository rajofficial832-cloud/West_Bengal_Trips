const express = require('express');

const { listOrders, cancelOrder } = require('../controllers/adminOrderController');
const requireAdminAuth = require('../middleware/adminAuth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', asyncHandler(listOrders));
router.patch('/:id/cancel', asyncHandler(cancelOrder));

module.exports = router;
