# API Documentation - Ikayama Katalog

## 📚 Overview

Dokumentasi lengkap untuk API endpoints Ikayama Katalog platform. Platform ini terdiri dari dua service utama:

1. **Main Backend Service** (Port 5011) - Menangani manajemen buku, download, dan autentikasi
2. **Payment Gateway Service** (Port 5012) - Menangani payment processing dan PVPG integration

## 🔗 Base URLs

- **Production**: `https://ebook.ikayama.com`
- **Backend API**: `https://ebook.ikayama.com/api`
- **Payment Gateway**: `https://ebook.ikayama.com/payment`

## 🔐 Authentication

### JWT Token Authentication

Untuk endpoint yang memerlukan autentikasi, sertakan JWT token di header:

```http
Authorization: Bearer <your-jwt-token>
```

### Admin Authentication

Beberapa endpoint memerlukan role admin. Token harus memiliki `role: 'admin'`.

---

## 📖 Books API

### Get All Books

**Endpoint:** `GET /api/books`

**Description:** Mendapatkan daftar semua buku yang tersedia

**Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)
- `search` (optional): Kata kunci pencarian
- `category` (optional): Filter berdasarkan kategori
- `author` (optional): Filter berdasarkan author

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": 1,
        "title": "Judul Buku",
        "author": "Nama Author",
        "description": "Deskripsi buku",
        "category": "Programming",
        "language": "Indonesian",
        "pages": 250,
        "fileSize": "5.2 MB",
        "formats": ["PDF", "EPUB"],
        "coverImage": "https://example.com/cover.jpg",
        "previewPages": 10,
        "downloadCount": 1250,
        "tags": ["javascript", "web development"],
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### Get Book by ID

**Endpoint:** `GET /api/books/:id`

**Description:** Mendapatkan detail buku berdasarkan ID

**Parameters:**
- `id` (required): ID buku

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Judul Buku",
    "author": "Nama Author",
    "description": "Deskripsi lengkap buku...",
    "category": "Programming",
    "language": "Indonesian",
    "pages": 250,
    "fileSize": "5.2 MB",
    "formats": ["PDF", "EPUB"],
    "coverImage": "https://example.com/cover.jpg",
    "previewPages": 10,
    "downloadCount": 1250,
    "tags": ["javascript", "web development"],
    "features": ["Code examples", "Exercises", "Real projects"],
    "tableOfContents": [
      "Chapter 1: Introduction",
      "Chapter 2: Basics",
      "Chapter 3: Advanced Topics"
    ],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Search Books

**Endpoint:** `GET /api/books/search`

**Description:** Mencari buku berdasarkan kata kunci

**Parameters:**
- `q` (required): Kata kunci pencarian
- `page` (optional): Nomor halaman
- `limit` (optional): Jumlah item per halaman

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [...],
    "searchQuery": "javascript",
    "totalResults": 15,
    "pagination": {...}
  }
}
```

### Create Book (Admin Only)

**Endpoint:** `POST /api/books`

**Description:** Menambahkan buku baru

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "Judul Buku",
  "author": "Nama Author",
  "description": "Deskripsi buku",
  "category": "Programming",
  "language": "Indonesian",
  "pages": 250,
  "formats": ["PDF", "EPUB"],
  "coverImage": "https://example.com/cover.jpg",
  "previewPages": 10,
  "tags": ["javascript", "web development"],
  "features": ["Code examples", "Exercises"],
  "tableOfContents": ["Chapter 1", "Chapter 2"],
  "filePaths": {
    "pdf": "/path/to/book.pdf",
    "epub": "/path/to/book.epub"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "id": 25,
    "title": "Judul Buku",
    ...
  }
}
```

### Update Book (Admin Only)

**Endpoint:** `PUT /api/books/:id`

**Description:** Memperbarui data buku

**Authentication:** Required (Admin)

**Request Body:** Same as Create Book

### Delete Book (Admin Only)

**Endpoint:** `DELETE /api/books/:id`

**Description:** Menghapus buku

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

---

## 📥 Download API

### Request Download Link

