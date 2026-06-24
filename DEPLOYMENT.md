# Production Deployment Guide

## Update Summary (Latest Commit: 423a79b)

### Changes Made:

#### 1. Payment System Fixes
- **Added PVS_PG_URL configuration** to `backend/.env.production`
- **Fixed payment endpoint proxy** configuration in `backend/routes/paymentRoutes.js`
- **Added mock response** for PVS_PG service in `pvs_pg/services/payment.service.js`
- **Improved error handling** in payment routes with better timeout management

#### 2. Email Configuration
- **Added comprehensive email setup** documentation in `backend/EMAIL_SETUP.md`
- **Updated email configuration** with support for multiple providers (Gmail, Outlook, Yahoo, Custom SMTP)
- **Enhanced email error handling** in download controller

#### 3. Environment Configuration
- **Created `.env.example`** with complete documentation of all required environment variables
- **Updated `.env.production`** with PVS_PG_URL configuration
- **Added detailed comments** for email setup requirements

#### 4. Dependencies and Server Updates
- **Updated package dependencies** in `backend/package.json` and `backend/package-lock.json`
- **Enhanced server configuration** in `backend/server.js`
- **Improved frontend script** in `backend/public/script.js`

## Deployment Instructions

### 1. Server Requirements
- Node.js 18+ 
- PostgreSQL database
- PVS_PG service running on port 8995
- Email service credentials (Gmail App Password recommended)

### 2. Environment Setup
1. Copy `backend/.env.example` to `backend/.env.production`
2. Update all placeholder values with actual production credentials:
   - Database connection details
   - JWT secret (use strong, unique secret)
   - Email service credentials
   - Base URL for production domain

### 3. Database Setup
1. Create production database: `ikayama_db_prod`
2. Create database user with appropriate permissions
3. Run database migrations if any

### 4. Service Dependencies
1. Ensure PVS_PG service is running on port 8995
2. Verify database connectivity
3. Test email service configuration

### 5. Application Deployment
1. Pull latest changes: `git pull ikayama-ebook main`
2. Install dependencies: `npm install`
3. Set environment: `NODE_ENV=production`
4. Start application: `npm start`
5. Verify services on port 5011

### 6. Post-Deployment Verification
1. Test payment endpoint: `POST /payment/create`
2. Test email functionality: Download any ebook
3. Verify database connections
4. Check application logs for errors

## Configuration Files Updated

- `backend/.env.production` - Production environment variables
- `backend/.env.example` - Environment variables documentation
- `backend/routes/paymentRoutes.js` - Payment proxy configuration
- `backend/controllers/downloadController.js` - Email handling improvements
- `backend/server.js` - Server configuration updates
- `pvs_pg/services/payment.service.js` - Mock payment responses
- `backend/EMAIL_SETUP.md` - Email configuration guide

## Important Notes

1. **Security**: Ensure all production secrets are properly configured and not using default values
2. **Email**: Gmail requires App Password with 2FA enabled
3. **Payment**: PVS_PG service must be running and accessible
4. **Database**: Use separate production database with proper backup strategy
5. **Monitoring**: Monitor application logs for any errors after deployment

## Rollback Plan

If issues occur, rollback to previous commit:
```bash
git revert 423a79b
git push ikayama-ebook main
```

## Support

For deployment issues, check:
1. Application logs
2. Database connectivity
3. Email service status
4. PVS_PG service availability
5. Environment variable configuration