const { Download, Book, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Membuat link unduhan
exports.createDownloadLink = async (req, res) => {
  try {
    const { bookId, email, format, donation = 0 } = req.body;
    
    if (!bookId || !email || !format) {
      return res.status(400).json({
        success: false,
        message: 'BookId, email, dan format diperlukan'
      });
    }
    
    // Validasi buku
    const book = await Book.findOne({
      where: { id: bookId, isActive: true }
    });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Buku tidak ditemukan'
      });
    }
    
    // Cek format
    if (!book.formats.includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format tidak tersedia untuk buku ini'
      });
    }
    
    // Cari user jika ada
    const user = await User.findOne({ where: { email } });
    
    // Buat token unik
    const downloadToken = uuidv4();
    
    // Tentukan expiry date (24 jam)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Buat link unduhan
    const downloadLink = `/api/downloads/download/${downloadToken}`;
    
    // Simpan ke database
    const download = await Download.create({
      bookId,
      userId: user ? user.id : null,
      email,
      downloadLink,
      downloadToken,
      expiresAt,
      format,
      donation: parseInt(donation),
      ipAddress: req.ip
    });
    
    // Skip email sending for now - return download link directly
    // await sendDownloadEmail(email, downloadLink, book.title, format);
    
    return res.status(201).json({
      success: true,
      message: 'Link unduhan berhasil dibuat',
      data: {
        email,
        downloadLink: `${process.env.BASE_URL}${downloadLink}`,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating download link:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat link unduhan',
      error: error.message
    });
  }
};

// Proses unduhan
exports.processDownload = async (req, res) => {
  try {
    const { token } = req.params;
    
    const download = await Download.findOne({
      where: { downloadToken: token },
      include: [{ model: Book }]
    });
    
    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Link unduhan tidak valid atau telah kadaluarsa'
      });
    }
    
    // Cek apakah sudah expired
    if (new Date() > new Date(download.expiresAt)) {
      return res.status(410).json({
        success: false,
        message: 'Link unduhan telah kadaluarsa'
      });
    }
    
    const { Book: book, format } = download;
    let filePath;
    
    if (format === 'PDF') {
      filePath = book.pdfPath;
    } else if (format === 'EPUB') {
      filePath = book.epubPath;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Format file tidak didukung'
      });
    }
    
    // Update record unduhan
    await download.update({
      downloadedAt: new Date()
    });
    
    // Update jumlah unduhan pada buku
    await book.increment('downloadCount');
    
    // Kirim file dengan path absolut
    const path = require('path');
    const absolutePath = path.join(__dirname, '..', 'public', filePath);
    
    // Set headers untuk direct download
    res.setHeader('Content-Disposition', `attachment; filename="${book.title}.${format.toLowerCase()}"`); 
    res.setHeader('Content-Type', format === 'PDF' ? 'application/pdf' : 'application/epub+zip');
    
    res.download(absolutePath, `${book.title}.${format.toLowerCase()}`, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          return res.status(404).json({
            success: false,
            message: 'File tidak ditemukan'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error processing download:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses unduhan',
      error: error.message
    });
  }
};

// Resend download link
exports.resendDownloadLink = async (req, res) => {
  try {
    const { email, bookId } = req.body;
    
    if (!email || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'Email dan bookId diperlukan'
      });
    }
    
    // Cari download terbaru untuk email dan buku ini
    const download = await Download.findOne({
      where: { email, bookId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Book }]
    });
    
    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada unduhan yang ditemukan untuk email dan buku ini'
      });
    }
    
    // Kirim ulang email
    try {
      const emailResult = await sendDownloadEmail(
        email, 
        download.downloadLink, 
        download.Book.title, 
        download.format
      );
      
      if (emailResult && emailResult.success) {
        return res.status(200).json({
          success: true,
          message: 'Link unduhan telah dikirim ulang ke email',
          emailSent: true
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Link unduhan tersedia, namun email tidak dapat dikirim. Silakan gunakan link langsung.',
          emailSent: false,
          downloadLink: `${process.env.BASE_URL || 'http://localhost:3000'}${download.downloadLink}`
        });
      }
    } catch (emailError) {
      console.warn('Email sending failed, providing direct link:', emailError.message);
      return res.status(200).json({
        success: true,
        message: 'Link unduhan tersedia, namun email tidak dapat dikirim. Silakan gunakan link langsung.',
        emailSent: false,
        downloadLink: `${process.env.BASE_URL || 'http://localhost:3000'}${download.downloadLink}`
      });
    }
  } catch (error) {
    console.error('Error resending download link:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim ulang link unduhan',
      error: error.message
    });
  }
};

