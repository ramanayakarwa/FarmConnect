const pool = require('../config/database');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Turn a stored equipment image value into a full URL.
 *
 * Handles:
 *   /uploads/tractor.jpeg
 *   http://192.168.0.107:5000/uploads/tractor.jpeg
 *
 * External URLs such as Unsplash are left unchanged.
 */
const attachImageUrl = (row, req, field = 'equipment_image') => {
  if (!row[field]) return row;

  const uploadsMatch = row[field].match(/(\/uploads\/.+)$/);

  if (!uploadsMatch) {
    // External image URL
    return row;
  }

  const path = uploadsMatch[1];
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  return {
    ...row,
    [field]: `${baseUrl}${path}`,
  };
};

// ─── CREATE BOOKING ─────────────────────────────────────────────────────────

/**
 * POST /api/bookings
 *
 * Farmer creates a booking request.
 */
const createBooking = async (req, res, next) => {
  try {
    // Only farmers can create bookings
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can create bookings.',
      });
    }

    const farmer_id = req.user.id;

    const {
      equipment_id,
      start_date,
      end_date,
      land_size,
      payment_method = 'cash',
    } = req.body;

    // Validate required fields
    if (!equipment_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'equipment_id, start_date and end_date are required.',
      });
    }

    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: 'start_date must be before or equal to end_date.',
      });
    }

    // Validate payment method
    const allowedPaymentMethods = [
      'cash',
      'upi',
      'card',
      'bank_transfer',
    ];

    if (!allowedPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment_method.',
      });
    }

    // Check equipment exists
    const eqResult = await pool.query(
      `
      SELECT
        id,
        availability,
        owner_id
      FROM equipment
      WHERE id = $1
      `,
      [equipment_id]
    );

    if (eqResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    const equipment = eqResult.rows[0];

    // Check availability
    if (!equipment.availability) {
      return res.status(400).json({
        success: false,
        message: 'Equipment is not available for booking.',
      });
    }

    // Prevent provider from booking their own machine
    if (equipment.owner_id === farmer_id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own equipment.',
      });
    }

    // Create booking
    const result = await pool.query(
      `
      INSERT INTO bookings (
        farmer_id,
        equipment_id,
        start_date,
        end_date,
        land_size,
        payment_method
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        farmer_id,
        equipment_id,
        start_date,
        end_date,
        land_size || null,
        payment_method,
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET BOOKINGS ───────────────────────────────────────────────────────────

/**
 * GET /api/bookings
 *
 * Farmer:
 *   → sees only their own bookings
 *
 * Provider:
 *   → sees only bookings for their own equipment
 */
const getBookings = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let query;
    let values;

    if (role === 'farmer') {
      query = `
        SELECT
          b.*,
          e.name AS equipment_name,
          e.image AS equipment_image,
          e.price AS equipment_price,
          e.location AS equipment_location,
          e.category AS equipment_category,
          u.name AS owner_name,
          u.phone AS owner_phone,
          u.email AS owner_email
        FROM bookings b
        JOIN equipment e
          ON b.equipment_id = e.id
        JOIN users u
          ON e.owner_id = u.id
        WHERE b.farmer_id = $1
        ORDER BY b.created_at DESC
      `;

      values = [userId];
    } else if (role === 'provider') {
      query = `
        SELECT
          b.*,
          e.name AS equipment_name,
          e.image AS equipment_image,
          e.price AS equipment_price,
          e.category AS equipment_category,
          e.location AS equipment_location,
          f.name AS farmer_name,
          f.phone AS farmer_phone,
          f.email AS farmer_email
        FROM bookings b
        JOIN equipment e
          ON b.equipment_id = e.id
        JOIN users f
          ON b.farmer_id = f.id
        WHERE e.owner_id = $1
        ORDER BY b.created_at DESC
      `;

      values = [userId];
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role.',
      });
    }

    const result = await pool.query(query, values);

    const data = result.rows.map((row) =>
      attachImageUrl(row, req)
    );

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET BOOKING BY ID ──────────────────────────────────────────────────────

/**
 * GET /api/bookings/:id
 *
 * Farmer:
 *   → only their own booking
 *
 * Provider:
 *   → only booking for their own equipment
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const result = await pool.query(
      `
      SELECT
        b.*,
        e.name AS equipment_name,
        e.image AS equipment_image,
        e.price AS equipment_price,
        e.category AS equipment_category,
        e.location AS equipment_location,

        f.name AS farmer_name,
        f.phone AS farmer_phone,
        f.email AS farmer_email,

        o.name AS owner_name,
        o.phone AS owner_phone,
        o.email AS owner_email

      FROM bookings b

      JOIN equipment e
        ON b.equipment_id = e.id

      JOIN users f
        ON b.farmer_id = f.id

      JOIN users o
        ON e.owner_id = o.id

      WHERE b.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const booking = attachImageUrl(
      result.rows[0],
      req
    );

    // Farmer authorization
    if (
      role === 'farmer' &&
      booking.farmer_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    // Provider authorization
    if (
      role === 'provider' &&
      booking.owner_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    return res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE BOOKING STATUS ──────────────────────────────────────────────────

/**
 * PUT /api/bookings/:id
 *
 * Provider:
 *   pending → accepted/rejected
 *
 * Farmer:
 *   pending → cancelled
 */
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;
    const { status } = req.body;

    let allowedStatuses;

    if (role === 'provider') {
      allowedStatuses = ['accepted', 'rejected'];
    } else if (role === 'farmer') {
      allowedStatuses = ['cancelled'];
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role.',
      });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid status. Allowed values for ${role}: ` +
          allowedStatuses.join(', '),
      });
    }

    // Get booking + equipment owner
    const bookingResult = await pool.query(
      `
      SELECT
        b.*,
        e.owner_id
      FROM bookings b
      JOIN equipment e
        ON b.equipment_id = e.id
      WHERE b.id = $1
      `,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const booking = bookingResult.rows[0];

    // ─────────────────────────────────────────────────────────────
    // PROVIDER
    // Provider can only update bookings for THEIR equipment.
    // ─────────────────────────────────────────────────────────────

    if (
      role === 'provider' &&
      booking.owner_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This booking is not for your equipment.',
      });
    }

    // ─────────────────────────────────────────────────────────────
    // FARMER
    // Farmer can only cancel THEIR own booking.
    // ─────────────────────────────────────────────────────────────

    if (
      role === 'farmer' &&
      booking.farmer_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    // Only pending bookings can change status
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message:
          `This booking is already ${booking.status} and cannot be changed.`,
      });
    }

    // Update booking
    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE BOOKING ─────────────────────────────────────────────────────────

/**
 * DELETE /api/bookings/:id
 *
 * Only the farmer who created the booking can delete it.
 * Only pending bookings can be deleted.
 */
const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can delete bookings.',
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM bookings
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const booking = result.rows[0];

    if (booking.farmer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be deleted.',
      });
    }

    await pool.query(
      `
      DELETE FROM bookings
      WHERE id = $1
      `,
      [id]
    );

    return res.json({
      success: true,
      message: 'Booking deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};