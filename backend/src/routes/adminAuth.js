const express = require('express');

const { login } = require('../controllers/adminAuthController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(login));

module.exports = router;
