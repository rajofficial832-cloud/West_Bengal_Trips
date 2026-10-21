const express = require('express');

const { signup, login, resetPassword } = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.post('/reset-password', asyncHandler(resetPassword));

module.exports = router;
