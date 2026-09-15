const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/auth');

const {
  getDashboard,
  getProviderEquipment,
  getProviderBookings,
} = require('../controllers/providerController');

// All provider routes require authentication
router.use(authMiddleware);

// Provider dashboard
router.get('/dashboard', getDashboard);

// Provider's own equipment
router.get('/equipment', getProviderEquipment);

// Provider's incoming booking requests
router.get('/bookings', getProviderBookings);

module.exports = router;