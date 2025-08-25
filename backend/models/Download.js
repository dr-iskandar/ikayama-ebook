const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Book = require('./Book');
const User = require('./User');

const Download = sequelize.define('Download', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Book,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  downloadLink: {
    type: DataTypes.STRING,
    allowNull: false
  },
  downloadToken: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  downloadedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false
  },
  donation: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

// Hubungan dengan Book dan User
Download.belongsTo(Book, { foreignKey: 'bookId' });
Download.belongsTo(User, { foreignKey: 'userId' });

module.exports = Download; 