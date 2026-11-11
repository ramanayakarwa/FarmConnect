require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Initialize PostgreSQL connection.
require('./src/config/database');

// Import routes.
const authRoutes = require('./src/routes/auth');
const equipmentRoutes = require('./src/routes/equipment');
const bookingRoutes = require('./src/routes/bookings');
const providerRoutes = require('./src/routes/provider');
const notificationRoutes = require('./src/routes/notifications');

// Import error handler.
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Global middleware.
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve equipment images.
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// Health check.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FarmConnect API is running successfully.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API routes.
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/notifications', notificationRoutes);

// Handle unknown routes.
// This must remain after all API routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler must remain last.
app.use(errorHandler);

// Start the server.
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('=======================================');
  console.log('FarmConnect Backend Started');
  console.log('=======================================');
  console.log(
    `Environment: ${process.env.NODE_ENV || 'development'}`
  );
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(
    `Health: http://localhost:${PORT}/api/health`
  );
  console.log('=======================================');
});

module.exports = app;