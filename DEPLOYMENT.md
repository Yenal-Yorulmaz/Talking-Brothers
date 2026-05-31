# Xplora Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured in `.env`
- [ ] JWT_SECRET changed to a secure random string (32+ characters)
- [ ] Database credentials are environment-based
- [ ] HTTPS is enabled on your server
- [ ] CORS whitelist updated for your domain
- [ ] Database migrations applied
- [ ] Client build tested locally
- [ ] All console.log statements removed
- [ ] Test routes removed/secured

## Backend Deployment

### 1. Set Environment Variables

Create a `.env` file on your production server:

```env
DB_HOST=your_production_db_host
DB_USER=prod_db_user
DB_PASSWORD=secure_database_password
DB_NAME=xplora_db
DB_PORT=3306
JWT_SECRET=generate_a_secure_random_string_here_minimum_32_chars
JWT_EXPIRES_IN=24h
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### 2. Install Dependencies

```bash
cd server
npm install --production
```

### 3. Setup Database

Run the schema on your production MySQL instance:

```bash
mysql -h your_db_host -u db_user -p < sql/xplora_schema.sql
```

### 4. Start Server

Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start index.js --name xplora-api
pm2 save
pm2 startup
```

Or use Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

## Frontend Deployment

### 1. Create Production Build

```bash
cd client
npm install
npm run build
```

This creates a `dist/` folder with optimized static files.

### 2. Configure API Base URL

Add a `.env.production` file in the client folder:

```env
VITE_API_URL=https://yourdomain.com/api
```

Or update the API_BASE variable in source files to use environment variables.

### 3. Deploy Static Files

Upload the `dist/` folder to your web server:

**Option A: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option C: Traditional Server (Nginx)**
```bash
# Copy dist files to web root
sudo cp -r dist/* /var/www/xplora/

# Configure Nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    root /var/www/xplora;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api/ {
        proxy_pass https://your_api_server:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database Deployment

### Production Database Best Practices

1. **Regular Backups**
   ```bash
   mysqldump -h host -u user -p xplora_db > backup.sql
   ```

2. **Connection Pooling**
   - Already implemented in code (`connectionLimit: 10`)

3. **SSL for DB Connections**
   - Recommended for remote databases

4. **User Permissions**
   ```sql
   CREATE USER 'xplora_prod'@'app_server_ip' IDENTIFIED BY 'secure_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON xplora_db.* TO 'xplora_prod'@'app_server_ip';
   ```

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

### Update server.js for HTTPS (if needed)

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(5000);
```

## Performance Optimization

1. **Database Indexing** - Indexes are already configured in schema
2. **Caching** - Consider adding Redis for sessions/cache
3. **CDN** - Use Cloudflare or similar for static asset delivery
4. **Compression** - Already enabled via Nginx/reverse proxy

## Monitoring & Logging

### Server Logs
```bash
pm2 logs xplora-api
pm2 monit
```

### Application Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor database performance
- Track API response times

## Common Issues

### CORS Errors
- Update FRONTEND_URL in backend `.env`
- Ensure HTTPS is used consistently

### Database Connection Errors
- Check credentials in `.env`
- Verify network connectivity
- Check MySQL is running and accessible

### Upload Size Limits
- Adjust in Express: `app.use(express.json({ limit: '10mb' }))`
- Check Nginx: `client_max_body_size 10M`

## Rollback Plan

1. Keep previous version deployed
2. Use PM2 to quickly restart previous version
3. Have database backups ready
4. Test rollback procedure regularly

## Security Headers (Verify in Production)

The backend sets:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

Verify with:
```bash
curl -I https://yourdomain.com
```
