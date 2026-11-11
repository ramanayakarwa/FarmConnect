const pool = require('../config/database');
const { quote } = require('../utils/pricing');
const { mutation } = require('../utils/bookingWorkflow');

// Convert uploaded equipment images into full URLs.
const attachImageUrl = (row, req) => {
  if (!row.equipment_image) return row;

  const match = row.equipment_image.match(
    /(\/uploads\/.+)$/
  );

  if (!match) return row;

  return {
    ...row,
    equipment_image:
      `${req.protocol}://${req.get('host')}${match[1]}`,
  };
};

// Shared booking details for both account types.
const bookingDetailsQuery = `
  SELECT
    b.*,
    e.owner_id,
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
`;

// POST /api/bookings
const createBooking = async (req, res, next) => {
  let client;

  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can create bookings.',
      });
    }

    const {
      equipment_id,
      start_date,
      end_date,
      land_size,
      farm_location,
      payment_method = 'cash',
      payment_timing = 'pay_later',
    } = req.body || {};

    if (!equipment_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message:
          'Equipment, start date and end date are required.',
      });
    }

    if (
      typeof farm_location !== 'string' ||
      !farm_location.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Farm location is required.',
      });
    }

    const allowedMethods = [
      'cash',
      'upi',
      'card',
      'bank_transfer',
    ];

    if (!allowedMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.',
      });
    }

    // Online advance payments are not implemented.
    if (payment_timing !== 'pay_later') {
      return res.status(400).json({
        success: false,
        message:
          'Advance online payment is not enabled. Choose Pay Later.',
      });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // Keep availability and pricing stable during creation.
    const equipmentResult = await client.query(
      `
        SELECT
          id,
          owner_id,
          availability,
          price,
          pricing_type
        FROM equipment
        WHERE id = $1
        FOR UPDATE
      `,
      [equipment_id]
    );

    if (!equipmentResult.rows.length) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    const equipment = equipmentResult.rows[0];

    if (!equipment.availability) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        success: false,
        message:
          'Equipment is not available for booking.',
      });
    }

    if (equipment.owner_id === req.user.id) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        success: false,
        message: 'You cannot book your own equipment.',
      });
    }

    let totalAmount;

    try {
      // Always calculate the amount on the server.
      totalAmount = quote(
        equipment,
        start_date,
        end_date,
        land_size
      );
    } catch (error) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const result = await client.query(
      `
        INSERT INTO bookings (
          farmer_id,
          equipment_id,
          start_date,
          end_date,
          land_size,
          total_amount,
          pricing_type,
          payment_timing,
          payment_method,
          payment_status,
          service_status,
          farm_location,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          'pending',
          'pending',
          $10,
          'pending'
        )
        RETURNING *
      `,
      [
        req.user.id,
        equipment_id,
        start_date,
        end_date,
        Number(land_size),
        totalAmount,
        equipment.pricing_type,
        payment_timing,
        payment_method,
        farm_location.trim(),
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }

    next(error);
  } finally {
    if (client) client.release();
  }
};

// GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let condition;

    if (role === 'farmer') {
      condition = 'b.farmer_id = $1';
    } else if (role === 'provider') {
      condition = 'e.owner_id = $1';
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role.',
      });
    }

    const result = await pool.query(
      `
        ${bookingDetailsQuery}
        WHERE ${condition}
        ORDER BY b.created_at DESC
      `,
      [userId]
    );

    const bookings = result.rows.map((row) =>
      attachImageUrl(row, req)
    );

    return res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        ${bookingDetailsQuery}
        WHERE b.id = $1
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const booking = result.rows[0];

    const isFarmer =
      req.user.role === 'farmer' &&
      booking.farmer_id === req.user.id;

    const isProvider =
      req.user.role === 'provider' &&
      booking.owner_id === req.user.id;

    if (!isFarmer && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    return res.json({
      success: true,
      data: attachImageUrl(booking, req),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id
// Handles service status, payment receipt or feedback.
const updateBooking = async (req, res, next) => {
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Lock this booking to prevent simultaneous changes.
    const result = await client.query(
      `
        SELECT b.*, e.owner_id
        FROM bookings b
        JOIN equipment e
          ON e.id = b.equipment_id
        WHERE b.id = $1
        FOR UPDATE OF b
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    let changes;

    try {
      changes = mutation(
        result.rows[0],
        req.user,
        req.body || {}
      );
    } catch (error) {
      await client.query('ROLLBACK');

      return res.status(error.status || 400).json({
        success: false,
        message: error.message,
      });
    }

    // Column names come only from our workflow helper.
    const keys = Object.keys(changes);

    const assignments = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = [
      ...Object.values(changes),
      req.params.id,
    ];

    const updated = await client.query(
      `
        UPDATE bookings
        SET ${assignments}
        WHERE id = $${values.length}
        RETURNING *
      `,
      values
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      data: updated.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }

    next(error);
  } finally {
    if (client) client.release();
  }
};

// DELETE /api/bookings/:id
// Only the booking's farmer can delete a pending request.
const deleteBooking = async (req, res, next) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can delete bookings.',
      });
    }

    // Check ownership and status in the same statement.
    const result = await pool.query(
      `
        DELETE FROM bookings
        WHERE id = $1
          AND farmer_id = $2
          AND status = 'pending'
        RETURNING id
      `,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(400).json({
        success: false,
        message:
          'Booking was not deleted. Only your own pending requests can be deleted.',
      });
    }

    return res.json({
      success: true,
      message: 'Booking deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};