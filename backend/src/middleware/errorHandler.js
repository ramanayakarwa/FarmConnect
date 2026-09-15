/**
 * Global Error Handler Middleware
 * Must be registered AFTER all routes in server.js
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Validation errors (express-validator)
  if (err.name === 'ValidationError' || err.type === 'ValidationError') {
    statusCode = 422;
    message = err.message || 'Validation failed';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists (duplicate entry)';
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced resource does not exist';
  }

  // PostgreSQL not-null violation
  if (err.code === '23502') {
    statusCode = 400;
    message = `Field '${err.column}' is required`;
  }

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
