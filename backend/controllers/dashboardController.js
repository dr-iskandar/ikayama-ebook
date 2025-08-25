const { Book, Download, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Mendapatkan statistik dashboard
exports.getStats = async (req, res) => {
  try {
    const totalBooks = await Book.count({ where: { isActive: true } });
    const totalDownloads = await Download.count();
    const totalUsers = await User.count({ where: { isActive: true } });
    
    // Mengambil total donasi
    const donationStats = await Download.sum('donation');
    
    // Mendapatkan buku dengan unduhan terbanyak
    const topBooks = await Book.findAll({
      where: { isActive: true },
      order: [['downloadCount', 'DESC']],
      limit: 5
    });
    
    // Mendapatkan unduhan terbaru
    const recentDownloads = await Download.findAll({
      include: [
        { model: Book, attributes: ['title'] },
        { model: User, attributes: ['email'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalDownloads,
        totalUsers,
        totalDonation: donationStats || 0,
        topBooks,
        recentDownloads
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik dashboard',
      error: error.message
    });
  }
};

// Mendapatkan data untuk laporan
exports.getReport = async (req, res) => {
  try {
    const { startDate, endDate, bookId } = req.query;
    
    // Buat filter waktu
    let timeWhere = {};
    if (startDate && endDate) {
      timeWhere = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else if (startDate) {
      timeWhere = {
        createdAt: {
          [Op.gte]: new Date(startDate)
        }
      };
    } else if (endDate) {
      timeWhere = {
        createdAt: {
          [Op.lte]: new Date(endDate)
        }
      };
    }
    
    // Buat filter buku
    let bookWhere = {};
    if (bookId) {
      bookWhere = { bookId };
    }
    
    // Gabungkan filter
    const whereClause = {
      ...timeWhere,
      ...bookWhere
    };
    
    // Ambil data download
    const downloads = await Download.findAll({
      where: whereClause,
      include: [
        { model: Book, attributes: ['id', 'title'] },
        { model: User, attributes: ['email'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Hitung total donasi
    const totalDonation = await Download.sum('donation', { where: whereClause });
    
    return res.status(200).json({
      success: true,
      data: {
        downloads,
        totalDonation: totalDonation || 0,
        totalCount: downloads.length
      }
    });
  } catch (error) {
    console.error('Report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data laporan',
      error: error.message
    });
  }
};