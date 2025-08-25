const { sequelize, User } = require('../models');
require('dotenv').config();

const adminUsers = [
  {
    name: 'Admin',
    email: 'admin@ikayama.com',
    password: 'admin123', // Ini akan di-hash oleh hook di model User
    role: 'admin',
    isActive: true
  }
];

async function seedAdmins() {
  try {
    // Sinkronisasi database
    await sequelize.sync();
    
    // Cek apakah sudah ada admin
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('Admin user sudah ada, tidak perlu membuat lagi');
      process.exit(0);
    }
    
    // Masukkan data admin baru
    await User.create(adminUsers[0]);
    
    console.log('Database telah diisi dengan data admin');
    console.log('Login dengan:');
    console.log('Email: admin@ikayama.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Terjadi kesalahan saat mengisi database:', error);
    process.exit(1);
  }
}

// Jalankan seeder
seedAdmins();