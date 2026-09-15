const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Initialize PostgreSQL Connection
require('./src/config/database');

// Routes
const authRoutes = require('./src/routes/auth');
const equipmentRoutes = require('./src/routes/equipment');
const bookingRoutes = require('./src/routes/bookings');
const providerRoutes = require('./src/routes/provider');

// Middleware
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ======================
// Global Middleware
// ======================

app.use(cors());

app.use(morgan('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ======================
// Static Files (Uploads)
// ======================

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// Health Check Route
// ======================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FarmConnect API is running successfully 🚜',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ======================
// API Routes
// ======================

app.use('/api/auth', authRoutes);

app.use('/api/equipment', equipmentRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/provider', providerRoutes);

// ======================
// 404 Handler
// ======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ======================
// Global Error Handler
// ======================

app.use(errorHandler);

// ======================
// Start Server
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('=======================================');
  console.log('🚜 FarmConnect Backend Started');
  console.log('=======================================');
  console.log(`🌍 Environment : ${process.env.NODE_ENV}`);
  console.log(`🚀 Server      : http://localhost:${PORT}`);
  console.log(`📡 API Base    : http://localhost:${PORT}/api`);
  console.log(`❤️ Health API  : http://localhost:${PORT}/api/health`);
  console.log('=======================================');
});

module.exports = app;