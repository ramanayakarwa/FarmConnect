const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/auth');

const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');

// All booking routes require authentication
router.use(authMiddleware);

// Farmer creates booking
router.post('/', createBooking);

// Role-aware booking list
// Farmer  → own bookings
// Provider → bookings for own equipment
router.get('/', getBookings);

// Single booking
router.get('/:id', getBookingById);

// Update status
// Provider → accepted / rejected
// Farmer   → cancelled
router.put('/:id', updateBooking);

// Delete pending booking
// Farmer only
router.delete('/:id', deleteBooking);

module.exports = router;