const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
app.use(express.json({ limit: '10mb' })); // Limit request size

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// JWT Secret - CHANGE THIS TO A SECURE RANDOM STRING IN PRODUCTION
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// --- DATABASE CONNECTION ---
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'xplora_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Connection Test
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DATABASE ERROR: ", err.message);
  } else {
    console.log("✅ DATABASE CONNECTED! Xplora system ready.");
    
    // Initialize database schema if tables don't exist
    const initSchema = () => {
      const queries = [
        `CREATE TABLE IF NOT EXISTS users (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          avatar_url LONGTEXT DEFAULT NULL,
          banner_url LONGTEXT DEFAULT NULL,
          bio TEXT DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS categories (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL UNIQUE,
          icon VARCHAR(100) DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS experiences (
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS products (
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS user_follows (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          follower_id INT UNSIGNED NOT NULL,
          following_id INT UNSIGNED NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY (follower_id, following_id),
          FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS category_follows (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          user_id INT UNSIGNED NOT NULL,
          category_id INT UNSIGNED NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY (user_id, category_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        
        `CREATE TABLE IF NOT EXISTS notifications (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          user_id INT UNSIGNED NOT NULL,
          sender_id INT UNSIGNED NOT NULL,
          experience_id INT UNSIGNED DEFAULT NULL,
          product_id INT UNSIGNED DEFAULT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      ];
      
      queries.forEach((query, index) => {
        connection.query(query, (err) => {
          if (err && err.code !== 'ER_TABLE_EXISTS_ERROR') {
            console.error(`❌ Schema init error (query ${index + 1}):`, err.message);
          } else if (!err) {
            console.log(`✅ Schema query ${index + 1} completed`);
          }
        });
      });
    };
    
    initSchema();
    
    // Run migrations - check if banner_url and bio columns exist
    const dbName = process.env.DB_NAME || 'xplora_db';
    
    // Check for banner_url column
    connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='users' AND COLUMN_NAME='banner_url'`,
      [dbName],
      (err, results) => {
        if (!results || results.length === 0) {
          connection.query(
            "ALTER TABLE users ADD COLUMN banner_url LONGTEXT DEFAULT NULL",
            (err) => {
              if (err && err.code !== 'ER_DUP_FIELDNAME') {
                console.error("❌ Migration error:", err.message);
              }
            }
          );
        }
      }
    );

    // Check for bio column
    connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='users' AND COLUMN_NAME='bio'`,
      [dbName],
      (err, results) => {
        if (!results || results.length === 0) {
          connection.query(
            "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL",
            (err) => {
              if (err && err.code !== 'ER_DUP_FIELDNAME') {
                console.error("❌ Migration error:", err.message);
              } else {
                console.log("✅ Database schema is up to date.");
              }
            }
          );
        } else {
          console.log("✅ Database schema is up to date.");
        }
      }
    );
    
    connection.release();
  }
});

