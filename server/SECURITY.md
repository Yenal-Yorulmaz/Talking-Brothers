# Xplora Backend - Security Notes

## 🚨 CRITICAL SECURITY REQUIREMENTS

### Before deploying to production:

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` to a secure random string (minimum 32 characters)
2. **Database Credentials**: Never commit real database passwords to version control
3. **HTTPS Only**: Always use HTTPS in production
4. **Environment Variables**: Use `.env` file for all sensitive configuration

### Security Features Implemented:

✅ **Password Hashing**: bcrypt with cost factor 12
✅ **JWT Tokens**: With expiration (24 hours)
✅ **Input Validation**: Email format, password strength, input sanitization
✅ **Rate Limiting**: Basic IP-based rate limiting (100 requests/15min)
✅ **Security Headers**: XSS protection, content type options, frame options
✅ **SQL Injection Protection**: Parameterized queries
✅ **CORS Configuration**: Restricted to frontend origin

### Security Best Practices:

- Use HTTPS in production
- Implement proper logging and monitoring
- Regular security audits
- Keep dependencies updated
- Use environment variables for secrets
- Implement proper error handling (don't leak sensitive info)

### Environment Setup:

1. Copy `.env.example` to `.env`
2. Fill in secure values for all variables
3. In MySQL Workbench, create or connect to a local MySQL server
4. Import `server/sql/xplora_schema.sql` using `Server > Data Import` or by opening the file and running it
5. Confirm the `xplora_db` schema exists before starting the backend
6. Never commit `.env` to version control

### Local Team Setup:

- Each teammate should run their own local MySQL instance
- Use `server/sql/xplora_schema.sql` to create the full schema and starter categories
- Keep each teammate's `.env` local and unshared
- Start the backend with `node index.js` from the `server` folder after import

### Production Checklist:

- [ ] JWT_SECRET is secure and unique
- [ ] Database credentials are environment variables
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is appropriate for load
- [ ] Security headers are set
- [ ] Input validation is comprehensive
- [ ] Error messages don't leak sensitive data