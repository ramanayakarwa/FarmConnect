const { Pool, types } = require('pg');

// Preserve PostgreSQL DATE values as YYYY-MM-DD strings.
// Rental dates are calendar dates, not timezone-based timestamps.
types.setTypeParser(types.builtins.DATE, (value) => value);

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Neon/Vercel needs SSL, local PostgreSQL does not
  ...(isProduction && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

// Test connection
pool.connect()
  .then((client) => {
    console.log('✅ PostgreSQL Connected Successfully');
    client.release();
  })
  .catch((err) => {
    console.error('❌ PostgreSQL Connection Failed');
    console.error(err.message);
  });

module.exports = pool;