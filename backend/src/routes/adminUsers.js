const express = require('express');

const { listUsers, setUserActive, deleteUser } = require('../controllers/adminUserController');
const requireAdminAuth = require('../middleware/adminAuth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', asyncHandler(listUsers));
router.patch('/:id/active', asyncHandler(setUserActive));
router.delete('/:id', asyncHandler(deleteUser));

module.exports = router;
