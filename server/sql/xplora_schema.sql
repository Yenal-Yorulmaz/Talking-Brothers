-- =============================================================================
-- Xplora Database Schema
-- =============================================================================
-- This is the complete database schema for the Xplora application.
-- It includes all tables for users, experiences, products, categories, 
-- notifications, and user relationships.
-- 
-- Execution: Run this file in MySQL Workbench to create the database and tables.
-- Database: xplora_db
-- MySQL Version: 8.0+
-- Charset: utf8mb4 (supports emojis and international characters)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS xplora_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE xplora_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- Drop Existing Tables (for clean installation)
-- =============================================================================
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_follows;
DROP TABLE IF EXISTS category_follows;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- Users Table
-- Stores user account information including authentication and profile data
-- =============================================================================
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Categories Table
-- Predefined categories for organizing experiences and products
-- =============================================================================
CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Products Table
-- Stores product reviews and information shared by users
-- =============================================================================
CREATE TABLE products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100) DEFAULT NULL,
  purchase_date DATE DEFAULT NULL,
  usage_duration VARCHAR(50) DEFAULT NULL,
  pros TEXT DEFAULT NULL,
  cons TEXT DEFAULT NULL,
  content TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  product_image LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_user_id (user_id),
  KEY idx_products_category_id (category_id),
  CONSTRAINT fk_products_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_products_rating
    CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Experiences Table
-- Stores shared experiences and reviews from users
-- =============================================================================
CREATE TABLE experiences (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  experience_image LONGTEXT DEFAULT NULL,
  product_id INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_experiences_user_id (user_id),
  KEY idx_experiences_category_id (category_id),
  KEY idx_experiences_product_id (product_id),
  CONSTRAINT fk_experiences_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_experiences_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_experiences_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE SET NULL,
  CONSTRAINT chk_experiences_rating
    CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Category Follows Table
-- Tracks which categories users are interested in
-- =============================================================================
CREATE TABLE category_follows (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_category_follows_user_category (user_id, category_id),
  KEY idx_category_follows_category_id (category_id),
  CONSTRAINT fk_category_follows_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_category_follows_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- User Follows Table
-- Tracks user-to-user following relationships
-- =============================================================================
CREATE TABLE user_follows (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  follower_id INT UNSIGNED NOT NULL,
  following_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_follows (follower_id, following_id),
  KEY idx_user_follows_following_id (following_id),
  CONSTRAINT fk_user_follows_follower
    FOREIGN KEY (follower_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_follows_following
    FOREIGN KEY (following_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Notifications Table
-- Stores notifications for user activities (new experiences, products, etc.)
-- =============================================================================
CREATE TABLE notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_id INT UNSIGNED DEFAULT NULL,
  author_id INT UNSIGNED DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_is_read (is_read),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_notifications_author
    FOREIGN KEY (author_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Insert Default Categories
-- These categories are used to organize experiences and products
-- =============================================================================
INSERT INTO categories (name, icon) VALUES
  ('Accessories', NULL),
  ('Automotive', NULL),
  ('Beauty & Personal Care', NULL),
  ('Books & Stationery', NULL),
  ('Cafe', 'coffee'),
  ('Cinema', 'film'),
  ('City', 'map-pin'),
  ('Electronics', NULL),
  ('Fashion & Apparel', NULL),
  ('Garden & DIY', NULL),
  ('Grocery / Supermarket', NULL),
  ('Health & Wellness', NULL),
  ('Home & Living', NULL),
  ('Mother & Baby', NULL),
  ('Office Supplies', NULL),
  ('Pet Supplies', NULL),
  ('Restaurant', 'utensils'),
  ('Shoes & Bags', NULL),
  ('Sports & Outdoors', NULL),
  ('Theatre', 'ticket'),
  ('Toys & Hobbies', NULL),
  ('Workshop', 'hammer');