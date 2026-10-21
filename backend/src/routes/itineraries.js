const express = require('express');

const { listItineraries, getItinerary } = require('../controllers/itineraryController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(listItineraries));
router.get('/:id', asyncHandler(getItinerary));

module.exports = router;
