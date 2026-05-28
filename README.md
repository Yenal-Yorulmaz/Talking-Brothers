# 🌍 Xplora - Experience & Product Discovery Platform

A full-stack web application for sharing and discovering authentic experiences and product reviews. Connect with others, find recommendations, and build a community around shared interests.

**[Live Demo](#quick-start)** | **[Features](#-features)** | **[Setup Guide](#-quick-start)** | **[API Docs](#-api-endpoints)**

## ✨ Features

### Core Features
- **👤 User Authentication**: Secure registration and login with JWT tokens
- **✍️ Experience Sharing**: Share detailed experiences with images, ratings, and geolocations
- **⭐ Product Reviews**: Post comprehensive product reviews with title, rating, and purchase date
- **🔔 Real-Time Notifications**: Get notified when followed users share new content
- **📢 Social Network**: Follow other users and categories to discover curated content
- **💬 Notification Badge**: Visual indicator showing unread notification count on bell icon
- **📁 22 Categories**: Browse by categories including Cafe, Restaurant, Electronics, Cinema, Workshop, and more
- **👥 User Profiles**: Personalized profiles with avatars and user information
- **🎨 Responsive Design**: Beautiful mobile-friendly interface built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework with hooks
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Modern JavaScript

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL 8.0+** - Relational database
- **JWT (JSON Web Tokens)** - Authentication
- **bcryptjs** - Password hashing

### Database
- **MySQL** - With 8 core tables for users, experiences, products, categories, notifications, and follows

## 📋 Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)
- [MySQL Server](https://www.mysql.com/downloads/mysql/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/) (optional but recommended)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Talking-Brothers-main
```

### 2. Set Up the Database

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open `server/sql/xplora_schema.sql`
4. Execute the script

This will create:
- `xplora_db` database
- All required tables with proper relationships
- 20 default categories (City, Cinema, Theatre, Workshop, etc.)

### 3. Configure Environment Variables

#### Backend Configuration

1. Navigate to the `server` folder
2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Edit `.env` with your local values:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=xplora_db
DB_PORT=3306

# JWT Configuration (generate a secure random string)
JWT_SECRET=your_secure_random_string_minimum_32_characters
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 4. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 5. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
node index.js
```

Expected output:
```
🚀 SERVER RUNNING: http://localhost:5000
✅ DATABASE CONNECTED! Xplora system ready.
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Expected output:
```
VITE v8.0.5 ready in 566 ms

➜  Local:   http://localhost:5173/
```

3. Open your browser and navigate to the URL shown by Vite

## 🧪 Testing the Application

### Test Accounts

Use these pre-configured test accounts to explore all features:

**Account 1: TestUser2024** (Following user posts)
```
Email: testuser@xplora.com
Password: TestPass123
User ID: 8
```

**Account 2: TechEnthusiast** (Posts creator)
```
Email: techuser@xplora.com
Password: TechPass456
User ID: 9
```

### Feature Testing Checklist

- [ ] **User Authentication**
  - Register a new account
  - Login with existing credentials
  - Logout and verify session clears

- [ ] **Experience Sharing**
  - Click "+ NEW EXPERIENCE" button
  - Fill form: Title, Category, Content, Rating, Image
  - Select location on map
  - Submit and verify it appears in feed

- [ ] **Product Reviews**
  - Click "+ NEW PRODUCT" button
  - Fill form: Title, Purchase Date, Rating, Review
  - Submit and verify in feed

- [ ] **Social Features**
  - Search for other users via Search tab
  - Click follow/unfollow buttons
  - Verify followed users appear in "People You're Following"

- [ ] **Category Following**
  - Browse categories in dashboard
  - Click follow on categories (e.g., Electronics, Cafe, Restaurant)
  - Posts from followed categories appear in "New In Your Followed Categories"

- [ ] **Notifications & Badge**
  - Have TestUser2024 follow TechEnthusiast
  - Log in as TechEnthusiast and create a product
  - Switch back to TestUser2024
  - **Notification badge appears on bell icon** with unread count
  - Click bell to view notifications
  - Click notification to mark as read

- [ ] **Dashboard Sections**
  - "New In Your Followed Categories" shows posts from followed categories
  - "New from Followed People" shows posts from followed users
  - "People You're Following" displays your followed users

### Quick Testing Flow

```bash
# Terminal 1: Start Backend
cd server
node index.js

# Terminal 2: Start Frontend
cd client
npm run dev

# Browser: Open http://localhost:5173
# 1. Login with testuser@xplora.com / TestPass123
# 2. Browse dashboard
# 3. Follow TechEnthusiast in Search
# 4. Logout
# 5. Login with techuser@xplora.com / TechPass456
# 6. Create a new product
# 7. Logout and login back as TestUser2024
# 8. Verify notification badge shows new notification count
```

## 📁 Project Structure

```
Talking-Brothers-main/
├── client/                    # React frontend
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── AuthContext.jsx   # Authentication context
│   │   ├── LoginPage.jsx     # Login/Register page
│   │   ├── DashboardPage.jsx # Main dashboard
│   │   ├── ProfilesPage.jsx  # User profiles
│   │   ├── NewExperience.jsx # Experience creation
│   │   ├── NewProduct.jsx    # Product creation
│   │   └── ...               # Other components
│   ├── package.json
│   └── vite.config.js
├── server/                    # Node.js backend
│   ├── index.js              # Express server & routes
│   ├── sql/
│   │   └── xplora_schema.sql # Database schema
│   ├── .env.example          # Environment template
│   ├── package.json
│   ├── SECURITY.md           # Security guidelines
│   └── .gitignore
├── DEPLOYMENT.md             # Production deployment guide
└── README.md                 # This file
```

## 🔐 Security Notes

- **Never commit `.env` files** - They contain sensitive information
- All `.env` files are ignored in `.gitignore`
- Use strong, random JWT secrets in production
- See [SECURITY.md](server/SECURITY.md) for detailed security practices
- Passwords are hashed using bcryptjs before storage
- All sensitive data is excluded from version control

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
  - Body: `{ username, email, password }`
- `POST /api/auth/login` - User login
  - Body: `{ email, password }`
  - Returns: `{ token, user: { id, username, email } }`

### Experiences
- `POST /api/experiences` - Create experience (requires auth)
  - Body: `{ category, title, content, rating, location, experience_image }`
  - Notifies followers in that category + user followers
- `GET /api/experiences` - Get all experiences
- `GET /api/experiences/:id` - Get experience details

### Products  
- `POST /api/products` - Create product (requires auth)
  - Body: `{ category, product_name, purchase_date, rating, content, product_image }`
  - Notifies followers in that category + user followers
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details

### Notifications
- `GET /api/notifications` - Get all user notifications (requires auth)
  - Returns: Array of notifications with author details
- `GET /api/notifications/unread/:userId` - Get unread notification count
  - Returns: `{ unread_count: number }`
- `POST /api/notifications/read-all` - Mark all notifications as read (requires auth)

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/experiences` - Get user's experiences
- `GET /api/users/:id/products` - Get user's products
- `GET /api/users/search?q=username` - Search for users
- `GET /api/users/followed` - Get list of followed users (requires auth)
- `POST /api/users/:id/follow` - Follow a user (requires auth)
- `DELETE /api/users/:id/follow` - Unfollow a user (requires auth)

### Categories
- `GET /api/categories` - Get all categories (22 total)
- `GET /api/categories/:id/follow` - Get category follow status (requires auth)
- `POST /api/categories/:id/follow` - Follow a category (requires auth)
- `DELETE /api/categories/:id/follow` - Unfollow a category (requires auth)

### Dashboard
- `GET /api/dashboard/followed-updates` - Get posts from followed users and categories (requires auth)
  - Returns: Posts sorted by creation date with `from_user_follow` flag

**Authorization Header Required:**
```
Authorization: Bearer {jwt_token}
```

See [server/index.js](server/index.js) for complete endpoint documentation and error codes.

## �️ Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | User accounts | id, username, email, password_hash, avatar_url, created_at |
| **categories** | Categories (22 total) | id, name, icon |
| **products** | Product reviews | id, user_id, category_id, product_name, purchase_date, rating, product_image, created_at |
| **experiences** | Experience entries | id, user_id, category_id, title, location, rating, experience_image, created_at |

### Relationship Tables

| Table | Purpose | Fields |
|-------|---------|--------|
| **category_follows** | Users follow categories | user_id, category_id (unique pair) |
| **user_follows** | Users follow other users | follower_id, following_id (unique pair) |
| **notifications** | User notifications | user_id, type, reference_id, author_id, is_read, created_at |

### 22 Default Categories
```
Accessories, Automotive, Beauty & Personal Care, Books & Stationery,
Cafe, Cinema, City, Electronics, Fashion & Apparel, Garden & DIY,
Grocery / Supermarket, Health & Wellness, Home & Living, Mother & Baby,
Office Supplies, Pet Supplies, Restaurant, Shoes & Bags, Sports & Outdoors,
Theatre, Toys & Hobbies, Workshop
```

## �🛠️ Available Commands

### Backend
```bash
cd server
node index.js          # Start development server
```

### Frontend
```bash
cd client
npm run dev            # Start development server
npm run build          # Build for production
npm run lint           # Run ESLint
npm run preview        # Preview production build
```

## 📝 Important Notes

- **Default Ports**: Backend runs on `5000`, Frontend on `5173`
- **Port Conflicts**: If Vite detects port `5173` is in use, it will use the next available port
- **Database Schema**: The SQL file is the single source of truth for database structure
- **CORS**: Backend is configured to accept requests from `http://localhost:5173`
- **JWT Tokens**: Stored in browser localStorage under key `token` - do not share in production

## 🔧 Troubleshooting

### Backend Issues

**Error: "Cannot find module 'express'"**
```bash
cd server
npm install
```

**Error: "connect ECONNREFUSED 127.0.0.1:3306"**
- MySQL is not running. Start MySQL server:
  - **Windows**: Services → MySQL → Start
  - **Mac**: `brew services start mysql`
  - **Linux**: `sudo systemctl start mysql`

**Error: "ER_NO_DB_ERROR: No database selected"**
- Run the schema file in MySQL Workbench:
  - Open `server/sql/xplora_schema.sql`
  - Execute it completely (should see "Queries executed successfully")

**Error: "listen EADDRINUSE: address already in use :::5000"**
```bash
# Kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

**Error: ".env variables not loading"**
- Ensure `.env` file exists in `server/` folder (not in `server/.env`)
- Restart the server after creating/modifying `.env`
- Check for typos in variable names

### Frontend Issues

**Error: "Cannot find module '@vitejs/plugin-react'"**
```bash
cd client
npm install
```

**Error: "Module not found: react-leaflet"**
```bash
cd client
npm install react-leaflet leaflet
```

**Notification badge not showing**
- Open browser DevTools (F12) → Console
- Check for any red errors
- Verify backend is running and `/api/notifications/unread/{userId}` endpoint is accessible
- Ensure user is logged in (token in localStorage)

**Images not loading**
- Check browser console for errors
- Ensure images are in Base64 format when uploading
- Verify `product_image` and `experience_image` fields are being saved

### Database Issues

**Error: "Table already exists"**
- Delete the database: `DROP DATABASE xplora_db;`
- Re-run the schema file

**Error: "Foreign key constraint fails"**
- Ensure you're deleting in the correct order (child tables first)
- Or disable foreign keys temporarily: `SET FOREIGN_KEY_CHECKS=0;`

## 📚 Development Tips

- Use the React Developer Tools browser extension for debugging
- Use `console.log()` in frontend, `console.error()` in backend
- Check network tab in DevTools for API request/response details
- MySQL Workbench has excellent query debugging tools
- Always commit changes with meaningful messages for team collaboration

## 🚀 Deployment

For production deployment instructions, refer to [DEPLOYMENT.md](DEPLOYMENT.md) which covers:
- Environment configuration for production
- Backend deployment (PM2, Docker, cloud platforms)
- Frontend build and deployment
- Database setup and migration
- SSL/HTTPS configuration
- Security best practices
- Monitoring and logging

## 🤝 Contributing

**For Team Members:**

1. Create a feature branch with a descriptive name:
   ```bash
   git checkout -b feature/add-notifications
   git checkout -b fix/notification-badge-styling
   ```

2. Make changes and test locally with both servers running

3. Commit changes with clear messages:
   ```bash
   git commit -m "feat: add notification badge counter"
   git commit -m "fix: resolve database connection timeout"
   git commit -m "docs: update setup instructions"
   ```

4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub with:
   - Description of changes
   - Testing steps
   - Screenshots if UI changes
   - Any breaking changes noted

**Commit Message Format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `style:` - Formatting

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Team

Built by the Talking Brothers team 🚀

## 🆘 Getting Help

- **Setup Issues?** Check the [Troubleshooting](#-troubleshooting) section
- **API Questions?** See [API Endpoints](#-api-endpoints)
- **Database Help?** Review [Database Schema](#️-database-schema)
- **General Questions?** Create an issue on GitHub or reach out to the team

---

**Happy Coding! 🎉**

## 📧 Support

For issues, questions, or feedback, please open an issue on the GitHub repository.

## 🗂️ Key Files

- [Database Schema](server/sql/xplora_schema.sql) - Complete database structure
- [Security Guidelines](server/SECURITY.md) - Security practices and requirements
- [Deployment Guide](DEPLOYMENT.md) - Production setup instructions
- [Backend Configuration](.env.example) - Environment variables template
