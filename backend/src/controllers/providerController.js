const pool = require('../config/database');

// ============================================================
// PROVIDER ROLE CHECK
// ============================================================

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

// ============================================================
// DASHBOARD
// ============================================================

const getDashboard = async (req, res, next) => {
  try {
    if (!requireProvider(req, res)) return;

    const providerId = req.user.id;

    // Total equipment owned by provider
    const eqCount = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM equipment
      WHERE owner_id = $1
      `,
      [providerId]
    );

    // Pending + accepted bookings
    const activeBookings = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM bookings b
      JOIN equipment e
        ON b.equipment_id = e.id
      WHERE e.owner_id = $1
        AND b.status IN ('pending', 'accepted')
      `,
      [providerId]
    );

    // Current month earnings
    const monthlyEarnings = await pool.query(
      `
      SELECT COALESCE(
        SUM(
          (b.end_date - b.start_date + 1) * e.price
        ),
        0
      ) AS earnings

      FROM bookings b

      JOIN equipment e
        ON b.equipment_id = e.id

      WHERE e.owner_id = $1
        AND b.status = 'accepted'
        AND DATE_TRUNC('month', b.created_at)
            = DATE_TRUNC('month', NOW())
      `,
      [providerId]
    );

    // Total earnings
    const totalEarnings = await pool.query(
      `
      SELECT COALESCE(
        SUM(
          (b.end_date - b.start_date + 1) * e.price
        ),
        0
      ) AS earnings

      FROM bookings b

      JOIN equipment e
        ON b.equipment_id = e.id

      WHERE e.owner_id = $1
        AND b.status = 'accepted'
      `,
      [providerId]
    );

    return res.json({
      success: true,

      data: {
        totalEquipment:
          parseInt(
            eqCount.rows[0].total,
            10
          ),

        activeBookings:
          parseInt(
            activeBookings.rows[0].total,
            10
          ),

        monthlyEarnings:
          parseFloat(
            monthlyEarnings.rows[0].earnings
          ),

        totalEarnings:
          parseFloat(
            totalEarnings.rows[0].earnings
          ),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// PROVIDER EQUIPMENT
// ============================================================

const getProviderEquipment = async (
  req,
  res,
  next
) => {
  try {
    if (!requireProvider(req, res)) return;

    const providerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        e.*,

        COUNT(b.id) AS total_bookings,

        COUNT(b.id)
          FILTER (
            WHERE b.status IN ('pending', 'accepted')
          ) AS active_bookings

      FROM equipment e

      LEFT JOIN bookings b
        ON e.id = b.equipment_id

      WHERE e.owner_id = $1

      GROUP BY e.id

      ORDER BY e.created_at DESC
      `,
      [providerId]
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// PROVIDER BOOKINGS
// ============================================================

const getProviderBookings = async (
  req,
  res,
  next
) => {
  try {
    if (!requireProvider(req, res)) return;

    const providerId = req.user.id;

    const { status } = req.query;

    const values = [providerId];

    let statusClause = '';

    if (status) {
      const allowedStatuses = [
        'pending',
        'accepted',
        'rejected',
        'cancelled',
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking status.',
        });
      }

      statusClause = `AND b.status = $2`;

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
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getProviderEquipment,
  getProviderBookings,
};