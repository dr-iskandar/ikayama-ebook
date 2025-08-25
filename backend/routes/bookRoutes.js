const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { isAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/tag/:tag', bookController.getBooksByTag);
router.get('/:id', bookController.getBookById);
router.post('/:id/download', bookController.updateDownloadCount);

// Admin routes
router.post('/', isAdmin, bookController.createBook);
router.delete('/bulk-delete', isAdmin, bookController.bulkDeleteBooks);
router.put('/:id', isAdmin, bookController.updateBook);
router.delete('/:id', isAdmin, bookController.deleteBook);

module.exports = router;