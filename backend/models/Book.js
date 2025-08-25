const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  previewImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pages: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  formats: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['PDF', 'EPUB']
  },
  fileSize: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  epubPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Book;