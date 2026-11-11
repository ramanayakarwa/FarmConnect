const pool = require('../config/database');

// Only providers can access these endpoints.
const requireProvider = (req, res) => {
  if (req.user.role !== 'provider') {
    res.status(403).json({
      success: false,
      message: 'Provider access required.',
    });

    return false;
  }

  return true;
};

// GET /api/provider/dashboard
const getDashboard = async (req, res, next) => {
  try {
    if (!requireProvider(req, res)) return;

    const providerId = req.user.id;

    const equipmentResult = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM equipment
        WHERE owner_id = $1
      `,
      [providerId]
    );

    const activeResult = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM bookings b
        JOIN equipment e
          ON b.equipment_id = e.id
        WHERE e.owner_id = $1
          AND b.status IN (
            'pending',
            'accepted',
            'on_the_way',
            'arrived',
            'work_started'
          )
      `,
      [providerId]
    );

    // Earnings are counted only after work completion
    // and confirmation that payment was received.
    // Use the stored booking amount, not today's equipment rate.
    const earningsResult = await pool.query(
      `
        SELECT
          COALESCE(
            SUM(b.total_amount),
            0
          ) AS total_earnings,

          COALESCE(
            SUM(b.total_amount) FILTER (
              WHERE DATE_TRUNC(
                'month',
                b.paid_at AT TIME ZONE 'Asia/Kolkata'
              ) = DATE_TRUNC(
                'month',
                NOW() AT TIME ZONE 'Asia/Kolkata'
              )
            ),
            0
          ) AS monthly_earnings

        FROM bookings b

        JOIN equipment e
          ON b.equipment_id = e.id

        WHERE e.owner_id = $1
          AND b.status = 'completed'
          AND b.payment_status = 'paid'
      `,
      [providerId]
    );

    const earnings = earningsResult.rows[0];

    return res.json({
      success: true,
      data: {
        totalEquipment: Number(
          equipmentResult.rows[0].total
        ),
        activeBookings: Number(
          activeResult.rows[0].total
        ),
        monthlyEarnings: Number(
          earnings.monthly_earnings
        ),
        totalEarnings: Number(
          earnings.total_earnings
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/provider/equipment
const getProviderEquipment = async (req, res, next) => {
  try {
    if (!requireProvider(req, res)) return;

    const result = await pool.query(
      `
        SELECT
          e.*,

          COUNT(b.id) AS total_bookings,

          COUNT(b.id) FILTER (
            WHERE b.status IN (
              'pending',
              'accepted',
              'on_the_way',
              'arrived',
              'work_started'
            )
          ) AS active_bookings

        FROM equipment e

        LEFT JOIN bookings b
          ON e.id = b.equipment_id

        WHERE e.owner_id = $1

        GROUP BY e.id

        ORDER BY e.created_at DESC
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/provider/bookings
const getProviderBookings = async (req, res, next) => {
  try {
    if (!requireProvider(req, res)) return;

    const { status } = req.query;
    const values = [req.user.id];

    let statusClause = '';

    if (status) {
      const allowedStatuses = [
        'pending',
        'accepted',
        'on_the_way',
        'arrived',
        'work_started',
        'completed',
        'rejected',
        'cancelled',
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking status.',
        });
      }

      statusClause = 'AND b.status = $2';
      values.push(status);
    }

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
          f.email AS farmer_email

        FROM bookings b

        JOIN equipment e
          ON b.equipment_id = e.id

        JOIN users f
          ON b.farmer_id = f.id

        WHERE e.owner_id = $1
          ${statusClause}

        ORDER BY b.created_at DESC
      `,
      values
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getProviderEquipment,
  getProviderBookings,
};