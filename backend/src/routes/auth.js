const express = require('express');

const router = express.Router();

const {
  register,
  login,
  updateProfile,
} = require('../controllers/authController');

const authMiddleware = require('../middleware/auth');

// ========================================
// REGISTER
// POST /api/auth/register
// ========================================

router.post(
  '/register',
  register
);

// ========================================
// LOGIN
// POST /api/auth/login
// ========================================

router.post(
  '/login',
  login
);

// ========================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ========================================

router.put(
  '/profile',
  authMiddleware,
  updateProfile
);

module.exports = router;