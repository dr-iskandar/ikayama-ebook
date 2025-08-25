# Ikayama Ebooks Store

Aplikasi web dinamis untuk toko ebooks dengan fitur donasi dan pengunduhan.

## Fitur

- Katalog buku dinamis dari database PostgreSQL
- Preview buku sebelum mengunduh
- Donasi dengan jumlah sesuai keinginan
- Pengiriman link unduhan melalui email
- Riwayat unduhan untuk pengguna
- Panel admin untuk mengelola buku

## Teknologi yang Digunakan

- **Frontend**: HTML, CSS (TailwindCSS), JavaScript
- **Backend**: Node.js dengan Express
- **Database**: PostgreSQL dengan Sequelize ORM
- **Email**: Nodemailer

## Cara Menjalankan Aplikasi

### Prasyarat

- Node.js (v14 atau lebih baru)
- PostgreSQL (v12 atau lebih baru)
- NPM atau Yarn

### Langkah-langkah Instalasi

1. Clone repositori ini:
   ```
   git clone https://github.com/username/ikayama-ebooks.git
   cd ikayama-ebooks
   ```

2. Instal dependensi backend:
   ```
   cd backend
   npm install
   ```

3. Konfigurasi environment:
   - Salin file `.env.example` menjadi `.env`
   - Sesuaikan konfigurasi database dan email

4. Buat database PostgreSQL:
   ```
   createdb ikayama_db
   ```

5. Jalankan migrasi dan seeder:
   ```
   node seeds/seedBooks.js
   ```

6. Jalankan server backend:
   ```
   npm run dev
   ```

7. Buka aplikasi di browser:
   ```
   http://localhost:5000
   ```

## Struktur Database

### Book
- `id`: ID buku (primary key)
- `title`: Judul buku
- `author`: Penulis buku
- `synopsis`: Sinopsis buku
- `previewImage`: URL gambar sampul
- `language`: Bahasa buku
- `pages`: Jumlah halaman
- `formats`: Format file tersedia (array)
- `fileSize`: Ukuran file
- `pdfPath`: Path file PDF
- `epubPath`: Path file EPUB
- `tags`: Tag/kategori (array)
- `features`: Fitur utama buku (array)
- `downloadCount`: Jumlah unduhan
- `isActive`: Status aktif

### User
- `id`: ID user (primary key)
- `name`: Nama user
- `email`: Email user (unique)
- `password`: Password user (terenkripsi)
- `role`: Role user (user/admin)
- `lastLogin`: Waktu login terakhir
- `isActive`: Status aktif

### Download
- `id`: ID unduhan (primary key)
- `bookId`: ID buku (foreign key)
- `userId`: ID user (foreign key)
- `email`: Email pengguna
- `downloadLink`: Link unduhan
- `downloadToken`: Token unik unduhan
- `expiresAt`: Waktu kedaluwarsa
- `downloadedAt`: Waktu diunduh
- `format`: Format file
- `donation`: Jumlah donasi
- `ipAddress`: Alamat IP

## API Endpoints

### Books
- `GET /api/books`: Mendapatkan semua buku
- `GET /api/books/:id`: Mendapatkan detail buku
- `GET /api/books/search`: Mencari buku
- `GET /api/books/tag/:tag`: Mendapatkan buku berdasarkan tag
- `POST /api/books`: Menambahkan buku baru (admin)
- `PUT /api/books/:id`: Memperbarui buku (admin)
- `DELETE /api/books/:id`: Menghapus buku (admin)

### Downloads
- `POST /api/downloads/create`: Membuat link unduhan
- `GET /api/downloads/download/:token`: Mengunduh buku
- `POST /api/downloads/resend`: Mengirim ulang link unduhan
- `GET /api/downloads/history/:email`: Mendapatkan riwayat unduhan
- `GET /api/downloads/stats`: Mendapatkan statistik unduhan (admin)

## Lisensi

© 2023 Ikayama. Hak Cipta Dilindungi. 