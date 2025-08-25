const { Book } = require('../models');
const { Op } = require('sequelize');

// Mendapatkan semua buku
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({ 
      success: true, 
      data: books 
    });
  } catch (error) {
    console.error('Error getting books:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data buku',
      error: error.message 
    });
  }
};

// Mendapatkan detail buku berdasarkan ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findOne({
      where: { id, isActive: true }
    });
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Buku tidak ditemukan' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: book 
    });
  } catch (error) {
    console.error('Error getting book:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil detail buku',
      error: error.message 
    });
  }
};

// Mencari buku berdasarkan kata kunci
exports.searchBooks = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kata kunci pencarian diperlukan' 
      });
    }
    
    const books = await Book.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword}%` } },
          { author: { [Op.iLike]: `%${keyword}%` } },
          { synopsis: { [Op.iLike]: `%${keyword}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({ 
      success: true, 
      data: books 
    });
  } catch (error) {
    console.error('Error searching books:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mencari buku',
      error: error.message 
    });
  }
};

// Mendapatkan buku berdasarkan tag/kategori
exports.getBooksByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    
    const books = await Book.findAll({
      where: {
        isActive: true,
        tags: { [Op.contains]: [tag] }
      },
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({ 
      success: true, 
      data: books 
    });
  } catch (error) {
    console.error('Error getting books by tag:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil buku berdasarkan tag',
      error: error.message 
    });
  }
};

// Admin: Tambah buku baru
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      synopsis,
      previewImage,
      language,
      pages,
      formats,
      fileSize,
      pdfPath,
      tags
    } = req.body;
    
    const newBook = await Book.create({
      title,
      author,
      synopsis: synopsis || '', // Make synopsis optional
      previewImage: previewImage || null,
      language,
      pages,
      formats: formats || ['PDF'], // Default to PDF only
      fileSize,
      pdfPath,
      epubPath: null, // No longer used
      tags: tags || [],
      features: [] // No longer used
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Buku berhasil ditambahkan',
      data: newBook 
    });
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal menambahkan buku',
      error: error.message 
    });
  }
};

// Admin: Edit buku
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const book = await Book.findByPk(id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Buku tidak ditemukan' 
      });
    }
    
    await book.update(updateData);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Buku berhasil diperbarui',
      data: book 
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal memperbarui buku',
      error: error.message 
    });
  }
};

// Admin: Hapus buku
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findByPk(id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Buku tidak ditemukan' 
      });
    }
    
    await book.update({ isActive: false });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Buku berhasil dihapus' 
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus buku',
      error: error.message 
    });
  }
};

// Update download count untuk direct download
exports.updateDownloadCount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findOne({
      where: { id, isActive: true }
    });
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Buku tidak ditemukan' 
      });
    }
    
    // Update jumlah unduhan pada buku
    await book.increment('downloadCount');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Download count berhasil diupdate' 
    });
  } catch (error) {
    console.error('Error updating download count:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengupdate download count',
      error: error.message 
    });
  }
};