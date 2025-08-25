const { sequelize, Book, Download } = require('../models');

const books = [
  {
    title: 'Alphabet Wisdom: Leadership Lessons from A to Z',
    author: 'PY',
    synopsis: 'This book is a comprehensive guide to leadership, exploring essential qualities and practices through the lens of the alphabet. Each chapter focuses on a specific letter, providing insights, practical examples, and moral messages to guide leaders towards growth, empathy, and success.',
    previewImage: 'alphabet_wisdom.png',
    language: 'English',
    pages: 50,
    formats: ['PDF', 'EPUB'],
    fileSize: '2.8 MB',
    pdfPath: 'uploads/books/alphabet_wisdom.pdf',
    epubPath: 'uploads/books/alphabet_wisdom.epub',
    tags: ['Leadership', 'Self Improvement'],
    features: [
      'Leadership principles from A to Z',
      'Practical examples',
      'Moral messages',
      'Growth strategies'
    ]
  },
  {
    title: 'Navigating Blindspots In Young Leaders',
    author: 'PY',
    synopsis: 'This book aims to help young leaders identify and navigate ethical blind spots that can hinder their effectiveness. It provides practical strategies, real-life examples, and moral messages to foster ethical leadership, personal growth, and a deep sense of purpose. It covers common blind spots like overconfidence, lack of ethics, and lack of spirituality.',
    previewImage: 'blindspots.png',
    language: 'English',
    pages: 26,
    formats: ['PDF', 'EPUB'],
    fileSize: '2.3 MB',
    pdfPath: 'uploads/books/blindspots.pdf',
    epubPath: 'uploads/books/blindspots.epub',
    tags: ['Leadership', 'Ethics'],
    features: [
      'Ethical leadership strategies',
      'Real-life examples',
      'Moral messages',
      'Personal growth guidance'
    ]
  },
  {
    title: 'Embracing Change: Wisdom, Growth, and Harmony',
    author: 'PY',
    synopsis: 'This book offers reflections, insights, and practical advice on navigating life\'s journey with an open heart and mind. It explores how to find balance, cultivate positivity, and build a better future by embracing change. From the wisdom of nature to the power of technology, it aims to guide readers towards personal growth and a deeper connection with the world.',
    previewImage: 'embracing_change.png',
    language: 'English',
    pages: 26,
    formats: ['PDF', 'EPUB'],
    fileSize: '1.8 MB',
    pdfPath: 'uploads/books/embracing_change.pdf',
    epubPath: 'uploads/books/embracing_change.epub',
    tags: ['Personal Growth', 'Change Management'],
    features: [
      'Practical advice',
      'Life reflections',
      'Positive mindset strategies',
      'Personal growth guidance'
    ]
  },
  {
    title: 'Cahaya Hati',
    author: 'PY',
    synopsis: 'This book is a guide to finding happiness and peace through reflection and wisdom. It combines concepts of patience, love, self-control, and wisdom to offer practical ways to manage daily challenges. By exploring these principles, readers can find inner peace and authentic joy.',
    previewImage: 'cahaya_hati.png',
    language: 'Indonesian',
    pages: 28,
    formats: ['PDF', 'EPUB'],
    fileSize: '1.9 MB',
    pdfPath: 'uploads/books/cahaya_hati.pdf',
    epubPath: 'uploads/books/cahaya_hati.epub',
    tags: ['Spirituality', 'Mindfulness'],
    features: [
      'Refleksi kehidupan',
      'Panduan praktis',
      'Konsep kebijaksanaan',
      'Manajemen tantangan'
    ]
  },
  {
    title: 'Keseimbangan & Kebijaksanaan',
    author: 'PY',
    synopsis: 'This book explores the importance of balance and wisdom in life. It covers various aspects of life, from personal growth to ethical leadership, and offers practical strategies for finding balance, making wise choices, and embracing change. The goal is to help readers navigate the complexities of life with greater clarity and purpose.',
    previewImage: 'keseimbangan_kebijaksanaan.png',
    language: 'Indonesian',
    pages: 19,
    formats: ['PDF', 'EPUB'],
    fileSize: '1.7 MB',
    pdfPath: 'uploads/books/keseimbangan_kebijaksanaan.pdf',
    epubPath: 'uploads/books/keseimbangan_kebijaksanaan.epub',
    tags: ['Balance', 'Wisdom'],
    features: [
      'Strategi keseimbangan',
      'Kepemimpinan etis',
      'Panduan praktis',
      'Pengembangan diri'
    ]
  },
  {
    title: 'Renungan Kehidupan dan Penderitaan',
    author: 'PY',
    synopsis: 'This book is designed to guide individuals seeking meaning in life. It explores the interplay of life and suffering, promoting growth through integrity and compassion. This work is meant to provide readers with inspiration, peace, and a deeper understanding of their personal journeys.',
    previewImage: 'renungan_kehidupan.png',
    language: 'Indonesian',
    pages: 25,
    formats: ['PDF', 'EPUB'],
    fileSize: '1.7 MB',
    pdfPath: 'uploads/books/renungan_kehidupan.pdf',
    epubPath: 'uploads/books/renungan_kehidupan.epub',
    tags: ['Meaning', 'Spirituality'],
    features: [
      'Panduan pencarian makna',
      'Refleksi kehidupan',
      'Pengembangan integritas',
      'Inspirasi kehidupan'
    ]
  }
];

async function seedBooks() {
  try {
    // Sinkronisasi database
    await sequelize.sync();
    
    // Hapus data dari tabel Downloads terlebih dahulu (karena ada foreign key constraint)
    await Download.destroy({ where: {}, truncate: { cascade: true } });
    
    // Hapus semua data buku yang ada
    await Book.destroy({ where: {} });
    
    // Masukkan data buku baru
    await Book.bulkCreate(books);
    
    console.log('Database telah diisi dengan data buku');
    process.exit(0);
  } catch (error) {
    console.error('Terjadi kesalahan saat mengisi database:', error);
    process.exit(1);
  }
}

// Jalankan seeder
seedBooks();