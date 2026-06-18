-- Example SQL to create the database and users table
-- Replace `node_auth_app_db` with your desired database name if needed.

CREATE DATABASE IF NOT EXISTS `node_auth_app_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `node_auth_app_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
