// backend/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fyp_generator', // ← YOUR DATABASE NAME
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully to:', process.env.DB_NAME);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('Please check your MySQL server is running');
    console.log('Command: sudo service mysql start (Linux/Mac)');
  });
module.exports = pool;