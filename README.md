# Ikayama Katalog - Digital Book Platform

## 📖 Deskripsi Project

Ikayama Katalog adalah platform digital untuk katalog dan distribusi e-book dengan sistem donasi "pay what you want" (oyagema). Platform ini memungkinkan pengguna untuk mengakses koleksi buku digital dan memberikan donasi sesuai kemampuan mereka.

## 🏗️ Arsitektur System

### Frontend
- **HTML5** dengan Tailwind CSS untuk styling
- **Vanilla JavaScript** untuk interaktivitas
- **Responsive Design** untuk mobile dan desktop
- **Search functionality** untuk pencarian buku real-time

### Backend Services
1. **Main Backend** (Port 5011)
   - Node.js dengan Express.js
   - MySQL database dengan Sequelize ORM
   - API endpoints untuk manajemen buku dan download
   - Authentication dan authorization

2. **Payment Gateway (PVS_PG)** (Port 5012)
   - Microservice terpisah untuk payment processing
   - Integrasi dengan PVPG (Payment Gateway)
   - Handling payment callbacks dan redirects

### Infrastructure
- **Nginx** sebagai reverse proxy dan load balancer
- **PM2** untuk process management
- **SSL/TLS** dengan Let's Encrypt certificates
- **MySQL** database untuk data persistence

## 🚀 Teknologi Stack

### Frontend
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- Font Awesome icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Process Manager**: PM2
- **Web Server**: Nginx

### Payment Integration
- **PVPG** (Payment Gateway)
- **Crypto-JS** untuk signature generation
- **Axios** untuk HTTP requests

### DevOps & Deployment
- **PM2** ecosystem configuration
- **Nginx** reverse proxy
- **Let's Encrypt** SSL certificates
- **SSH** deployment

## 📁 Struktur Project

```
ikayama_katalog/
├── backend/                 # Main backend service
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── public/            # Static files
│   └── server.js          # Main server file
├── pvs_pg/                # Payment gateway service
│   ├── controllers/       # Payment controllers
│   ├── services/          # Payment services
│   ├── routes/           # Payment routes
│   ├── middlewares/      # Error handling
│   └── index.js          # Payment server
├── assets/               # Static assets
├── private/books/        # Protected book files
├── nginx.conf           # Nginx configuration
├── ecosystem.config.js  # PM2 configuration
├── deploy.sh           # Deployment script
├── index.html          # Main frontend file
├── script.js           # Frontend JavaScript
└── README.md           # This file
```

## 🔧 Fitur Utama

### 1. Katalog Buku Digital
- Tampilan grid responsif untuk koleksi buku
- Preview buku dengan pagination
- Informasi detail buku (judul, author, deskripsi)
- Thumbnail dan cover buku

### 2. Sistem Pencarian
- Real-time search berdasarkan judul, author, atau topik
- Filter dan sorting hasil pencarian
- Highlight hasil pencarian

### 3. Sistem Donasi (Oyagema)
- Konsep "pay what you want"
- Multiple pilihan nominal donasi
- Custom amount input
- Integrasi dengan payment gateway

### 4. Download Management
- Secure download links
- Email verification untuk download
- Download history tracking
- Rate limiting untuk download

### 5. Payment Integration
- PVPG payment gateway integration
- Multiple payment methods (QRIS, Bank Transfer, dll)
- Payment callback handling
- Transaction status tracking

## 🛠️ Setup Development

### Prerequisites
- Node.js (v14 atau lebih tinggi)
- MySQL (v8.0 atau lebih tinggi)
- PM2 (global installation)
- Nginx (untuk production)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd ikayama_katalog
```

2. **Install dependencies**
```bash
# Backend dependencies
cd backend
npm install

# Payment gateway dependencies
cd ../pvs_pg
npm install
```

3. **Database setup**
```bash
# Create database
mysql -u root -p
CREATE DATABASE ikayama_katalog;

# Run migrations
cd backend
npx sequelize-cli db:migrate

# Seed data
npx sequelize-cli db:seed:all
```

4. **Environment configuration**
```bash
# Backend environment
cp backend/.env.example backend/.env.production

# Payment gateway environment
cp pvs_pg/.env.example pvs_pg/.env.production
```

5. **Start development servers**
```bash
# Start backend
cd backend
npm run dev

# Start payment gateway
cd ../pvs_pg
npm run dev
```

## 🚀 Production Deployment

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan deployment lengkap.

### Quick Deploy
```bash
# Deploy to production server
./deploy.sh

# Or manual deployment
scp -r . root@your-server:/var/www/ikayama-ebook/
ssh root@your-server 'cd /var/www/ikayama-ebook && pm2 restart ecosystem.config.js'
```

## 📚 API Documentation

### Backend API Endpoints

#### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (admin)
- `PUT /api/books/:id` - Update book (admin)
- `DELETE /api/books/:id` - Delete book (admin)

#### Downloads
- `POST /api/download/request` - Request download link
- `GET /api/download/:token` - Download file with token
- `GET /api/download/history` - Get download history

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify token

### Payment Gateway API

#### Payment
- `POST /api/payment/create` - Create payment request
- `POST /api/payment/update` - Update payment status
- `POST /payment/callback` - Payment callback from PVPG
- `GET /payment/redirect` - Payment redirect handler

## 🔒 Security Features

- **SSL/TLS encryption** untuk semua komunikasi
- **Rate limiting** untuk API endpoints
- **Input validation** dan sanitization
- **Secure file download** dengan token-based access
- **Payment signature verification** untuk PVPG integration
- **CORS configuration** untuk cross-origin requests

## 🔧 Configuration

### Environment Variables

#### Backend (.env.production)
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=ikayama_katalog
JWT_SECRET=your_jwt_secret
PORT=5011
```

#### Payment Gateway (.env.production)
```env
PVPG_CLIENT_ID=your_pvpg_client_id
PVPG_SECRET_KEY=your_pvpg_secret_key
PVPG_URL=https://merchant-dev.pvpg.co.id:7977/api/v2.1/payment/create
PORT=5012
```

### Nginx Configuration
Lihat `nginx.conf` untuk konfigurasi reverse proxy lengkap.

### PM2 Configuration
Lihat `ecosystem.config.js` untuk konfigurasi process management.

## 🐛 Troubleshooting

### Common Issues

1. **Payment Gateway Error 500**
   - Periksa PVPG credentials di `.env.production`
   - Verifikasi koneksi ke PVPG API
   - Check payment gateway logs: `pm2 logs ikayama-ebook-payment-gateway`

2. **Database Connection Error**
   - Verifikasi MySQL service running
   - Check database credentials
   - Ensure database exists

3. **File Download Issues**
   - Check file permissions di `/private/books/`
   - Verify Nginx configuration untuk protected files
   - Check download token expiration

### Logs
```bash
# Check all PM2 logs
pm2 logs

# Check specific service logs
pm2 logs ikayama-ebook-backend
pm2 logs ikayama-ebook-payment-gateway

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Developer**: Ikayama Team
- **Payment Integration**: PVPG
- **Hosting**: VPS Server

## 🔗 Links

- **Live Site**: https://ebook.ikayama.com
- **Oyagema Concept**: https://oyagema.com
- **PVPG Documentation**: https://pvpg.co.id/docs

---

**Note**: Untuk informasi deployment lengkap, lihat [DEPLOYMENT.md](DEPLOYMENT.md)