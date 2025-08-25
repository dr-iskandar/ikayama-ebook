// Tambahkan konfigurasi API
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:8510/api' : '/api';

// Tambahkan state management sederhana
const state = {
    currentBook: null,
    currentEmail: null,
    emailResendCount: 0,
    lastEmailSentTime: null,
    books: [],
    filteredBooks: [],
    searchQuery: ''
};

// State untuk preview
const previewState = {
    currentBook: null,
    books: {}
};

// State untuk filter
const filterState = {
    searchQuery: ''
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
    const katalogContainer = document.querySelector('.grid.grid-cols-1');
    if (!katalogContainer) {
        console.error('Katalog container tidak ditemukan untuk error message');
        return;
    }
    
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
    const katalogContainer = document.querySelector('.grid.grid-cols-1');
    
    if (!katalogContainer) {
        console.error('Katalog container tidak ditemukan');
        return;
    }
    
    // Kosongkan kontainer
    katalogContainer.innerHTML = '';
    
    // Apply filters
    let booksToShow = state.books;
    
    // Language filter removed - only available in admin dashboard
    
    // Filter by search query
    if (state.searchQuery) {
        booksToShow = booksToShow.filter(book => 
            book.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            (book.tags && book.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase())))
        );
    }
    
    // Update filtered books state
    state.filteredBooks = booksToShow;
    
    if (booksToShow.length === 0) {
        const message = state.searchQuery 
            ? `Tidak ada buku yang ditemukan untuk "${state.searchQuery}"`
            : 'Tidak ada buku yang tersedia.';
        katalogContainer.innerHTML = `
            <div class="col-span-3 text-center py-8">
                <p class="text-lg font-medium text-gray-600">${message}</p>
            </div>
        `;
        return;
    }
    
    // Tambahkan kartu buku ke UI
    booksToShow.forEach(book => {
        // Buat elemen card 
        const bookCard = document.createElement('div');
        bookCard.className = 'bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1 card-hover book-card-interactive group';
        bookCard.setAttribute('data-book-id', book.id);
        
        // Format tags/fitur
        const tagsHTML = book.tags && book.tags.length > 0 
            ? book.tags.map(tag => 
                `<span class="px-3 py-1 bg-primary-lightest text-neutral-light rounded-full text-sm transition-colors duration-200 hover:bg-primary/20">${tag}</span>`
              ).join('')
            : '';
        
        // Create card HTML with micro-interactions
        bookCard.innerHTML = `
            <div class="relative overflow-hidden">
                <img src="${book.previewImage || '/assets/images/default-cover.svg'}" alt="${book.title} Cover" class="w-full h-64 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105" onclick="showPreview(${book.id})">
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button onclick="copyBookUrl(${book.id})" class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-primary hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl mobile-touch-target flex items-center justify-center" title="Copy Link">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="p-4 sm:p-6 flex flex-col h-[calc(100%-16rem)]">
                <div class="flex-grow">
                    <div class="flex items-start mb-2">
                        <h2 class="font-bold text-xl sm:text-2xl cursor-pointer hover:text-primary transition-colors duration-200 flex-1 min-w-0 pr-2 line-clamp-2" onclick="showPreview(${book.id})">${book.title}</h2>
                    </div>
                    <p class="text-gray-600 mb-2 text-sm sm:text-base">By ${book.author}</p>
                    <p class="text-gray-800 mb-4 text-sm line-clamp-3">${book.synopsis ? book.synopsis.substring(0, 120) + '...' : ''}</p>
                    <div class="flex flex-wrap gap-1 sm:gap-2 mb-4">
                        ${tagsHTML}
                    </div>
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 space-y-1 sm:space-y-0">
                        <span>Format: ${book.formats ? book.formats.join(', ') : 'PDF'}</span>
                        <span>Size: ${book.fileSize || 'N/A'}</span>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <button onclick="showPreview(${book.id})" class="flex-1 bg-primary-lightest text-neutral py-3 sm:py-3 rounded-lg hover:bg-primary/10 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] btn-interactive mobile-touch-target font-medium">
                        <span class="flex items-center justify-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span>Preview</span>
                        </span>
                    </button>
                    <button onclick="getFullVersion(${book.id})" class="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-3 sm:py-3 rounded-lg hover:from-primary-dark hover:to-primary transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] btn-interactive mobile-touch-target font-medium shadow-lg hover:shadow-xl">
                        <span class="flex items-center justify-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>Download</span>
                        </span>
                    </button>
                </div>
            </div>
        `;
        
        // Tambahkan event listeners untuk micro-interactions
        bookCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        bookCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Touch feedback untuk mobile
        bookCard.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-2px) scale(0.98)';
        });
        
        bookCard.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = 'translateY(0) scale(1)';
            }, 150);
        });
        
        // Tambahkan card ke kontainer
        katalogContainer.appendChild(bookCard);
    });
}