**Endpoint:** `POST /api/download/request`

**Description:** Meminta link download untuk buku

**Request Body:**
```json
{
  "bookId": 1,
  "email": "user@example.com",
  "format": "PDF",
  "donationAmount": 25000,
  "paymentId": "PAY123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Download link sent to your email",
  "data": {
    "downloadToken": "abc123def456",
    "expiresAt": "2024-01-16T10:30:00Z",
    "downloadUrl": "https://ebook.ikayama.com/api/download/abc123def456"
  }
}
```

### Download File

**Endpoint:** `GET /api/download/:token`

**Description:** Download file menggunakan token

**Parameters:**
- `token` (required): Download token

**Response:** File download (binary)

### Get Download History

**Endpoint:** `GET /api/download/history`

**Description:** Mendapatkan riwayat download user

**Parameters:**
- `email` (required): Email user
- `page` (optional): Nomor halaman
- `limit` (optional): Jumlah item per halaman

**Response:**
```json
{
  "success": true,
  "data": {
    "downloads": [
      {
        "id": 1,
        "bookTitle": "Judul Buku",
        "format": "PDF",
        "downloadedAt": "2024-01-15T10:30:00Z",
        "donationAmount": 25000,
        "paymentStatus": "completed"
      }
    ],
    "pagination": {...}
  }
}
```

### Resend Download Link

**Endpoint:** `POST /api/download/resend`

**Description:** Mengirim ulang link download

**Request Body:**
```json
{
  "email": "user@example.com",
  "downloadId": 123
}
```

---

## 🔐 Authentication API

### Admin Login

**Endpoint:** `POST /api/auth/login`

**Description:** Login untuk admin

**Request Body:**
```json
{
  "email": "admin@ikayama.com",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@ikayama.com",
      "role": "admin",
      "name": "Admin User"
    },
    "expiresIn": "24h"
  }
}
```

### Verify Token

**Endpoint:** `GET /api/auth/verify`

**Description:** Verifikasi JWT token

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": 1,
      "email": "admin@ikayama.com",
      "role": "admin"
    }
  }
}
```

### Admin Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout admin

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 💳 Payment Gateway API

### Create Payment

**Endpoint:** `POST /api/payment/create`

**Description:** Membuat request pembayaran baru

**Request Body:**
```json
{
  "amount": 25000,
  "currency": "IDR",
  "order_id": "ORDER123456",
  "customer_details": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+6281234567890"
  },
  "item_details": [
    {
      "id": "BOOK001",
      "price": 25000,
      "quantity": 1,
      "name": "Judul Buku",
      "category": "Digital Book"
    }
  ],
  "callback_url": "https://ebook.ikayama.com/payment/callback",
  "redirect_url": "https://ebook.ikayama.com/payment/redirect"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment request created successfully",
  "data": {
    "order_id": "ORDER123456",
    "amount": 25000,
    "currency": "IDR",
    "status": "pending",
    "redirectUrl": "https://payment-gateway.pvpg.co.id/pay?token=abc123",
    "paymentToken": "abc123def456",
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

### Update Payment Status

**Endpoint:** `POST /api/payment/update`

**Description:** Update status pembayaran

**Request Body:**
```json
{
  "order_id": "ORDER123456",
  "status": "completed",
  "transaction_id": "TXN789012345",
  "payment_method": "QRIS",
  "paid_at": "2024-01-15T10:45:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "order_id": "ORDER123456",
    "status": "completed",
    "transaction_id": "TXN789012345"
  }
}
```

### Payment Callback

**Endpoint:** `POST /payment/callback`

**Description:** Webhook callback dari PVPG

**Request Body:** (Dari PVPG)
```json
{
  "order_id": "ORDER123456",
  "status_code": "200",
  "transaction_status": "settlement",
  "transaction_id": "TXN789012345",
  "gross_amount": "25000.00",
  "payment_type": "qris",
  "transaction_time": "2024-01-15 10:45:00",
  "signature_key": "abc123def456..."
}
```

### Payment Redirect

**Endpoint:** `GET /payment/redirect`

**Description:** Redirect setelah pembayaran

**Parameters:**
- `order_id`: Order ID
- `status`: Payment status
- `transaction_id`: Transaction ID

**Response:** HTML redirect page

---

## 📊 Statistics API (Admin Only)

### Get Download Statistics

**Endpoint:** `GET /api/stats/downloads`

**Description:** Mendapatkan statistik download

**Authentication:** Required (Admin)

**Parameters:**
- `period` (optional): daily, weekly, monthly (default: monthly)
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDownloads": 1250,
    "totalRevenue": 31250000,
    "averageDonation": 25000,
    "topBooks": [
      {
        "bookId": 1,
        "title": "Judul Buku",
        "downloadCount": 150,
        "revenue": 3750000
      }
    ],
    "downloadsByPeriod": [
      {
        "date": "2024-01-01",
        "downloads": 45,
        "revenue": 1125000
      }
    ]
  }
}
```

### Get Payment Statistics

**Endpoint:** `GET /api/stats/payments`

**Description:** Mendapatkan statistik pembayaran

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 1000,
    "completedTransactions": 850,
    "pendingTransactions": 100,
    "failedTransactions": 50,
    "successRate": 85.0,
    "totalRevenue": 21250000,
    "paymentMethods": [
      {
        "method": "QRIS",
        "count": 400,
        "percentage": 47.1
      },
      {
        "method": "Bank Transfer",
        "count": 300,
        "percentage": 35.3
      }
    ]
  }
}
```

