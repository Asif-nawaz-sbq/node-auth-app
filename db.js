// db.js
// Uses MySQL (mysql2) and reads connection values from environment variables.
// Exports small helpers: `query`, `get`, and `run` for simple use in routes.

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

function buildSslOptions() {
  if (!process.env.DB_SSL) return undefined;
  // If DB_SSL is set (truthy), attempt to load any provided cert files.
  const ssl = {};
  if (process.env.DB_SSL_CA_PATH && fs.existsSync(process.env.DB_SSL_CA_PATH)) {
    ssl.ca = fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8');
  }
  if (process.env.DB_SSL_CERT_PATH && fs.existsSync(process.env.DB_SSL_CERT_PATH)) {
    ssl.cert = fs.readFileSync(process.env.DB_SSL_CERT_PATH, 'utf8');
  }
  if (process.env.DB_SSL_KEY_PATH && fs.existsSync(process.env.DB_SSL_KEY_PATH)) {
    ssl.key = fs.readFileSync(process.env.DB_SSL_KEY_PATH, 'utf8');
  }
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false') {
    ssl.rejectUnauthorized = false;
  }

  // If no files were provided but DB_SSL is truthy, return true to request SSL.
  if (Object.keys(ssl).length === 0) return true;
  return ssl;
}

const sslOptions = buildSslOptions();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'node_auth_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(sslOptions ? { ssl: sslOptions } : {})
});

// Ensure the `users` table exists
async function ensureTables() {
  const create = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;
  await pool.query(create);
}

// Run table creation immediately (fire-and-forget, but log errors)
ensureTables().catch(err => {
  console.error('Error ensuring DB tables:', err);
});

module.exports = {
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  },
  get: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows[0] || null;
  },
  run: async (sql, params) => {
    const [result] = await pool.query(sql, params);
    return result; // contains insertId, affectedRows, etc.
  }
};