function showModal(bookId) {
    const book = previewState.books[bookId];
    if (!book) {
        alert('Informasi buku tidak tersedia');
        return;
    }
    
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('hidden');
    
    // Update judul modal
    const modalTitle = modal.querySelector('h2');
    modalTitle.textContent = book.title;
    
    state.currentBook = {
        id: bookId,
        title: book.title,
        coverUrl: book.previewImage
    };
    
    resetModal();
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

async function submitEmail() {
    const email = document.getElementById('userEmail').value.trim();
    
    if (!validateEmail(email)) {
        alert('Email tidak valid. Mohon periksa kembali.');
        return;
    }
    
    state.currentEmail = email;
    
    try {
        showStep('processingStep');
        
        // Store email for later use
        localStorage.setItem('userEmail', email);
        
        // Create payment request to pvs_pg gateway
        await createPaymentRequest(email);
        
    } catch (error) {
        console.error('Error in submission process:', error);
        
        let errorMessage = 'Gagal memproses permintaan. Silakan coba lagi nanti.';
        
        // Handle specific error types
        if (error.message.includes('Failed to create payment request')) {
            errorMessage = 'Gagal membuat permintaan pembayaran. Periksa koneksi internet Anda dan coba lagi.';
        } else if (error.message.includes('No redirect URL')) {
            errorMessage = 'Sistem pembayaran sedang bermasalah. Silakan coba beberapa saat lagi.';
        } else if (error.message.includes('fetch')) {
            errorMessage = 'Koneksi ke server terputus. Periksa koneksi internet Anda.';
        }
        
        alert(errorMessage);
        showStep('emailStep');
    }
}

// Function to create payment request and redirect to payment gateway
async function createPaymentRequest(email) {
    try {
        // Get donation amount from input field
        const donationAmountInput = document.getElementById('donationAmount');
        let donationAmount = 50000; // Default amount
        
        if (donationAmountInput && donationAmountInput.value) {
            const amountStr = donationAmountInput.value;
            const amount = Number(amountStr.replace(/[^0-9]/g, ''));
            if (amount > 0) {
                donationAmount = amount;
            }
        }
        
        const paymentData = {
            expires_in: 3600, // 1 hour
            order_id: `ORDER_${Date.now()}`,
            user_id: email,
            merchant_name: "Ikayama Katalog",
            payment_method: "qris",
            total_amount: donationAmount, // Use selected donation amount
            customer_name: email.split('@')[0],
            courier_agent: "",
            currency: "IDR",
            push_url: `${window.location.origin}/payment/callback`,
            callback_url: `${window.location.origin}/payment/redirect`
        };
        
        console.log('Creating payment request:', paymentData);
        
        // Send request to backend payment proxy
        const response = await fetch('/payment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });
        
        console.log('Payment response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = 'Failed to create payment request';
            
            try {
                const errorData = await response.json();
                console.error('Payment error response:', errorData);
                
                if (response.status === 502) {
                    errorMessage = 'Payment gateway service unavailable';
                } else if (response.status === 500) {
                    errorMessage = 'Internal server error';
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
            }
            
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('Payment gateway response:', result);
        
        if (result.success === false) {
            throw new Error(result.message || 'Payment request failed');
        }
        
        if (result.content && result.content.redirectUrl) {
            // Store payment info for callback handling
            localStorage.setItem('paymentOrderId', paymentData.order_id);
            localStorage.setItem('paymentInProgress', 'true');
            localStorage.setItem('userEmail', email);
            
            console.log('Redirecting to payment gateway:', result.content.redirectUrl);
            
            // Redirect to payment gateway in the same page
            window.location.href = result.content.redirectUrl;
        } else {
            console.error('Invalid payment gateway response:', result);
            throw new Error('No redirect URL received from payment gateway');
        }
        
    } catch (error) {
        console.error('Payment request error:', error);
        
        // Enhanced error handling with specific error types
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network connection failed. Please check your internet connection.');
        } else if (error.message.includes('Payment gateway service unavailable')) {
            throw new Error('Payment service is temporarily unavailable. Please try again later.');
        } else if (error.message.includes('timeout')) {
            throw new Error('Request timeout. Please try again.');
        }
        
        throw error;
    }
}



// Function to handle cancelled payment
function handlePaymentCancelled(orderId) {
    console.log('Payment cancelled for order:', orderId);
    
    // Clear payment state
    localStorage.removeItem('paymentInProgress');
    localStorage.removeItem('paymentOrderId');
    localStorage.removeItem('userEmail');
    
    // Hide modal and return to main page
    hideModal();
    
    // Reset current book state
    state.currentBook = null;
    
    // Show cancellation message
    alert('Pembayaran dibatalkan. Anda akan kembali ke halaman utama.');
}

// Function to check payment status (simplified for direct redirect)
function checkPaymentStatus() {
    const paymentInProgress = localStorage.getItem('paymentInProgress');
    
    if (paymentInProgress === 'true') {
        // For direct redirect flow, payment status is handled automatically by callback
        // This function is mainly for manual verification if needed
        const userChoice = confirm(
            'Apakah pembayaran Anda sudah selesai?\n\n' +
            'Klik "OK" jika sudah berhasil atau "Cancel" untuk mencoba lagi.'
        );
        
        if (userChoice) {
            handlePaymentSuccess();
        } else {
            const orderId = localStorage.getItem('paymentOrderId');
            handlePaymentCancelled(orderId);
        }
    }
}

// Function to handle successful payment
function handlePaymentSuccess() {
    // Clear payment state
    localStorage.removeItem('paymentInProgress');
    localStorage.removeItem('paymentOrderId');
    
    // Proceed to success step
    showStep('successStep');
    
    // Langsung download file setelah pembayaran berhasil
    if (state.currentBook && state.currentBook.id) {
        try {
            directDownloadAfterEmail(state.currentBook.id);
        } catch (error) {
            console.error('Error downloading file after payment:', error);
        }
    }
    
    // Show success message
    alert('Pembayaran berhasil! Download akan dimulai sebentar lagi.');
}

// Handle payment callback from payment gateway
function handlePaymentCallback(paymentData) {
    if (paymentData && paymentData.payment_status === 'success') {
        // Clear payment state
        localStorage.removeItem('paymentInProgress');
        localStorage.removeItem('paymentOrderId');
        
        // Handle successful payment directly
        handlePaymentSuccess();
    } else {
        // Handle failed or cancelled payment
        const orderId = localStorage.getItem('paymentOrderId');
        handlePaymentCancelled(orderId);
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
    
    // Download history functions removed - only available in admin dashboard
    // saveHistory();
}

// Download history functions removed - only available in admin dashboard

function setAmount(amount) {
    // Update donation amount display
    document.getElementById('donationAmount').value = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
    
    // Enable confirmation button
    const confirmBtn = document.getElementById('confirmDonationBtn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    // Remove active state from all buttons
    document.querySelectorAll('#donationStep button[onclick^="setAmount"]').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
    });
    
    // Add active state to selected button
    event.target.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
    
    // Store selected amount for later use
    state.selectedDonationAmount = amount;
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
    
    // Load books and initialize search
    loadBooks();
    initializeSearch();
    checkForPreviewParameter();
    
    // Language filter and download history functionality removed - only available in admin dashboard
});

function hideModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    
    // Reset modal state
    showStep('donationStep');
}

function showPreview(bookId) {
    // Validasi bookId
    if (!bookId) {
        console.error('Error: bookId is missing');
        alert('ID buku tidak valid');
        return;
    }
    
    // Cari buku di previewState.books atau fallback ke state.books
    let book = previewState.books[bookId];
    if (!book) {
        // Fallback: cari di state.books dan buat entry di previewState
        const originalBook = state.books.find(b => b.id === bookId);
        if (originalBook) {
            book = {
                id: originalBook.id,
                title: originalBook.title,
                author: originalBook.author,
                previewImage: originalBook.previewImage,
                synopsis: originalBook.synopsis,
                features: originalBook.features || [],
                details: {
                    pages: originalBook.pages,
                    language: originalBook.language,
                    formats: originalBook.formats,
                    fileSize: originalBook.fileSize
                }
            };
            previewState.books[bookId] = book;
        }
    }
    
    if (!book) {
        console.error('Error: Book not found with ID:', bookId);
        alert('Informasi buku tidak tersedia');
        return;
    }
    
    // Set current book
    previewState.currentBook = book;
    
    const previewModal = document.getElementById('previewModal');
    
    // Update judul buku pada preview modal
    document.getElementById('previewBookTitle').textContent = book.title;
    
    // Update gambar preview
    const previewImage = document.getElementById('previewImage');
    previewImage.src = book.previewImage || '/assets/images/default-cover.svg';
    previewImage.alt = book.title;
    
    // Update sinopsis
    document.getElementById('bookSynopsis').textContent = book.synopsis;
    
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

function showStep(stepId) {
    // Sembunyikan semua step
    const steps = ['donationStep', 'emailStep', 'processingStep', 'successStep'];
    steps.forEach(step => {
        const element = document.getElementById(step);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // Tampilkan step yang diinginkan
    const currentStep = document.getElementById(stepId);
    if (currentStep) {
        currentStep.classList.remove('hidden');
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
    directDownload(bookId);
}

// Function for direct download after email sent (without progress modal)
async function directDownloadAfterEmail(bookId) {
    const book = state.books.find(book => book.id === bookId);
    if (!book) {
        console.error('Buku tidak ditemukan untuk download otomatis');
        return;
    }
    
    try {
        // Langsung download file PDF dari folder books
        const fileName = book.pdfPath ? book.pdfPath.split('/').pop() : `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        const downloadUrl = `${API_URL.replace('/api', '')}/uploads/books/${fileName}`;
        
        // Buat link download dan trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${book.title}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download count di backend
        await fetchAPI(`/books/${bookId}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
    } catch (error) {
        console.error('Error downloading book after email:', error);
    }
}

// Function for direct download without payment
async function directDownload(bookId) {
    const book = state.books.find(book => book.id === bookId);
    if (!book) {
        alert('Buku tidak ditemukan');
        return;
    }
    
    state.currentBook = book;
    showDownloadProgress(book);
    
    try {
        // Langsung download file PDF dari folder books
        const fileName = book.pdfPath ? book.pdfPath.split('/').pop() : `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        const downloadUrl = `${API_URL.replace('/api', '')}/uploads/books/${fileName}`;
        
        // Buat link download dan trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${book.title}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download count di backend
        await fetchAPI(`/books/${bookId}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Complete download setelah sebentar
        setTimeout(() => {
            completeDownload(book);
        }, 1000);
        
    } catch (error) {
        console.error('Error downloading book:', error);
        alert('Gagal mendownload buku: ' + error.message);
        // Hide progress jika error
        document.getElementById('downloadProgress')?.remove();
    }
}

// Function for direct download from preview with loading state
function directDownloadFromPreview() {
    // Validasi null check untuk previewState.currentBook
    if (!previewState) {
        console.error('Error: previewState is not initialized');
        alert('Terjadi kesalahan sistem. Silakan refresh halaman.');
        return;
    }
    
    if (!previewState.currentBook) {
        console.error('Error: previewState.currentBook is null or undefined');
        alert('Tidak ada buku yang sedang dipratinjau. Silakan pilih buku terlebih dahulu.');
        return;
    }
    
    if (!previewState.currentBook.id) {
        console.error('Error: previewState.currentBook.id is missing');
        alert('ID buku tidak valid. Silakan coba lagi.');
        return;
    }
    
    // Add loading state to download button
    const downloadBtn = document.querySelector('#previewModal .bg-primary');
    if (downloadBtn) {
        const originalContent = downloadBtn.innerHTML;
        downloadBtn.innerHTML = `
            <span class="flex items-center justify-center space-x-2">
                <div class="ripple-container text-current">
                    <div class="w-3 h-3 bg-current rounded-full"></div>
                    <div class="ripple-circle animate-ripple"></div>
                </div>
                <span>Memproses...</span>
            </span>
        `;
        downloadBtn.disabled = true;
        downloadBtn.classList.add('opacity-75', 'cursor-not-allowed');
        
        // Restore button after a delay
        setTimeout(() => {
            downloadBtn.innerHTML = originalContent;
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }, 2000);
    }
    
    // Simpan bookId sebelum hidePreview() yang akan mereset currentBook
    const bookId = previewState.currentBook.id;
    hidePreview();
    directDownload(bookId);
}

// Function to show download progress with enhanced animations
function showDownloadProgress(book) {
    // Create an enhanced progress indicator with micro-interactions
    const progressHtml = `
        <div id="downloadProgress" class="fixed inset-0 bg-neutral/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div class="bg-white rounded-xl max-w-md w-full shadow-2xl p-6 transform animate-scale-in">
                <div class="text-center">
                    <div class="inline-block rounded-full h-20 w-20 bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center mb-4 animate-pulse-slow">
                        <div class="ripple-container text-primary">
                            <div class="w-8 h-8 bg-primary rounded-full"></div>
                            <div class="ripple-circle animate-ripple"></div>
                            <div class="ripple-circle animate-ripple" style="animation-delay: 0.3s;"></div>
                        </div>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-neutral animate-fade-in-up">Mengunduh Buku</h3>
                    <p class="text-sm text-gray-600 mb-4 animate-fade-in-up" style="animation-delay: 0.1s">${book.title}</p>
                    <div class="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden animate-fade-in-up" style="animation-delay: 0.2s">
                        <div class="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full animate-progress-bar transition-all duration-1000 ease-out" style="width: 0%"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2 animate-fade-in-up" style="animation-delay: 0.3s">Mohon tunggu sebentar...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', progressHtml);
    
    // Animate progress bar
    setTimeout(() => {
        const progressBar = document.querySelector('.animate-progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }
    }, 100);
}

// Function to complete download and show post-download modal
function completeDownload(book) {
    // Remove progress indicator
    const progressElement = document.getElementById('downloadProgress');
    if (progressElement) {
        progressElement.remove();
    }
    
    // Update downloaded book title in modal
    const titleElement = document.getElementById('downloadedBookTitle');
    if (titleElement) {
        titleElement.textContent = `"${book.title}" telah berhasil diunduh`;
    }
    
    // Show post-download donation modal
    showPostDownloadModal();
    
    // Download history functionality removed - only available in admin dashboard
}

// Function to show post-download donation modal
function showPostDownloadModal() {
    const modal = document.getElementById('postDownloadDonationModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Function to hide post-download donation modal
function hidePostDownloadModal() {
    const modal = document.getElementById('postDownloadDonationModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Function for quick donate buttons
function quickDonate(amount) {
    setAmount(amount);
    hidePostDownloadModal();
    showDonationModal();
}

// Function to show donation modal (existing payment modal)
function showDonationModal(book = null) {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('hidden');
    
    // Update judul modal berdasarkan konteks
    const modalTitle = modal.querySelector('h2');
    if (book || state.currentBook) {
        // Jika ada buku spesifik, gunakan judul buku
        const currentBook = book || state.currentBook;
        modalTitle.textContent = currentBook.title;
    } else {
        // Jika donasi umum dari header, gunakan judul umum
        modalTitle.textContent = 'Dukung Ikayama';
    }
    
    resetModal();
}

// Function to add book to download history
// Download history functionality removed - only available in admin dashboard

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
// Fungsi untuk share buku
function copyBookUrl(bookId) {
    const book = state.books.find(b => b.id === bookId);
    if (!book) return;
    
    // Buat URL yang langsung membuka preview buku
    const bookUrl = `${window.location.origin}?preview=${bookId}`;
    
    // Copy URL ke clipboard
    navigator.clipboard.writeText(bookUrl).then(() => {
        showCopySuccess();
    }).catch(err => {
        console.error('Failed to copy URL: ', err);
        showManualCopy(bookUrl);
    });
}

// Fungsi untuk copy URL dari preview modal
function copyBookUrlFromPreview() {
    if (!previewState.currentBook) {
        alert('Tidak ada buku yang sedang dipratinjau');
        return;
    }
    
    const bookId = previewState.currentBook.id;
    const bookUrl = `${window.location.origin}?preview=${bookId}`;
    
    // Copy URL ke clipboard
    navigator.clipboard.writeText(bookUrl).then(() => {
        showCopySuccess();
    }).catch(err => {
        console.error('Failed to copy URL: ', err);
        showManualCopy(bookUrl);
    });
}

// Fallback share function
function fallbackShare(text) {
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        // Show success message
        showShareSuccess();
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Show manual copy dialog
        showManualCopy(text);
    });
}

// Show copy success message
function showCopySuccess() {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    message.textContent = 'Link buku berhasil disalin ke clipboard!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Show manual copy dialog
function showManualCopy(text) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 class="text-lg font-semibold mb-4">Copy Link Buku</h3>
            <textarea class="w-full h-32 p-3 border rounded-lg mb-4 text-sm" readonly>${text}</textarea>
            <div class="flex gap-2">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                    Tutup
                </button>
                <button onclick="navigator.clipboard.writeText('${text.replace(/'/g, "\\'")}'').then(() => { showCopySuccess(); this.parentElement.parentElement.parentElement.remove(); })" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                    Copy
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Check for preview parameter in URL
function checkForPreviewParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const previewId = urlParams.get('preview');
    
    if (previewId) {
        // Wait for books to load, then show preview
        const checkBooks = setInterval(() => {
            if (state.books.length > 0) {
                clearInterval(checkBooks);
                const bookId = parseInt(previewId);
                const book = state.books.find(b => b.id === bookId);
                if (book) {
                    showPreview(bookId);
                    // Remove the parameter from URL without refreshing
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        }, 100);
    }
}

// Fungsi search
function searchBooks(query) {
    state.searchQuery = query.toLowerCase().trim();
    
    if (!state.searchQuery) {
        state.filteredBooks = [];
        updateSearchResults(state.books.length, false);
        updateBooksUI();
        return;
    }
    
    state.filteredBooks = state.books.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(state.searchQuery);
        const authorMatch = book.author.toLowerCase().includes(state.searchQuery);
        const synopsisMatch = book.synopsis && book.synopsis.toLowerCase().includes(state.searchQuery);
        const tagsMatch = book.tags && book.tags.some(tag => tag.toLowerCase().includes(state.searchQuery));
        
        return titleMatch || authorMatch || synopsisMatch || tagsMatch;
    });
    
    updateSearchResults(state.filteredBooks.length, true);
    updateBooksUI();
}

// Update search results display
function updateSearchResults(count, isSearching) {
    const searchResults = document.getElementById('searchResults');
    const searchCount = document.getElementById('searchCount');
    const clearButton = document.getElementById('clearSearch');
    
    if (isSearching) {
        searchResults.classList.remove('hidden');
        searchCount.textContent = `Ditemukan ${count} buku`;
        clearButton.classList.remove('hidden');
    } else {
        searchResults.classList.add('hidden');
        clearButton.classList.add('hidden');
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    searchBooks('');
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    
    if (searchInput) {
        // Debounce search input
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchBooks(e.target.value);
            }, 300);
        });
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', clearSearch);
    }
}

// Listen for payment messages from payment window
window.addEventListener('message', function(event) {
    // Verify origin for security
    if (event.origin !== window.location.origin) {
        return;
    }
    
    const data = event.data;
    
    if (data.type === 'PAYMENT_SUCCESS') {
        console.log('Payment success received:', data);
        handlePaymentSuccess();
    } else if (data.type === 'PAYMENT_CANCELLED') {
        console.log('Payment cancelled received:', data);
        const orderId = localStorage.getItem('paymentOrderId');
        handlePaymentCancelled(orderId);
    } else if (data.type === 'PAYMENT_RETRY') {
        console.log('Payment retry received:', data);
        // Redirect back to email step for retry
        showStep('emailStep');
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            const emailInput = document.getElementById('userEmail');
            if (emailInput) {
                emailInput.value = savedEmail;
            }
        }
    }
});