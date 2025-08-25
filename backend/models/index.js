const sequelize = require('../config/database');
const Book = require('./Book');
const User = require('./User');
const Download = require('./Download');

// Definisikan relasi
Book.hasMany(Download, { foreignKey: 'bookId' });
User.hasMany(Download, { foreignKey: 'userId' });

// Fungsi sinkronisasi database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Failed to synchronize database:', error);
  }
};

module.exports = {
  sequelize,
  Book,
  User,
  Download,
  syncDatabase
};