// Input validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
};
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = email.toLowerCase().trim();
    
    // Validate inputs
    if (!sanitizedUsername || !sanitizedEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
      return res.status(400).json({ error: 'Username must be 3-50 characters' });
    }
    
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
      });
    }
    
    // Check if user exists
    const [existingUser] = await db.promise().query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [sanitizedEmail, sanitizedUsername]
    );
    
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password with higher cost
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insert user
    const [result] = await db.promise().query(
      'INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
      [sanitizedUsername, sanitizedEmail, hashedPassword, null]
    );
    
    const token = jwt.sign(
      { id: result.insertId, username: sanitizedUsername }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: { id: result.insertId, username: sanitizedUsername, email: sanitizedEmail, avatar_url: null, banner_url: null, bio: null, created_at: new Date() }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' }); // Don't leak error details
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const sanitizedEmail = email.toLowerCase().trim();
    
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Find user
    const [users] = await db.promise().query(
      'SELECT id, username, email, password_hash, avatar_url, banner_url, bio FROM users WHERE email = ?',
      [sanitizedEmail]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, banner_url: user.banner_url, bio: user.bio, created_at: user.created_at }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- API ROUTES ---

// 1. Get All Experiences
app.get('/api/experiences', (req, res) => {
  const sql = `
    SELECT e.*, u.avatar_url, c.name as category_name 
    FROM experiences e 
    JOIN users u ON e.user_id = u.id 
    JOIN categories c ON e.category_id = c.id
    ORDER BY e.created_at DESC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// 2. Create New Experience
app.post('/api/experiences', authenticateToken, async (req, res) => {
  try {
    const { category_id, category_name, title, content, location, rating, product_id, experience_image } = req.body;
    const user_id = req.user.id;
    let resolvedCategoryId = category_id;

    // If product_id is provided, get category from the product
    if (product_id && !resolvedCategoryId) {
      const [products] = await db.promise().query(
        'SELECT category_id FROM products WHERE id = ?',
        [product_id]
      );

      if (products.length > 0) {
        resolvedCategoryId = products[0].category_id;
      }
    }

    // If still no category_id, try to resolve from category_name
    if (!resolvedCategoryId && category_name) {
      const [existingCategory] = await db.promise().query(
        'SELECT id FROM categories WHERE name = ?',
        [category_name]
      );

      if (existingCategory.length > 0) {
        resolvedCategoryId = existingCategory[0].id;
      } else {
        const [insertCategory] = await db.promise().query(
          'INSERT INTO categories (name) VALUES (?)',
          [category_name]
        );
        resolvedCategoryId = insertCategory.insertId;
      }
    }

    if (!resolvedCategoryId) {
      return res.status(400).json({ error: 'Missing category information' });
    }

    // Insert experience into database
    const insertSql = `
      INSERT INTO experiences (user_id, category_id, title, content, location, rating, product_id, experience_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await db.promise().query(insertSql, [user_id, resolvedCategoryId, title, content, location, rating, product_id || null, experience_image || null]);
    const experienceId = result.insertId;

    // Send notifications to category followers AND user followers
    let notificationUsers = new Set();
    
    // Get category followers
    const followersSql = `
      SELECT user_id FROM category_follows 
      WHERE category_id = ? AND user_id != ?`;
    
    const [categoryFollowers] = await db.promise().query(followersSql, [resolvedCategoryId, user_id]);
    categoryFollowers.forEach(follower => notificationUsers.add(follower.user_id));
    
    // Get user followers (people following the author)
    const userFollowersSql = `
      SELECT follower_id FROM user_follows 
      WHERE following_id = ?`;
    
    const [userFollowers] = await db.promise().query(userFollowersSql, [user_id]);
    userFollowers.forEach(follower => notificationUsers.add(follower.follower_id));
    
    // Add notifications for all followers (category + user followers)
    if (notificationUsers.size > 0) {
      const notificationValues = Array.from(notificationUsers).map(userId => [userId, 'new_experience', experienceId]);
      const notificationSql = `
        INSERT INTO notifications (user_id, type, reference_id) 
        VALUES ?`;
      
      await db.promise().query(notificationSql, [notificationValues]);
    }

    res.status(201).json({ 
      message: 'Experience created successfully', 
      id: experienceId 
    });
  } catch (error) {
    console.error("Experience creation error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An experience with this title already exists.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// 3. Get User Unread Notification Count
app.get('/api/notifications/unread/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const sql = `
    SELECT COUNT(*) as unread_count 
    FROM notifications 
    WHERE user_id = ? AND is_read = 0`;
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Notification count query error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ unread_count: result[0].unread_count });
  });
});

// 4. Categorize Get
app.get('/api/categories', (req, res) => {
  const sql = `SELECT * FROM categories ORDER BY name`;
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Category query error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// 4.0. Get followed categories for a user
app.get('/api/categories/followed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT c.id, c.name
      FROM category_follows cf
      JOIN categories c ON c.id = cf.category_id
      WHERE cf.user_id = ?
      ORDER BY c.name ASC`;

    const [followedCategories] = await db.promise().query(sql, [userId]);
    res.json(followedCategories);
  } catch (error) {
    console.error('Followed categories fetch error:', error);
    res.status(500).json({ error: 'Unable to load followed categories' });
  }
});

// 4.1. Follow status for a category
app.get('/api/categories/:id/follow-status', authenticateToken, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      'SELECT id FROM category_follows WHERE user_id = ? AND category_id = ?',
      [userId, categoryId]
    );

    res.json({ followed: rows.length > 0 });
  } catch (error) {
    console.error('Follow status error:', error);
    res.status(500).json({ error: 'Unable to check follow status' });
  }
});

// 4.2. Follow a category
app.post('/api/categories/:id/follow', authenticateToken, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user.id;

    // Check if already following
    const [existing] = await db.promise().query(
      'SELECT id FROM category_follows WHERE user_id = ? AND category_id = ?',
      [userId, categoryId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Already following this category' });
    }

    // Insert the follow
    await db.promise().query(
      'INSERT INTO category_follows (user_id, category_id) VALUES (?, ?)',
      [userId, categoryId]
    );

    res.status(200).json({ message: 'Category followed' });
  } catch (error) {
    console.error('Follow category error:', error);
    res.status(500).json({ error: 'Unable to follow category' });
  }
});

