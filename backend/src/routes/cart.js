const express = require('express');

const { getCart, upsertEntry, updateEntry, removeEntry, clearCart } = require('../controllers/cartController');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(getCart));
router.post('/', asyncHandler(upsertEntry));
router.patch('/:itineraryId', asyncHandler(updateEntry));
router.delete('/:itineraryId', asyncHandler(removeEntry));
router.delete('/', asyncHandler(clearCart));

module.exports = router;
