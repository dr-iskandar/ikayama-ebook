// Tambahkan konfigurasi API
const API_URL = 'http://localhost:8510/api';

// Tambahkan state management sederhana
const state = {
    currentBook: null,
    downloadHistory: [],
    currentEmail: null,
    emailResendCount: 0,
    lastEmailSentTime: null,
    books: []
};

// State untuk preview
const previewState = {
    currentBook: null,
    books: {}
};

// Fungsi untuk fetch data dari API
async function fetchAPI(endpoint, options = {}) {
    try {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const fetchOptions = { ...defaultOptions, ...options };
        const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Terjadi kesalahan pada API');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Fungsi untuk mendapatkan semua buku
async function loadBooks() {
    try {
        const response = await fetchAPI('/books');
        state.books = response.data;
        
        // Konversi data buku ke format previewState
        state.books.forEach(book => {
            previewState.books[book.id] = {
                id: book.id,
                title: book.title,
                author: book.author,
                previewImage: book.previewImage,
                synopsis: book.synopsis,
                features: book.features || [],
                details: {
                    pages: book.pages,
                    language: book.language,
                    formats: book.formats,
                    fileSize: book.fileSize
                }
            };
        });
        
        // Perbarui UI dengan data buku
        updateBooksUI();
    } catch (error) {
        console.error('Error loading books:', error);
        // Tampilkan pesan error ke user
        showErrorMessage('Gagal memuat data buku. Silakan coba lagi nanti.');
    }
}

// Tampilkan pesan error
function showErrorMessage(message) {
    const katalogContainer = document.querySelector('.max-w-7xl.mx-auto.px-4.py-12 .grid');
    if (!katalogContainer) return;
    
    katalogContainer.innerHTML = `
        <div class="col-span-3 text-center py-8">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="mt-4 text-lg font-medium text-gray-600">${message}</p>
            <button onclick="loadBooks()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                Coba Lagi
            </button>
        </div>
    `;
}

// Fungsi untuk memperbarui UI dengan data buku
function updateBooksUI() {
    // Ambil container katalog
    const katalogContainer = document.querySelector('.max-w-7xl.mx-auto.px-4.py-12 .grid');
    
    if (!katalogContainer) return;
    
    // Kosongkan kontainer
    katalogContainer.innerHTML = '';
    
    if (state.books.length === 0) {
        katalogContainer.innerHTML = `
            <div class="col-span-3 text-center py-8">
                <p class="text-lg font-medium text-gray-600">Tidak ada buku yang tersedia.</p>
            </div>
        `;
        return;
    }
    
    // Tambahkan kartu buku ke UI
    state.books.forEach(book => {
        // Buat elemen card 
        const bookCard = document.createElement('div');
        bookCard.className = 'bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-lira/20 transition-shadow duration-300 card-hover';
        bookCard.setAttribute('data-book-id', book.id);
        
        // Format tags/fitur
        const tagsHTML = book.tags && book.tags.length > 0 
            ? book.tags.map(tag => 
                `<span class="px-3 py-1 bg-primary-lightest text-neutral-light rounded-full text-sm">${tag}</span>`
              ).join('')
            : '';
        
        // Create card HTML
        bookCard.innerHTML = `
            <img src="${book.previewImage}" alt="${book.title} Cover" class="w-full h-64 object-cover cursor-pointer" onclick="showPreview(${book.id})">
            <div class="p-6 flex flex-col h-[calc(100%-16rem)]">
                <div class="flex-grow">
                    <h2 class="font-bold text-2xl mb-2 cursor-pointer hover:text-primary transition-colors" onclick="showPreview(${book.id})">${book.title}</h2>
                    <p class="text-gray-600 mb-2">By ${book.author}</p>
                    <p class="text-gray-800 mb-4 text-sm">${book.synopsis ? book.synopsis.substring(0, 100) + '...' : ''}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${tagsHTML}
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-500 mb-6">
                        <span>Format: ${book.formats ? book.formats.join(', ') : 'PDF'}</span>
                        <span>Size: ${book.fileSize || 'N/A'}</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="showPreview(${book.id})" class="w-1/2 bg-primary-lightest text-neutral py-3 rounded-lg hover:bg-primary/10 transition duration-200">
                        Preview
                    </button>
                    <button onclick="getFullVersion(${book.id})" class="w-1/2 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition duration-200">
                        Download / Donate
                    </button>
                </div>
            </div>
        `;
        
        // Tambahkan card ke kontainer
        katalogContainer.appendChild(bookCard);
    });
}

function showModal(bookId) {
    currentBookId = bookId;
    
    // Get book data and update display
    const book = state.books.find(b => b.id === bookId);
    if (book) {
        const selectedBookElement = document.getElementById('selectedBook');
        if (selectedBookElement) {
            selectedBookElement.textContent = book.title;
        }
    }
    
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('hidden');
    
    // Update judul modal
    const modalTitle = modal.querySelector('h2');
    if (modalTitle && book) {
        modalTitle.textContent = book.title;
    }
    
    state.currentBook = {
        id: bookId,
        title: book ? book.title : 'Unknown',
        coverUrl: book ? book.previewImage : ''
    };
    
    resetModal();
    showStep('donationStep');
}

function resetModal() {
    document.getElementById('donationAmount').value = '';
}

function confirmDonation() {
    const amountStr = document.getElementById('donationAmount').value;
    // Mengambil angka dari string format mata uang
    const amount = Number(amountStr.replace(/[^0-9]/g, ''));
    
    if (amount < 1) {
        alert('Minimal donasi adalah Rp 1');
        return;
    }
    
    // Menampilkan step berikutnya
    showStep('emailStep');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Global variables for payment
let currentBookId = null;
let paymentData = null;

// Process payment through PVPG
async function processPayment() {
    if (!selectedAmount || !currentBookId) {
        alert('Data pembayaran tidak lengkap');
        return;
    }
    
    showStep('processingStep');
    
    try {
        const orderId = 'ORDER_' + Date.now();
        const paymentData = {
            expires_in: 3600, // 1 hour
            order_id: orderId,
            user_id: 'USER_' + Date.now(),
            merchant_name: 'Ikayama Katalog',
            payment_method: 'all',
            total_amount: selectedAmount,
            customer_name: 'Customer',
            courier_agent: '',
            currency: 'IDR',
            push_url: 'http://localhost:8995/payment/update',
            callback_url: 'http://localhost:8510'
        };
        
        const response = await fetch('http://localhost:8995/payment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        if (response.ok) {
            const result = await response.json();
            // Redirect to PVPG payment gateway
            if (result.content && result.content.redirectUrl) {
                window.open(result.content.redirectUrl, '_blank');
            }
            // Show success step
            showStep('successStep');
        } else {
            throw new Error('Payment failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Terjadi kesalahan saat memproses pembayaran');
    }
}

// Download book after successful payment
function downloadBook() {
    if (!currentBookId) {
        alert('Data buku tidak ditemukan');
        return;
    }
    
    // Simulate book download
    const downloadUrl = `${API_URL}/books/${currentBookId}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `book_${currentBookId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    hideModal();
}

async function submitEmail() {
    const email = document.getElementById('userEmail').value.trim();
    
    if (!validateEmail(email)) {
        alert('Email tidak valid. Mohon periksa kembali.');
        return;
    }
    
    state.currentEmail = email;
    
    try {
        showStep('processingStep');
        
        // Simulasi proses pengiriman email (ganti dengan API call nanti)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi delay
        
        try {
            await sendDownloadLink(email);
        } catch (error) {
            console.error('Error sending email:', error);
            // Jika API gagal, kita tetap menampilkan sukses untuk demo
        }
        
        // Simpan ke riwayat unduhan
        saveHistory();
        
        // Menampilkan step sukses
        showStep('successStep');
    } catch (error) {
        console.error('Error in submission process:', error);
        alert('Gagal mengirim email. Silakan coba lagi nanti.');
        showStep('emailStep');
    }
}

async function sendDownloadLink(email) {
    try {
        const amountStr = document.getElementById('donationAmount').value;
        const amount = Number(amountStr.replace(/[^0-9]/g, ''));
        
        // Coba kirim ke API, jika gagal gunakan fallback
        try {
            const response = await fetchAPI('/downloads/create', {
                method: 'POST',
                body: JSON.stringify({
                    bookId: state.currentBook.id,
                    email: email,
                    format: 'PDF', // Default format
                    donation: amount
                })
            });
            
            state.lastEmailSentTime = new Date();
            state.emailResendCount = 0;
            
            return response;
        } catch (error) {
            console.warn('API tidak tersedia, menggunakan fallback untuk demo:', error);
            // Fallback untuk demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            state.lastEmailSentTime = new Date();
            state.emailResendCount = 0;
            return { success: true, message: 'Demo mode: Email berhasil dikirim' };
        }
    } catch (error) {
        console.error('Error sending download link:', error);
        throw new Error('Gagal mengirim link unduhan');
    }
}

async function resendEmail() {
    if (!state.currentEmail || !state.currentBook) {
        alert('Informasi email atau buku tidak lengkap');
        return;
    }
    
    // Batasi frekuensi pengiriman ulang
    if (state.lastEmailSentTime) {
        const timeDiff = new Date() - new Date(state.lastEmailSentTime);
        const minutesPassed = Math.floor(timeDiff / 60000);
        
        if (minutesPassed < 2) {
            alert(`Mohon tunggu ${2 - minutesPassed} menit lagi sebelum mengirim ulang email`);
            return;
        }
    }
    
    if (state.emailResendCount >= 3) {
        alert('Anda telah mencapai batas maksimum pengiriman ulang. Silakan hubungi admin.');
        return;
    }
    
    try {
        document.getElementById('resendButton').disabled = true;
        document.getElementById('resendButton').textContent = 'Mengirim...';
        
        await fetchAPI('/downloads/resend', {
            method: 'POST',
            body: JSON.stringify({
                email: state.currentEmail,
                bookId: state.currentBook.id
            })
        });
        
        state.lastEmailSentTime = new Date();
        state.emailResendCount++;
        
        alert('Email berhasil dikirim ulang! Silakan periksa kotak masuk Anda.');
        
        document.getElementById('resendButton').disabled = false;
        document.getElementById('resendButton').textContent = 'Kirim Ulang Email';
    } catch (error) {
        console.error('Error resending email:', error);
        alert('Gagal mengirim ulang email. Silakan coba lagi nanti.');
        document.getElementById('resendButton').disabled = false;
        document.getElementById('resendButton').textContent = 'Kirim Ulang Email';
    }
}

function verifyPayment() {
    // Simulasi verifikasi pembayaran selesai
    alert('Pembayaran berhasil diverifikasi! Link unduhan akan dikirimkan ke email Anda.');
    
    // Menampilkan step sukses
    showStep('successStep');
    
    // Simpan ke riwayat
    saveHistory();
}

async function showHistory() {
    const email = prompt('Masukkan email Anda untuk melihat riwayat unduhan:');
    
    if (!email || !validateEmail(email)) {
        alert('Email tidak valid');
        return;
    }
    
    try {
        const response = await fetchAPI(`/downloads/history/${email}`);
        state.downloadHistory = response.data;
        
        // Tampilkan modal riwayat
        const historyModal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');
        
        // Kosongkan list riwayat
        historyList.innerHTML = '';
        
        if (state.downloadHistory.length === 0) {
            historyList.innerHTML = '<p class="text-center py-4">Belum ada riwayat unduhan</p>';
        } else {
            // Populate list riwayat
            state.downloadHistory.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'flex items-center justify-between border-b border-gray-200 py-3';
                historyItem.innerHTML = `
                    <div class="flex items-center">
                        <img src="${item.Book.previewImage}" alt="${item.Book.title}" class="w-12 h-12 object-cover rounded">
                        <div class="ml-3">
                            <h3 class="font-medium">${item.Book.title}</h3>
                            <p class="text-sm text-gray-500">${new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onclick="redownload(${item.bookId})" class="bg-primary-lightest text-neutral px-3 py-1 rounded hover:bg-primary/10">
                        Download
                    </button>
                `;
                historyList.appendChild(historyItem);
            });
        }
        
        historyModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching history:', error);
        alert('Gagal memuat riwayat unduhan. Silakan coba lagi nanti.');
    }
}

function hideHistory() {
    document.getElementById('historyModal').classList.add('hidden');
}

function saveHistory() {
    if (!state.currentBook || !state.currentEmail) return;
    
    // Data sudah disimpan di backend, tidak perlu disimpan lagi di localStorage
}

function loadHistory() {
    // Riwayat akan dimuat dari server saat dibutuhkan
    // loadHistoryFromLocalStorage tidak diperlukan lagi
}

async function redownload(bookId) {
    if (!state.currentEmail) {
        alert('Informasi email tidak lengkap');
        return;
    }
    
    try {
        await sendDownloadLink(state.currentEmail);
        alert('Link unduhan telah dikirim ke email Anda!');
    } catch (error) {
        console.error('Error redownloading:', error);
        alert('Gagal mengirim link unduhan. Silakan coba lagi nanti.');
    }
}

function setAmount(amount) {
    selectedAmount = amount;
    
    // Update donation amount display
    const donationAmountElement = document.getElementById('donationAmount');
    if (donationAmountElement) {
        donationAmountElement.value = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    // Update payment step display
    const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
    
    const selectedAmountElement = document.getElementById('selectedAmount');
    if (selectedAmountElement) {
        selectedAmountElement.textContent = formattedAmount;
    }
    
    // Update selected amount display in donation step
    const selectedAmountDisplay = document.getElementById('selectedAmountDisplay');
    if (selectedAmountDisplay) {
        selectedAmountDisplay.textContent = formattedAmount;
    }
}

// Function to proceed to payment step
function proceedToPayment() {
    if (!selectedAmount) {
        alert('Silakan pilih jumlah donasi terlebih dahulu');
        return;
    }
    showStep('paymentStep');
}

// Formatting input donasi
document.addEventListener('DOMContentLoaded', function() {
    const donationInput = document.getElementById('donationAmount');
    
    donationInput.addEventListener('input', function(e) {
        // Hapus semua karakter selain digit
        let value = e.target.value.replace(/\D/g, '');
        
        // Format sebagai mata uang
        if (value) {
            value = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(value);
        }
        
        e.target.value = value;
    });
});

function hideModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    
    // Reset modal state
    showStep('donationStep');
}

function showPreview(bookId) {
    previewState.currentBook = previewState.books[bookId];
    const previewModal = document.getElementById('previewModal');
    
    if (!previewState.currentBook) {
        alert('Informasi buku tidak tersedia');
        return;
    }
    
    // Update judul buku pada preview modal
    document.getElementById('previewBookTitle').textContent = previewState.currentBook.title;
    
    // Update gambar preview
    const previewImage = document.getElementById('previewImage');
    previewImage.src = previewState.currentBook.previewImage;
    previewImage.alt = previewState.currentBook.title;
    
    // Update sinopsis
    document.getElementById('bookSynopsis').textContent = previewState.currentBook.synopsis;
    
    // Tampilkan modal
    previewModal.classList.remove('hidden');
}

function nextPage() {
    // Implementasi navigasi halaman preview
    alert('Navigasi ke halaman berikutnya');
}

function prevPage() {
    // Implementasi navigasi halaman preview
    alert('Navigasi ke halaman sebelumnya');
}

function showStep(stepName) {
    // Hide all steps
    document.querySelectorAll('#paymentModal > div > div:not(:first-child)').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Show selected step
    document.getElementById(stepName).classList.remove('hidden');
    
    // Update progress indicator
    const stepMap = {
        'donationStep': 1,
        'paymentStep': 2,
        'processingStep': 3,
        'successStep': 4
    };
    
    updateProgressIndicator(stepMap[stepName] || 1);
    
    // Update step labels
    document.querySelectorAll('.step-label').forEach(label => {
        label.classList.add('hidden');
    });
    const currentLabel = document.querySelector(`[data-step="${stepMap[stepName] || 1}"].step-label`);
    if (currentLabel) {
        currentLabel.classList.remove('hidden');
    }
}

function updateProgressIndicator(currentStep) {
    const stepOrder = {
        'donationStep': 1,
        'emailStep': 2,
        'processingStep': 3,
        'successStep': 4
    };
    
    const currentStepNumber = stepOrder[currentStep];
    
    // Update progress indicators
    for (let i = 1; i <= 4; i++) {
        const indicator = document.getElementById(`step${i}`);
        
        if (i < currentStepNumber) {
            // Completed steps
            indicator.classList.remove('bg-gray-200', 'bg-primary-light', 'text-white');
            indicator.classList.add('bg-primary', 'text-white');
        } else if (i === currentStepNumber) {
            // Current step
            indicator.classList.remove('bg-gray-200', 'bg-primary');
            indicator.classList.add('bg-primary-light', 'text-white');
        } else {
            // Future steps
            indicator.classList.remove('bg-primary', 'bg-primary-light', 'text-white');
            indicator.classList.add('bg-gray-200', 'text-neutral');
        }
    }
}

function getFullVersion(bookId) {
    hidePreview();
    showModal(bookId);
}

function hidePreview() {
    document.getElementById('previewModal').classList.add('hidden');
    previewState.currentBook = null;
}

function copyAccountNumber() {
    const accountNumber = document.getElementById('accountNumber').textContent;
    navigator.clipboard.writeText(accountNumber).then(() => {
        // Update UI untuk menunjukkan berhasil disalin
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        
        copyBtn.textContent = 'Tersalin!';
        copyBtn.classList.remove('bg-primary-lightest', 'text-neutral');
        copyBtn.classList.add('bg-green-100', 'text-green-800');
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('bg-green-100', 'text-green-800');
            copyBtn.classList.add('bg-primary-lightest', 'text-neutral');
        }, 2000);
    }).catch(err => {
        console.error('Gagal menyalin teks: ', err);
        alert('Gagal menyalin nomor rekening');
    });
}

// Load books when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
});