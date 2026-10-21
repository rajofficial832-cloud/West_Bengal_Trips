const express = require('express');

const { getAnalytics } = require('../controllers/adminAnalyticsController');
const requireAdminAuth = require('../middleware/adminAuth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', asyncHandler(getAnalytics));

module.exports = router;
