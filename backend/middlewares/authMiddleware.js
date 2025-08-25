const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

exports.authenticate = async (req, res, next) => {
  try {
    // Ambil token dari header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak tersedia'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cari user berdasarkan id dari token
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. User tidak ditemukan'
      });
    }
    
    // Tambahkan user ke request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak valid'
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    // Pastikan user telah diautentikasi
    await exports.authenticate(req, res, async () => {
      // Cek role user
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Hanya admin yang dapat mengakses'
        });
      }
      
      next();
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak'
    });
  }
}; 