// 4.3. Unfollow a category
app.delete('/api/categories/:id/follow', authenticateToken, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user.id;

    await db.promise().query(
      'DELETE FROM category_follows WHERE user_id = ? AND category_id = ?',
      [userId, categoryId]
    );

    res.status(200).json({ message: 'Category unfollowed' });
  } catch (error) {
    console.error('Unfollow category error:', error);
    res.status(500).json({ error: 'Unable to unfollow category' });
  }
});

// 4.4. Get notifications for current user
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT
        n.id,
        n.type,
        n.reference_id,
        n.is_read,
        n.created_at,
        COALESCE(ce.id, cp.id) AS category_id,
        COALESCE(ce.name, cp.name) AS category_name,
        COALESCE(e.title, p.product_name) AS entry_title
      FROM notifications n
      LEFT JOIN experiences e
        ON n.type = 'new_experience' AND e.id = n.reference_id
      LEFT JOIN categories ce
        ON ce.id = e.category_id
      LEFT JOIN products p
        ON n.type = 'new_product' AND p.id = n.reference_id
      LEFT JOIN categories cp
        ON cp.id = p.category_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50`;

    const [notifications] = await db.promise().query(sql, [userId]);
    res.json(notifications);
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Unable to load notifications' });
  }
});

// 4.5. Mark all notifications as read
app.post('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.promise().query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ error: 'Unable to mark notifications read' });
  }
});

// 4.6. Dashboard feed: latest entries in followed categories
app.get('/api/dashboard/followed-updates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT * FROM (
        -- Posts from followed categories
        SELECT
          'experience' AS entry_type,
          e.id AS entry_id,
          e.title AS entry_title,
          e.created_at,
          c.id AS category_id,
          c.name AS category_name,
          u.username AS author_name,
          0 AS from_user_follow
        FROM experiences e
        JOIN categories c ON c.id = e.category_id
        JOIN users u ON u.id = e.user_id
        JOIN category_follows cf ON cf.category_id = e.category_id
        WHERE cf.user_id = ?

        UNION ALL

        SELECT
          'product' AS entry_type,
          p.id AS entry_id,
          p.product_name AS entry_title,
          p.created_at,
          c.id AS category_id,
          c.name AS category_name,
          u.username AS author_name,
          0 AS from_user_follow
        FROM products p
        JOIN categories c ON c.id = p.category_id
        JOIN users u ON u.id = p.user_id
        JOIN category_follows cf ON cf.category_id = p.category_id
        WHERE cf.user_id = ?

        UNION ALL

        -- Posts from followed users
        SELECT
          'experience' AS entry_type,
          e.id AS entry_id,
          e.title AS entry_title,
          e.created_at,
          c.id AS category_id,
          c.name AS category_name,
          u.username AS author_name,
          1 AS from_user_follow
        FROM experiences e
        JOIN categories c ON c.id = e.category_id
        JOIN users u ON u.id = e.user_id
        JOIN user_follows uf ON uf.following_id = e.user_id
        WHERE uf.follower_id = ?

        UNION ALL

        SELECT
          'product' AS entry_type,
          p.id AS entry_id,
          p.product_name AS entry_title,
          p.created_at,
          c.id AS category_id,
          c.name AS category_name,
          u.username AS author_name,
          1 AS from_user_follow
        FROM products p
        JOIN categories c ON c.id = p.category_id
        JOIN users u ON u.id = p.user_id
        JOIN user_follows uf ON uf.following_id = p.user_id
        WHERE uf.follower_id = ?
      ) AS combined
      ORDER BY created_at DESC
      LIMIT 50`;

    const [rows] = await db.promise().query(sql, [userId, userId, userId, userId]);
    res.json(rows);
  } catch (error) {
    console.error('Dashboard followed updates error:', error);
    res.status(500).json({ error: 'Unable to load dashboard updates' });
  }
});