// Mendapatkan riwayat unduhan oleh email
exports.getDownloadHistory = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email diperlukan'
      });
    }
    
    const downloads = await Download.findAll({
      where: { email },
      include: [
        { 
          model: Book,
          attributes: ['id', 'title', 'author', 'previewImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: downloads
    });
  } catch (error) {
    console.error('Error getting download history:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan riwayat unduhan',
      error: error.message
    });
  }
};

// Admin: Mendapatkan statistik unduhan
exports.getDownloadStats = async (req, res) => {
  try {
    const totalDownloads = await Download.count({
      where: { downloadedAt: { [Op.ne]: null } }
    });
    
    const totalDonation = await Download.sum('donation');
    
    const topBooks = await Download.findAll({
      attributes: [
        'bookId',
        [sequelize.fn('COUNT', sequelize.col('*')), 'downloadCount'],
        [sequelize.fn('SUM', sequelize.col('donation')), 'totalDonation']
      ],
      where: { downloadedAt: { [Op.ne]: null } },
      include: [
        {
          model: Book,
          attributes: ['title', 'author']
        }
      ],
      group: ['bookId', 'Book.id'],
      order: [[sequelize.literal('downloadCount'), 'DESC']],
      limit: 5
    });
    
    return res.status(200).json({
      success: true,
      data: {
        totalDownloads,
        totalDonation,
        topBooks
      }
    });
  } catch (error) {
    console.error('Error getting download statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan statistik unduhan',
      error: error.message
    });
  }
};

// Helper function untuk mengirim email unduhan
async function sendDownloadEmail(to, downloadLink, bookTitle, format) {
  try {
    // Validasi environment variables
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email service not configured, skipping email sending');
      return { success: false, message: 'Email service not configured' };
    }

    console.log(`Attempting to send email to: ${to} for book: ${bookTitle}`);
    
    let transporterConfig;
    
    // Configure transporter based on email service
    if (process.env.EMAIL_SERVICE === 'custom') {
      // Custom SMTP configuration
      transporterConfig = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      };
    } else {
      // Predefined service configuration (gmail, hotmail, yahoo, etc.)
      transporterConfig = {
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      };
    }
    
    console.log(`Using email service: ${process.env.EMAIL_SERVICE}`);
    if (process.env.EMAIL_SERVICE === 'custom') {
      console.log(`SMTP Host: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
    }
    
    const transporter = nodemailer.createTransport(transporterConfig);
    
    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      throw new Error('Email service configuration error');
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: `Link Unduhan ${bookTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Link Unduhan untuk ${bookTitle}</h2>
          <p>Terima kasih telah mengunduh buku kami. Berikut adalah link untuk mengunduh buku dalam format ${format}:</p>
          <p><a href="${process.env.BASE_URL || 'http://localhost:3000'}${downloadLink}" style="display: inline-block; background: #C8A2C8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Unduh Buku</a></p>
          <p>Link ini akan kadaluarsa dalam 24 jam.</p>
          <p>Jika Anda memiliki pertanyaan, silakan hubungi kami di ${process.env.EMAIL_FROM || process.env.EMAIL_USER}.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Email ini dikirim otomatis. Mohon jangan membalas email ini.</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Detailed error logging
    if (error.code === 'EAUTH') {
      console.error('Email authentication failed - check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION') {
      console.error('Email connection failed - check EMAIL_SERVICE configuration');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Email sending timed out - server may be slow');
    }
    
    throw new Error(`Gagal mengirim email: ${error.message}`);
  }
}