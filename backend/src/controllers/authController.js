const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// ==========================
// JWT
// ==========================

const signToken = (
  user,
  expiresIn = process.env.JWT_EXPIRE || '7d'
) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );
};

// ==========================
// SAFE USER
// ==========================

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

// ==========================
// REGISTER
// ==========================

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'farmer',
    } = req.body;

    // Required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email, phone and password are required.',
      });
    }

    // Validate role
    if (!['farmer', 'provider'].includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Role must be 'farmer' or 'provider'.",
      });
    }

    const cleanName = String(name).trim();

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    // Keep digits only
    const cleanPhone = String(phone)
      .replace(/\D/g, '');

    // Validate phone
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      });
    }

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message:
          'Phone number must be 10 digits.',
      });
    }

    // Validate name
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    // Validate email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message:
          'Please enter a valid email address.',
      });
    }

    // Check duplicate email
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'An account with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Insert user
    const result = await pool.query(
      `INSERT INTO users
        (name, email, phone, password, role)
       VALUES
        ($1, $2, $3, $4, $5)
       RETURNING
        id, name, email, phone, role, created_at`,
      [
        cleanName,
        cleanEmail,
        cleanPhone,
        hashedPassword,
        role,
      ]
    );

    const user = result.rows[0];

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.log(
      'REGISTER ERROR:',
      err?.message || err
    );

    next(err);
  }
};

// ==========================
// LOGIN
// ==========================

const login = async (req, res, next) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Email and Password are required.',
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = signToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.log(
      'LOGIN ERROR:',
      err?.message || err
    );

    return res.status(500).json({
      success: false,
      message:
        'Login failed. Please try again.',
    });
  }
};

// ==========================
// UPDATE PROFILE
// ==========================

const updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      phone,
    } = req.body;

    const cleanName =
      String(name || '').trim();

    const cleanEmail =
      String(email || '')
        .trim()
        .toLowerCase();

    const cleanPhone =
      String(phone || '').replace(/\D/g, '');

    // Name required
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message:
          'Name cannot be empty.',
      });
    }

    // Email required
    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message:
          'Email cannot be empty.',
      });
    }

    // Phone required
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message:
          'Phone cannot be empty.',
      });
    }

    // Phone must be 10 digits
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message:
          'Phone number must be 10 digits.',
      });
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message:
          'Please enter a valid email address.',
      });
    }

    // Check whether another user
    // already uses this email
    const emailCheck =
      await pool.query(
        `SELECT id
         FROM users
         WHERE email = $1
         AND id != $2`,
        [
          cleanEmail,
          userId,
        ]
      );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'This email is already in use by another account.',
      });
    }

    // Update user
    const result =
      await pool.query(
        `UPDATE users
         SET
           name = $1,
           email = $2,
           phone = $3
         WHERE id = $4
         RETURNING
           id,
           name,
           email,
           phone,
           role`,
        [
          cleanName,
          cleanEmail,
          cleanPhone,
          userId,
        ]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          'User not found.',
      });
    }

    return res.json({
      success: true,
      message:
        'Profile updated successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.log(
      'PROFILE UPDATE ERROR:',
      err?.message || err
    );

    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message:
          'This email is already in use by another account.',
      });
    }

    next(err);
  }
};

// ==========================
// EXPORTS
// ==========================

module.exports = {
  register,
  login,
  updateProfile,
};