---

## 🔍 Health Check API

### Backend Health Check

**Endpoint:** `GET /api/health`

**Description:** Check status backend service

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "environment": "production",
  "version": "1.0.0",
  "database": "connected",
  "services": {
    "mysql": "healthy",
    "email": "healthy",
    "storage": "healthy"
  }
}
```

### Payment Gateway Health Check

**Endpoint:** `GET /payment/health`

**Description:** Check status payment gateway service

**Response:**
```json
{
  "status": "OK",
  "service": "payment-gateway",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "pvpg_connection": "healthy"
}
```

---

## ❌ Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Code Types

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication required
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND_ERROR` - Resource not found
- `RATE_LIMIT_ERROR` - Rate limit exceeded
- `PAYMENT_ERROR` - Payment processing error
- `INTERNAL_ERROR` - Server internal error

---

## 🔧 Rate Limiting

### API Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Payment API**: 50 requests per 15 minutes per IP
- **Download API**: 10 requests per 5 minutes per IP
- **Search API**: 200 requests per 15 minutes per IP

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

---

## 📝 Request/Response Examples

### cURL Examples

#### Get All Books
```bash
curl -X GET "https://ebook.ikayama.com/api/books?page=1&limit=10" \
  -H "Content-Type: application/json"
```

#### Create Payment
```bash
curl -X POST "https://ebook.ikayama.com/api/payment/create" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25000,
    "currency": "IDR",
    "order_id": "ORDER123456",
    "customer_details": {
      "first_name": "John",
      "email": "john@example.com"
    }
  }'
```

#### Admin Login
```bash
curl -X POST "https://ebook.ikayama.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ikayama.com",
    "password": "admin_password"
  }'
```

---

## 🔒 Security Considerations

### HTTPS Only
Semua API endpoints hanya dapat diakses melalui HTTPS.

### CORS Policy
CORS dikonfigurasi untuk domain `ebook.ikayama.com` saja.

### Input Validation
Semua input divalidasi dan disanitasi untuk mencegah injection attacks.

### Rate Limiting
Implementasi rate limiting untuk mencegah abuse.

### JWT Security
- Token expires dalam 24 jam
- Secure secret key
- Token validation pada setiap request

### Payment Security
- Signature verification untuk PVPG callbacks
- Encrypted payment data
- Secure token generation

---

## 📞 Support

Untuk pertanyaan atau masalah terkait API:

- **Email**: support@ikayama.com
- **Documentation**: https://ebook.ikayama.com/docs
- **Status Page**: https://status.ikayama.com

---

**Last Updated**: January 2024
**API Version**: v1.0.0