const express = require('express');
const cors = require('cors');
const path = require('path');
const { syncDatabase } = require('./models');
require('dotenv').config();

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
  console.log(`Server berjalan di port ${PORT}`);
  
  // Sinkronisasi database
  await syncDatabase();
});

module.exports = app;