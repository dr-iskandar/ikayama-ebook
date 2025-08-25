const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }
    
    // Cari user berdasarkan email
    const user = await User.findOne({
      where: {
        email: email,
        isActive: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }
    
    // Verifikasi password
    const isValidPassword = await user.checkPassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }
    
    // Update last login
    await user.update({ lastLogin: new Date() });
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'ikayama-secret-key',
      { expiresIn: '24h' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan login',
      error: error.message
    });
  }
};

// Register admin (hanya untuk development)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password diperlukan'
      });
    }
    
    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }
    
    // Buat user admin baru
    const newAdmin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });
    
    return res.status(201).json({
      success: true,
      message: 'Admin berhasil didaftarkan',
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Register admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mendaftarkan admin',
      error: error.message
    });
  }
};

// Validate token
exports.validateToken = async (req, res) => {
  try {
    // User sudah di-verify oleh middleware authenticate
    return res.status(200).json({
      success: true,
      message: 'Token valid',
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Validate token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memvalidasi token',
      error: error.message
    });
  }
};