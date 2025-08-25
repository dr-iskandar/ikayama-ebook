const express = require('express');
const cors = require('cors');
const path = require('path');
const { syncDatabase } = require('./models');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: envFile });

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Inisialisasi express app
const app = express();
const PORT = process.env.PORT || 8510;

// Konfigurasi CORS yang lebih spesifik
const corsOptions = {
  origin: '*', // Izinkan semua origin (dalam produksi, seharusnya lebih spesifik)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Log request body for payment and email related endpoints
  if (url.includes('/payment') || url.includes('/download') || url.includes('/email')) {
    console.log(`[${timestamp}] Request Headers:`, JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
      // Mask sensitive data
      const logBody = { ...req.body };
      if (logBody.email) {
        logBody.email = logBody.email.replace(/(.{2}).*(@.*)/, '$1***$2');
      }
      console.log(`[${timestamp}] Request Body:`, JSON.stringify(logBody, null, 2));
    }
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    console.log(`[${timestamp}] ${method} ${url} - Status: ${res.statusCode} - Response Time: ${responseTime}ms`);
    
    // Log response for payment and email endpoints
    if (url.includes('/payment') || url.includes('/download') || url.includes('/email')) {
      try {
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log(`[${timestamp}] Response:`, JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log(`[${timestamp}] Response (raw):`, data);
      }
    }
    
    originalSend.call(this, data);
  };
  
  req.startTime = Date.now();
  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint untuk pengujian CORS
app.options('*', cors(corsOptions));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/books', bookRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/payment', paymentRoutes);

// Admin routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 404 Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route tidak ditemukan'
  });
});

// Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Jalankan server
app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log('🚀 IKAYAMA KATALOG SERVER STARTING');
  console.log('='.repeat(50));
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email Service: ${process.env.EMAIL_SERVICE || 'Not configured'}`);
  
  if (process.env.EMAIL_SERVICE) {
    console.log(`📮 Email User: ${process.env.EMAIL_USER || 'Not configured'}`);
    console.log(`📤 Email From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Not configured'}`);
    
    if (process.env.EMAIL_SERVICE === 'custom') {
      console.log(`🔧 SMTP Host: ${process.env.EMAIL_HOST || 'Not configured'}`);
      console.log(`🔧 SMTP Port: ${process.env.EMAIL_PORT || 'Not configured'}`);
      console.log(`🔒 SMTP Secure: ${process.env.EMAIL_SECURE || 'false'}`);
    }
  } else {
    console.log('⚠️  Email service not configured - emails will not be sent');
  }
  
  console.log(`💾 Database: ${process.env.DB_NAME || 'ikayama_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
  console.log(`🌐 Base URL: ${process.env.BASE_URL || 'http://localhost:8510'}`);
  
  console.log('\n📊 Starting database synchronization...');
  
  try {
    // Sinkronisasi database
    await syncDatabase();
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
  }
  
  console.log('\n🎯 Available endpoints:');
  console.log('   📚 Books API: /api/books');
  console.log('   📥 Downloads API: /api/downloads');
  console.log('   🔐 Auth API: /api/auth');
  console.log('   📊 Dashboard API: /api/dashboard');
  console.log('   📤 Upload API: /api/upload');
  console.log('   💳 Payment API: /payment');
  console.log('   🏠 Frontend: /');
  console.log('   👨‍💼 Admin: /admin');
  
  console.log('\n✨ Server ready to accept connections!');
  console.log('='.repeat(50));
});

module.exports = app;