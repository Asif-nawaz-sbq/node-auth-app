#!/usr/bin/env node
// scripts/create_db.js
// Creates the MySQL database (if missing) and the `users` table.

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'node_auth_app_db';

function buildSsl() {
  if (!process.env.DB_SSL) return undefined;
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
  if (Object.keys(ssl).length === 0) {
    // If DB_SSL is truthy but no files provided, use true to request SSL.
    return true;
  }
  return ssl;
}

async function main() {
  const ssl = buildSsl();

  // Connect without specifying database so we can create it if needed
  const conn = await mysql.createConnection({ host, port, user, password, ssl });
  try {
    console.log(`Creating database ${dbName} (if it doesn't exist)`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${dbName}\``);

    console.log('Creating `users` table (if missing)');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    console.log('Database and table ensured.');
  } catch (err) {
    console.error('Error creating database or table:', err.message || err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
