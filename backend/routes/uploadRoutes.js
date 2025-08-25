const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const router = express.Router();
const { isAdmin } = require('../middlewares/authMiddleware');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Create upload directories
ensureDirectoryExists(path.join(__dirname, '../public/uploads/books'));
ensureDirectoryExists(path.join(__dirname, '../public/uploads/covers'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath;
        
        if (file.fieldname === 'coverImage') {
            uploadPath = path.join(__dirname, '../public/uploads/covers');
        } else if (file.fieldname === 'pdfFile' || file.fieldname === 'epubFile') {
            uploadPath = path.join(__dirname, '../public/uploads/books');
        } else {
            uploadPath = path.join(__dirname, '../public/uploads');
        }
        
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase();
        
        cb(null, name + '_' + uniqueSuffix + ext);
    }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
        // Allow only image files for cover
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Cover harus berupa file gambar (JPG, PNG, GIF, dll.)'), false);
        }
    } else if (file.fieldname === 'pdfFile') {
        // Allow only PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('File PDF harus berformat PDF'), false);
        }
    } else if (file.fieldname === 'epubFile') {
        // Allow EPUB files
        if (file.mimetype === 'application/epub+zip' || file.originalname.toLowerCase().endsWith('.epub')) {
            cb(null, true);
        } else {
            cb(new Error('File EPUB harus berformat EPUB'), false);
        }
    } else {
        cb(new Error('Field file tidak dikenali'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Upload cover image
router.post('/cover', isAdmin, upload.single('coverImage'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada file cover yang diupload'
            });
        }

        const relativePath = `uploads/covers/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Cover berhasil diupload',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: relativePath,
                size: req.file.size,
                url: `/${relativePath}`
            }
        });
    } catch (error) {
        console.error('Error uploading cover:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengupload cover'
        });
    }
});

// Upload PDF file
router.post('/pdf', isAdmin, upload.single('pdfFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada file PDF yang diupload'
            });
        }

        const relativePath = `uploads/books/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'File PDF berhasil diupload',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: relativePath,
                size: req.file.size,
                url: `/${relativePath}`
            }
        });
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengupload PDF'
        });
    }
});

// Get PDF info (page count)
router.post('/pdf-info', isAdmin, upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada file PDF yang diupload'
            });
        }

        // Read PDF file and get page count
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(pdfBuffer);
        
        const relativePath = `uploads/books/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Informasi PDF berhasil didapat',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: relativePath,
                size: req.file.size,
                url: `/${relativePath}`,
                pageCount: pdfData.numpages
            }
        });
    } catch (error) {
        console.error('Error getting PDF info:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat membaca informasi PDF'
        });
    }
});

// Upload multiple files (cover + PDF + EPUB)
router.post('/book-files', isAdmin, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'epubFile', maxCount: 1 }
]), (req, res) => {
    try {
        const uploadedFiles = {};
        
        if (req.files.coverImage) {
            const coverFile = req.files.coverImage[0];
            uploadedFiles.cover = {
                filename: coverFile.filename,
                originalName: coverFile.originalname,
                path: `uploads/covers/${coverFile.filename}`,
                size: coverFile.size,
                url: `/uploads/covers/${coverFile.filename}`
            };
        }
        
        if (req.files.pdfFile) {
            const pdfFile = req.files.pdfFile[0];
            uploadedFiles.pdf = {
                filename: pdfFile.filename,
                originalName: pdfFile.originalname,
                path: `uploads/books/${pdfFile.filename}`,
                size: pdfFile.size,
                url: `/uploads/books/${pdfFile.filename}`
            };
        }
        
        if (req.files.epubFile) {
            const epubFile = req.files.epubFile[0];
            uploadedFiles.epub = {
                filename: epubFile.filename,
                originalName: epubFile.originalname,
                path: `uploads/books/${epubFile.filename}`,
                size: epubFile.size,
                url: `/uploads/books/${epubFile.filename}`
            };
        }
        
        res.json({
            success: true,
            message: 'File berhasil diupload',
            data: uploadedFiles
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengupload file'
        });
    }
});

// Error handling middleware
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Ukuran file terlalu besar. Maksimal 50MB.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Field file tidak dikenali atau terlalu banyak file.'
            });
        }
    }
    
    res.status(400).json({
        success: false,
        message: error.message || 'Terjadi kesalahan saat mengupload file'
    });
});

module.exports = router;