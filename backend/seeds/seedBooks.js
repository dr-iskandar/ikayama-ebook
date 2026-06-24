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
  },
  {
    title: 'The Wide Way',
    author: 'PY',
    synopsis: 'A Journey of Love, Integrity, and Vision" is a compelling exploration of transformative leadership in the modern world. Written as a tribute to Pak Pardjo, this book showcases how visionary leadership rooted in compassion, integrity, and humanity can inspire teams, overcome crises, and build a thriving organizational culture.',
    previewImage: 'assets/images/preview/wide_way.png',
    language: 'English',
    pages: 25,
    formats: ['PDF', 'EPUB'],
    fileSize: '1.7 MB',
    pdfPath: 'uploads/books/wide_way.pdf',
    epubPath: 'uploads/books/wide_way.epub',
    tags: ['Leadership', 'Compassionate Culture'],
    features: [
      'Visionary Leadership',
      'Compassionate Culture',
      'Conflict Resolution with Wisdom',
      'Legacy of Kindness'
    ]
  },
  {
    title: 'Soul Of Beauty and Fashion',
    author: 'PY',
    synopsis: '"The Soul of Beauty and Fashion" is an inspiring journey that celebrates the transformative power of fashion, creativity, and unwavering love. Written as a tribute to a daughter\'s dreams, this book showcases the beautiful intersection of personal growth, artistic expression, and the enduring bond between parent and child. It offers readers a heartfelt narrative interwoven with original fashion designs, life lessons, and motivational insights.',
    previewImage: 'assets/images/preview/soul_of_beauty_and_fashion.png',
    language: 'English',
    pages: 25,
    formats: ['PDF', 'EPUB'],
    fileSize: '1.7 MB',
    pdfPath: 'uploads/books/soul_of_beauty_and_fashion.pdf',
    epubPath: 'uploads/books/soul_of_beauty_and_fashion.epub',
    tags: ['Inspirational Story', 'Legacy & Social Impact'],
    features: [
      'Inspirational Story',
      'Original Fashion Designs',
      'Philosophy of Beauty & Fashion',
      'Resilience & Motivation'
    ]
  },
  {
    title: 'Compassionate Economy',
    author: 'PY',
    synopsis: '"Compassionate Economy" explores how economic systems can be redesigned to prioritize human well-being, environmental sustainability, and social justice. This book presents a framework for integrating compassion into business practices, policy-making, and global economic structures. It offers practical strategies for leaders, entrepreneurs, and citizens to build a more equitable and sustainable economic future.',
    previewImage: 'uploads/covers/compassionate_economy_1755947716943-228709365.png',
    language: 'English',
    pages: 34,
    formats: ['PDF'],
    fileSize: '0.52 MB',
    pdfPath: 'uploads/books/compassionate_economy_1755947716950-904745537.pdf',
    epubPath: '',
    tags: ['Leadership', 'Personal Growth', 'Mindfulness'],
    features: [
      'Sustainable business models',
      'Economic ethics',
      'Social impact strategies',
      'Compassionate leadership'
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