// 5. Get All Products
app.get('/api/products', (req, res) => {
  const sql = `
    SELECT p.*, u.avatar_url, c.name as category_name 
    FROM products p 
    JOIN users u ON p.user_id = u.id 
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Product query error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// 5.1. Get Product Details with Reviews
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  
  // Get product details
  const productSql = `
    SELECT p.*, u.avatar_url, c.name as category_name 
    FROM products p 
    JOIN users u ON p.user_id = u.id 
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?`;

  // Get all experiences/reviews for this product
  const experiencesSql = `
    SELECT e.*, u.avatar_url, u.username, c.name as category_name 
    FROM experiences e 
    JOIN users u ON e.user_id = u.id 
    JOIN categories c ON e.category_id = c.id
    WHERE e.product_id = ?
    ORDER BY e.created_at DESC`;

  db.query(productSql, [productId], (err, productResult) => {
    if (err) {
      console.error("Product details query error:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (productResult.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.query(experiencesSql, [productId], (err, experiencesResult) => {
      if (err) {
        console.error("Product experiences query error:", err);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        product: productResult[0],
        experiences: experiencesResult
      });
    });
  });
});

// Helper function to calculate usage duration from purchase date
function calculateUsageDuration(purchaseDate) {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  
  const diffTime = Math.abs(now - purchase);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Less than 1 day';
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 week';
  if (diffWeeks < 4) return `${diffWeeks} weeks`;
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month';
  if (diffMonths < 12) return `${diffMonths} months`;
  
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? '1 year' : `${diffYears} years`;
}

// 6. Create New Product
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    console.log('[POST /api/products] Full request body:', JSON.stringify(req.body, null, 2));
    const { category_id, category_name, product_name, product_code, purchase_date, pros, cons, content, rating, product_image } = req.body;
    console.log('[POST /api/products] Extracted rating:', rating, 'Type:', typeof rating);
    const user_id = req.user.id;
    let resolvedCategoryId = category_id;

    if (!product_code) {
      return res.status(400).json({ error: 'Product code is required' });
    }

    if (!purchase_date) {
      return res.status(400).json({ error: 'Purchase date is required' });
    }

    // Check for duplicate product code for this user
    const [existingProduct] = await db.promise().query(
      'SELECT id FROM products WHERE user_id = ? AND product_code = ?',
      [user_id, product_code]
    );

    if (existingProduct.length > 0) {
      return res.status(409).json({ error: 'You already have a product with this product code' });
    }

    if (!resolvedCategoryId && category_name) {
      const [existingCategory] = await db.promise().query(
        'SELECT id FROM categories WHERE name = ?',
        [category_name]
      );

      if (existingCategory.length > 0) {
        resolvedCategoryId = existingCategory[0].id;
      } else {
        const [insertCategory] = await db.promise().query(
          'INSERT INTO categories (name) VALUES (?)',
          [category_name]
        );
        resolvedCategoryId = insertCategory.insertId;
      }
    }

    if (!resolvedCategoryId) {
      return res.status(400).json({ error: 'Missing category information' });
    }

    // Calculate usage duration from purchase date
    const usage_duration = calculateUsageDuration(purchase_date);

    const insertSql = `
      INSERT INTO products (user_id, category_id, product_name, product_code, purchase_date, usage_duration, pros, cons, content, rating, product_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await db.promise().query(insertSql, [user_id, resolvedCategoryId, product_name, product_code, purchase_date, usage_duration, pros, cons, content, rating || 5, product_image || null]);
    const productId = result.insertId;

    let notificationUsers = new Set();
    
    // Get category followers
    const followersSql = `
      SELECT user_id FROM category_follows 
      WHERE category_id = ? AND user_id != ?`;
    
    const [categoryFollowers] = await db.promise().query(followersSql, [resolvedCategoryId, user_id]);
    categoryFollowers.forEach(follower => notificationUsers.add(follower.user_id));
    
    // Get user followers (people following the author)
    const userFollowersSql = `
      SELECT follower_id FROM user_follows 
      WHERE following_id = ?`;
    
    const [userFollowers] = await db.promise().query(userFollowersSql, [user_id]);
    userFollowers.forEach(follower => notificationUsers.add(follower.follower_id));
    
    // Add notifications for all followers (category + user followers)
    if (notificationUsers.size > 0) {
      const notificationValues = Array.from(notificationUsers).map(userId => [userId, 'new_product', productId]);
      const notificationSql = `
        INSERT INTO notifications (user_id, type, reference_id) 
        VALUES ?`;
      
      await db.promise().query(notificationSql, [notificationValues]);
    }

    res.status(201).json({ 
      message: 'Product created successfully', 
      id: productId 
    });
  } catch (error) {
    console.error("Product creation error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A product with this name already exists.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// 7. Delete Product
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const user_id = req.user.id;

    // Check if product exists and user owns it
    const [product] = await db.promise().query(
      'SELECT user_id FROM products WHERE id = ?',
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own products' });
    }

    // Delete associated experiences first
    await db.promise().query('DELETE FROM experiences WHERE product_id = ?', [productId]);

    // Delete product
    await db.promise().query('DELETE FROM products WHERE id = ?', [productId]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 7.1. Admin Delete Product (no ownership check)
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const adminKey = req.query.key;

    // Simple admin key check
    if (adminKey !== 'xplora_admin_2026') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if product exists
    const [product] = await db.promise().query(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated experiences first
    await db.promise().query('DELETE FROM experiences WHERE product_id = ?', [productId]);

    // Delete product
    await db.promise().query('DELETE FROM products WHERE id = ?', [productId]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 7.2. Delete Product by ID (simple admin endpoint)
app.get('/api/admin/delete-product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const adminKey = req.query.key;

    // Simple admin key check
    if (adminKey !== 'xplora_admin_2026') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete associated experiences first
    await db.promise().query('DELETE FROM experiences WHERE product_id = ?', [productId]);

    // Delete product
    const [result] = await db.promise().query('DELETE FROM products WHERE id = ?', [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Delete Experiences with Turkish Categories
app.get('/api/admin/delete-turkish-experiences', async (req, res) => {
  try {
    const adminKey = req.query.key;

    // Simple admin key check
    if (adminKey !== 'xplora_admin_2026') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Turkish categories: Sinema (id: 1), Teknoloji (id: 3)
    const [result] = await db.promise().query(
      'DELETE FROM experiences WHERE category_id IN (1, 3)'
    );

    res.json({ 
      message: `Successfully deleted ${result.affectedRows} experiences with Turkish categories`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error("Delete Turkish experiences error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Delete All Experiences
app.get('/api/admin/delete-all-experiences', async (req, res) => {
  try {
    const adminKey = req.query.key;

    // Simple admin key check
    if (adminKey !== 'xplora_admin_2026') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [result] = await db.promise().query('DELETE FROM experiences');

    res.json({ 
      message: `Successfully deleted all ${result.affectedRows} experiences`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error("Delete all experiences error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Delete All Products
app.get('/api/admin/delete-all-products', async (req, res) => {
  try {
    const adminKey = req.query.key;

    // Simple admin key check
    if (adminKey !== 'xplora_admin_2026') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete associated experiences first
    await db.promise().query('DELETE FROM experiences WHERE product_id IS NOT NULL OR product_id > 0');

    // Delete products
    const [result] = await db.promise().query('DELETE FROM products');

    res.json({ 
      message: `Successfully deleted all ${result.affectedRows} products`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error("Delete all products error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 8. Search Experiences and Products
app.get('/api/search', (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query || query.trim().length === 0) {
      return res.json({ experiences: [], products: [] });
    }

    const searchTerm = `%${query}%`;

    // Search experiences
    const experiencesSql = `
      SELECT e.*, u.avatar_url, c.name as category_name 
      FROM experiences e 
      JOIN users u ON e.user_id = u.id 
      JOIN categories c ON e.category_id = c.id
      WHERE e.title LIKE ? OR e.content LIKE ? OR c.name LIKE ?
      ORDER BY e.created_at DESC
      LIMIT 10`;

    // Search products
    const productsSql = `
      SELECT p.*, u.avatar_url, c.name as category_name 
      FROM products p 
      JOIN users u ON p.user_id = u.id 
      JOIN categories c ON p.category_id = c.id
      WHERE p.product_name LIKE ? OR p.content LIKE ? OR c.name LIKE ?
      ORDER BY p.created_at DESC
      LIMIT 10`;

    db.query(experiencesSql, [searchTerm, searchTerm, searchTerm], (err, experiencesResult) => {
      if (err) {
        console.error("Experience search error:", err);
        return res.status(500).json({ error: err.message });
      }

      db.query(productsSql, [searchTerm, searchTerm, searchTerm], (err, productsResult) => {
        if (err) {
          console.error("Product search error:", err);
          return res.status(500).json({ error: err.message });
        }

        res.json({
          experiences: experiencesResult,
          products: productsResult
        });
      });
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 9. Search Users by username
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const userId = req.user.id;
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    
    const searchPattern = `%${searchTerm}%`;
    
    const [results] = await db.promise().query(
      `SELECT u.id, u.username, u.avatar_url, u.created_at,
              CASE WHEN uf.follower_id IS NOT NULL THEN 1 ELSE 0 END as is_followed
       FROM users u
       LEFT JOIN user_follows uf ON (uf.following_id = u.id AND uf.follower_id = ?)
       WHERE u.id != ? AND (u.username LIKE ? OR u.email LIKE ?)
       LIMIT 20`,
      [userId, userId, searchPattern, searchPattern]
    );
    
    res.json(results);
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 9.5. Get Followed Users
app.get('/api/users/followed', authenticateToken, async (req, res) => {
  try {
    console.log('✅ GET /api/users/followed endpoint called!');
    const userId = req.user.id;
    console.log('Fetching followed users for userId:', userId);
    const [results] = await db.promise().query(
      `SELECT u.id, u.username, u.avatar_url, u.created_at
       FROM users u
       INNER JOIN user_follows uf ON (uf.following_id = u.id AND uf.follower_id = ?)
       ORDER BY uf.id DESC
       LIMIT 50`,
      [userId]
    );
    res.json(results);
  } catch (error) {
    console.error("Get followed users error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TEST ENDPOINT
app.get('/api/users/test-followed', authenticateToken, async (req, res) => {
  console.log('✅ TEST /api/users/test-followed endpoint called!');
  res.json({ test: true, message: 'Test endpoint works!' });
});

// 10. Follow User
app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;
    
    // Prevent self-follow
    if (followingId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    // Check if user exists
    const [userExists] = await db.promise().query(
      'SELECT id FROM users WHERE id = ?',
      [followingId]
    );
    
    if (userExists.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already following
    const [existing] = await db.promise().query(
      'SELECT id FROM user_follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Already following this user' });
    }
    
    // Add follow relationship
    await db.promise().query(
      'INSERT INTO user_follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );
    
    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 11. Unfollow User
app.delete('/api/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;
    
    // Remove follow relationship
    const [result] = await db.promise().query(
      'DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not following this user' });
    }
    
    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get followers count for a user
app.get('/api/users/:id/followers', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [result] = await db.promise().query(
      'SELECT COUNT(*) as count FROM user_follows WHERE following_id = ?',
      [userId]
    );
    
    const count = result[0]?.count || 0;
    res.json({ count });
  } catch (error) {
    console.error("Get followers count error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get following count for a user
app.get('/api/users/:id/following', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [result] = await db.promise().query(
      'SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?',
      [userId]
    );
    
    const count = result[0]?.count || 0;
    res.json({ count });
  } catch (error) {
    console.error("Get following count error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.send("Xplora API Server Running 🚀");
});

// --- PROFILE PICTURE UPLOAD ---
app.post('/api/users/:id/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Update user avatar_url in database
    const [result] = await db.promise().query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [file, userId]
    );

    if (result.affectedRows > 0) {
      res.json({ 
        message: 'Profile picture updated successfully',
        avatar_url: file 
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- PROFILE BANNER UPLOAD ---
app.post('/api/users/:id/banner', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log(`Uploading banner for user ${userId}`);

    // Update user banner_url in database
    const [result] = await db.promise().query(
      'UPDATE users SET banner_url = ? WHERE id = ?',
      [file, userId]
    );

    console.log(`Update result: ${result.affectedRows} rows affected`);

    if (result.affectedRows > 0) {
      res.json({ 
        message: 'Banner updated successfully',
        banner_url: file 
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error("Banner upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- UPDATE USER BIO ---
app.post('/api/users/:id/bio', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { bio } = req.body;

    if (!bio || typeof bio !== 'string') {
      return res.status(400).json({ error: 'Bio must be a non-empty string' });
    }

    // Limit bio length to 500 characters
    if (bio.length > 500) {
      return res.status(400).json({ error: 'Bio must be less than 500 characters' });
    }

    const [result] = await db.promise().query(
      'UPDATE users SET bio = ? WHERE id = ?',
      [bio, userId]
    );

    if (result.affectedRows > 0) {
      res.json({ 
        message: 'Bio updated successfully',
        bio: bio
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error("Bio update error:", error);
    res.status(500).json({ error: error.message });
  }
});

// FINAL TEST ENDPOINT
app.get('/api/final-test-xyz', (req, res) => {
  console.log('✅ FINAL TEST ENDPOINT CALLED!');
  res.json({ message: 'If you see this, routing works!' });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 SERVER RUNNING: http://localhost:${PORT}`);
  console.log(`-----------------------------------------`);
});