# Ikayama Katalog - Deployment Guide

## Overview
This guide covers the complete deployment process for Ikayama Katalog application to production server with SSL certificate and domain configuration.

**Production Details:**
- Server: 212.85.26.230
- Domain: ebook.ikayama.com
- SSL: Let's Encrypt via Certbot
- Web Server: Nginx (reverse proxy)
- Process Manager: PM2
- Backend Port: 3001 (internal)
- Payment Gateway Port: 3002 (internal)

## Prerequisites

### 1. Domain Configuration
Ensure that `ebook.ikayama.com` points to `212.85.26.230`:
```bash
# Check DNS resolution
nslookup ebook.ikayama.com
```

### 2. Server Access
Ensure you have SSH access to the server:
```bash
ssh root@212.85.26.230
```

### 3. Git Repository
Update the Git repository URL in `ecosystem.config.js` and `deploy.sh`:
```javascript
// In ecosystem.config.js
repo: 'git@github.com:your-username/ikayama_katalog.git'
```

## Deployment Process

### Step 1: Initial Server Setup
Run this command **only once** for the first deployment:

```bash
./deploy.sh setup
```

This will:
- Install Node.js, npm, git, nginx, and certbot
- Install PM2 globally
- Configure Nginx with SSL termination
- Generate SSL certificate for ebook.ikayama.com
- Setup PM2 startup script

### Step 2: Deploy Application
For subsequent deployments:

```bash
./deploy.sh production
```

This will:
- Pull latest code from Git repository
- Install/update dependencies
- Copy production environment files
- Restart applications with PM2

## Configuration Files

### 1. Nginx Configuration (`nginx.conf`)
The Nginx configuration includes:
- HTTP to HTTPS redirect
- SSL termination with Let's Encrypt certificates
- Reverse proxy to backend (port 3001)
- Reverse proxy to payment gateway (port 3002)
- Security headers and gzip compression
- Static file caching

### 2. PM2 Configuration (`ecosystem.config.js`)
- Backend application on port 3001
- Payment gateway on port 3002
- Production environment variables
- Automatic restart and logging

### 3. Environment Files
- `backend/.env.production` - Backend environment variables
- `pvs_pg/.env.production` - Payment gateway environment variables

## SSL Certificate Management

### Automatic Renewal
Certbot automatically renews certificates. To manually renew:

```bash
./deploy.sh ssl-renew
```

### Certificate Locations
- Certificate: `/etc/letsencrypt/live/ebook.ikayama.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/ebook.ikayama.com/privkey.pem`

## Application Management

### Check Application Status
```bash
./deploy.sh status
```

### View Logs
```bash
./deploy.sh logs
```

### Restart Applications
```bash
./deploy.sh restart
```

### Stop Applications
```bash
./deploy.sh stop
```

## Environment Variables Setup

### Backend Environment Variables
Update `backend/.env.production` with actual values:

```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ikayama_db_prod
DB_USER=ikayama_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_very_secure
JWT_EXPIRES_IN=24h
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@ikayama.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@ikayama.com
BASE_URL=https://ebook.ikayama.com
```

### Payment Gateway Environment Variables
Update `pvs_pg/.env.production`:

```env
NODE_ENV=production
PORT=3002
```

## Database Setup

### PostgreSQL Installation
```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser --interactive ikayama_user
sudo -u postgres createdb ikayama_db_prod
```

### Database Configuration
```sql
-- Connect to PostgreSQL
sudo -u postgres psql

-- Set password for user
ALTER USER ikayama_user PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ikayama_db_prod TO ikayama_user;
```

## Security Considerations

### 1. Firewall Configuration
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Environment Variables
- Never commit `.env` files to Git
- Use strong passwords and secrets
- Regularly rotate JWT secrets and database passwords

### 3. SSL Security
- Certificates auto-renew every 90 days
- Strong SSL ciphers configured in Nginx
- HSTS headers enabled

## Monitoring and Logs

### Application Logs
- Backend logs: `/var/www/ikayama_katalog/logs/backend-*.log`
- Payment logs: `/var/www/ikayama_katalog/logs/payment-*.log`

### Nginx Logs
- Access log: `/var/log/nginx/ebook.ikayama.com.access.log`
- Error log: `/var/log/nginx/ebook.ikayama.com.error.log`

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Process list
pm2 list

# Detailed info
pm2 show ikayama-backend
pm2 show ikayama-payment-gateway
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Test renewal
   sudo certbot renew --dry-run
   ```

2. **Nginx Configuration Issues**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Reload configuration
   sudo systemctl reload nginx
   ```

3. **Application Not Starting**
   ```bash
   # Check PM2 logs
   pm2 logs
   
   # Check application logs
   tail -f /var/www/ikayama_katalog/logs/backend-error.log
   ```

4. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test database connection
   psql -h localhost -U ikayama_user -d ikayama_db_prod
   ```

### Health Checks

1. **Application Health**
   ```bash
   curl -I https://ebook.ikayama.com
   ```

2. **SSL Certificate Health**
   ```bash
   openssl s_client -connect ebook.ikayama.com:443 -servername ebook.ikayama.com
   ```

## Backup and Recovery

### Database Backup
```bash
# Create backup
pg_dump -h localhost -U ikayama_user ikayama_db_prod > backup_$(date +%Y%m%d).sql

# Restore backup
psql -h localhost -U ikayama_user ikayama_db_prod < backup_20240101.sql
```

### Application Backup
```bash
# Backup application files
tar -czf ikayama_backup_$(date +%Y%m%d).tar.gz /var/www/ikayama_katalog
```

## Performance Optimization

### Nginx Optimization
- Gzip compression enabled
- Static file caching (1 year)
- HTTP/2 support
- Connection keep-alive

### PM2 Optimization
- Memory restart at 1GB (backend) / 512MB (payment)
- Automatic restart on crashes
- Log rotation

## Support

For deployment issues or questions:
1. Check application logs first
2. Verify Nginx and SSL configuration
3. Ensure all environment variables are set correctly
4. Check database connectivity

---

**Last Updated:** $(date)
**Version:** 1.0.0