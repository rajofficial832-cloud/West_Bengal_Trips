const express = require('express');

const { createItinerary, updateItinerary, deleteItinerary } = require('../controllers/adminItineraryController');
const requireAdminAuth = require('../middleware/adminAuth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAdminAuth);

router.post('/', asyncHandler(createItinerary));
router.put('/:id', asyncHandler(updateItinerary));
router.delete('/:id', asyncHandler(deleteItinerary));

module.exports = router;
