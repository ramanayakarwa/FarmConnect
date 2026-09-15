const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test connection on startup
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