# Email Service Configuration Guide

## Overview
This application supports multiple email service providers for sending download links to users. Follow the instructions below to configure your preferred email service.

## Supported Email Services

### 1. Gmail (Recommended)
**Steps to configure Gmail:**
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Update your `.env` file:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=your_email@gmail.com
```

### 2. Outlook/Hotmail
**Steps to configure Outlook:**
1. Use your regular Outlook credentials
2. Update your `.env` file:
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
EMAIL_FROM=your_email@outlook.com
```

### 3. Yahoo Mail
**Steps to configure Yahoo:**
1. Enable 2-factor authentication
2. Generate an App Password in Yahoo Account Security settings
3. Update your `.env` file:
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@yahoo.com
```

### 4. Custom SMTP Server
**For custom SMTP providers:**
```env
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@your-domain.com
EMAIL_PASS=your_password
EMAIL_FROM=your_email@your-domain.com
```

## Configuration Validation

The application will automatically validate your email configuration on startup. Check the console logs for:
- ✅ "Email transporter verified successfully" - Configuration is working
- ❌ "Email transporter verification failed" - Check your credentials

## Troubleshooting

### Common Issues:

1. **EAUTH Error (Authentication Failed)**
   - Double-check EMAIL_USER and EMAIL_PASS
   - For Gmail/Yahoo: Ensure you're using App Password, not regular password
   - For Outlook: Try enabling "Less secure app access"

2. **ECONNECTION Error (Connection Failed)**
   - Check EMAIL_SERVICE configuration
   - Verify firewall/network settings
   - For custom SMTP: Verify EMAIL_HOST and EMAIL_PORT

3. **ETIMEDOUT Error (Timeout)**
   - Server may be slow or overloaded
   - Try again later
   - Consider increasing timeout values

### Fallback Behavior
If email sending fails, the application will:
1. Log the error for debugging
2. Provide users with a direct download link
3. Continue normal operation without blocking the download process

## Testing Email Configuration

To test your email configuration:
1. Start the application
2. Check console logs for email verification status
3. Try downloading a book to test actual email sending
4. Monitor logs for any email-related errors

## Security Notes

- Never commit your actual `.env` file to version control
- Use App Passwords instead of regular passwords when available
- Keep your email credentials secure
- Regularly rotate your email passwords/app passwords