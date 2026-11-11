const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Every notification endpoint requires login.
router.use(authMiddleware);

// GET /api/notifications
// Returns only the logged-in user's notifications.
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const preferences = await pool.query(
      `
        SELECT notifications_enabled
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

    if (!preferences.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          booking_id,
          message,
          read_at,
          created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 100
      `,
      [userId]
    );

    return res.json({
      success: true,
      enabled: preferences.rows[0].notifications_enabled,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/preferences
// Body: { "enabled": true } or { "enabled": false }
router.put('/preferences', async (req, res, next) => {
  try {
    const { enabled } = req.body || {};

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'enabled must be true or false.',
      });
    }

    const result = await pool.query(
      `
        UPDATE users
        SET notifications_enabled = $1
        WHERE id = $2
        RETURNING notifications_enabled
      `,
      [enabled, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      enabled: result.rows[0].notifications_enabled,
      message: enabled
        ? 'Notifications enabled.'
        : 'Notifications disabled.',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read
// Marks only the logged-in user's notifications as read.
router.put('/read', async (req, res, next) => {
  try {
    await pool.query(
      `
        UPDATE notifications
        SET read_at = NOW()
        WHERE user_id = $1
          AND read_at IS NULL
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      message: 'Notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;