-- Migration: Add usage_duration column to products table
-- This migration adds the missing usage_duration column to the products table

USE xplora_db;

-- Add usage_duration column if it doesn't exist
ALTER TABLE products ADD COLUMN usage_duration VARCHAR(50) DEFAULT NULL AFTER purchase_date;
