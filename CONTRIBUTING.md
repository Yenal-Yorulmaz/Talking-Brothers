# Contributing to Xplora

Thank you for your interest in contributing to Xplora! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and inclusive. We aim to maintain a welcoming environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Talking-Brothers-main.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [README.md](README.md)

## Development Workflow

### Setting Up Your Development Environment

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Configure environment variables
cp server/.env.example server/.env
# Edit server/.env with your database credentials

# Create and seed the database
# Run server/sql/xplora_schema.sql in MySQL Workbench

# Start both servers
# Terminal 1: cd server && node index.js
# Terminal 2: cd client && npm run dev
```

## Making Changes

### Code Style

- **Frontend (React)**: Follow ESLint rules. Run `npm run lint` in the client directory
- **Backend (Node.js)**: Use consistent formatting with 2-space indentation
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages

Use clear, descriptive commit messages:

```
Good: "Add profile picture upload feature with instant update"
Bad: "fix stuff" or "update code"
```

### Creating Pull Requests

1. Push your branch: `git push origin feature/your-feature-name`
2. Create a Pull Request with:
   - Clear title describing the changes
   - Detailed description of what was changed and why
   - Reference any related issues (e.g., "Fixes #123")
   - Screenshots/videos for UI changes

## Important Guidelines

### Environment Variables
- **NEVER commit `.env` files** - They contain sensitive database credentials
- Always use `.env.example` as a template
- Use `git update-index --assume-unchanged server/.env` if you accidentally staged it

### Testing
- Test your changes locally on both frontend and backend
- Verify database interactions work correctly
- Check for console errors and warnings

### Database Changes
- Always modify `server/sql/xplora_schema.sql` for schema changes
- Never hardcode database operations
- Use parameterized queries to prevent SQL injection

### Security
- Never commit API keys, tokens, or passwords
- Follow the guidelines in [SECURITY.md](server/SECURITY.md)
- Use bcryptjs for password hashing
- Validate and sanitize all user inputs

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/              # Node.js backend
│   ├── sql/             # Database schema
│   ├── index.js         # Main server file
│   ├── .env.example     # Environment template
│   └── package.json
├── README.md
├── DEPLOYMENT.md
└── LICENSE
```

## Common Tasks

### Adding a New Feature

1. Create a feature branch
2. Implement the feature in frontend and/or backend
3. Update the database schema if needed
4. Test thoroughly
5. Submit a pull request

### Fixing a Bug

1. Create a branch named `bugfix/description`
2. Identify and fix the root cause
3. Add a test case if applicable
4. Submit a pull request

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update carefully and test
npm update

# Commit only necessary updates
git commit -m "chore: update dependencies"
```

## Review Process

- All Pull Requests will be reviewed by maintainers
- Feedback will be provided on code quality, security, and design
- All tests must pass before merging
- At least one approval is required

## Questions?

- Open an issue for questions about the codebase
- Check existing issues before creating a new one
- Use clear, descriptive titles for issues

## Acknowledgments

Thank you for helping improve Xplora! Every contribution matters.
