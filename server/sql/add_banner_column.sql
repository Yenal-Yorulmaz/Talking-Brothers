-- Add banner_url column to users table
ALTER TABLE users ADD COLUMN banner_url LONGTEXT DEFAULT NULL;
