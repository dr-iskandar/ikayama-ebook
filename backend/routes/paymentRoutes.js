const express = require('express');
const router = express.Router();
const path = require('path');
const axios = require('axios');

// PVS Payment Gateway Service URL
const PVS_PG_URL = process.env.PVS_PG_URL || 'http://localhost:8990';

// Payment creation endpoint - proxy to pvs_pg service
router.post('/create', async (req, res) => {
    console.log('=== PAYMENT CREATE REQUEST ===');
    console.log('PVS_PG_URL:', PVS_PG_URL);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        // Forward request to pvs_pg service
        console.log('Making request to:', `${PVS_PG_URL}/payment/create`);
        const response = await axios.post(`${PVS_PG_URL}/payment/create`, req.body, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000, // 5 second timeout for testing
            family: 4 // Force IPv4
        });
        
        console.log('PVS_PG Response:', response.data);
        
        // Forward the response back to client
        res.status(response.status).json(response.data);
        
    } catch (error) {
        console.error('Payment creation error:', error.message);
        
        if (error.response) {
            // PVS_PG service responded with error
            console.error('PVS_PG Error Response:', error.response.data);
            res.status(error.response.status).json({
                success: false,
                message: 'Payment gateway error',
                error: error.response.data
            });
        } else if (error.request) {
            // No response from PVS_PG service
            console.error('No response from PVS_PG service');
            res.status(502).json({
                success: false,
                message: 'Payment gateway service unavailable',
                error: 'Service connection failed'
            });
        } else {
            // Other error
            console.error('Payment request setup error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
});

// Payment update endpoint - proxy to pvs_pg service
router.post('/update', async (req, res) => {
    console.log('=== PAYMENT UPDATE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        // Forward request to pvs_pg service
        const response = await axios.post(`${PVS_PG_URL}/payment/update`, req.body, {
            headers: {
                'Content-Type': 'application/json',
                ...req.headers
            },
            timeout: 30000
        });
        
        console.log('PVS_PG Update Response:', response.data);
        res.status(response.status).json(response.data);
        
    } catch (error) {
        console.error('Payment update error:', error.message);
        
        if (error.response) {
            res.status(error.response.status).json({
                success: false,
                message: 'Payment gateway error',
                error: error.response.data
            });
        } else {
            res.status(502).json({
                success: false,
                message: 'Payment gateway service unavailable',
                error: 'Service connection failed'
            });
        }
    }
});

// Payment callback endpoint
router.post('/callback', (req, res) => {
    console.log('=== PAYMENT CALLBACK RECEIVED ===');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query params:', req.query);
    console.log('URL:', req.url);
    
    // Extract payment data from callback
    const paymentData = req.body;
    
    // Determine redirect URL based on payment status
    let redirectUrl = '/payment/success';
    
    if (paymentData) {
        const status = paymentData.payment_status || paymentData.transaction_status || paymentData.status;
        console.log('Payment status detected:', status);
        
        if (status === 'failed' || status === 'failure' || status === 'error' || status === 'cancel' || status === 'cancelled') {
            redirectUrl = '/payment/failed';
            console.log('Redirecting to failed page');
        } else if (status === 'success' || status === 'settlement' || status === 'capture') {
            redirectUrl = '/payment/success';
            console.log('Redirecting to success page');
        } else {
            console.log('Unknown status, defaulting to success page');
        }
    }
    
    // Send response back to payment gateway
    res.status(200).json({
        success: true,
        message: 'Callback received successfully',
        redirect_url: redirectUrl
    });
    
    console.log('=== CALLBACK PROCESSING COMPLETE ===');
});

// Payment gateway redirect handler (GET and POST)
router.get('/redirect', (req, res) => {
    console.log('=== PAYMENT REDIRECT GET RECEIVED ===');
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    
    const status = req.query.status || req.query.payment_status || req.query.transaction_status;
    console.log('Redirect status:', status);
    
    if (status === 'failed' || status === 'failure' || status === 'error' || status === 'cancel' || status === 'cancelled') {
        console.log('Redirecting to failed page');
        return res.redirect('/payment/failed');
    } else if (status === 'success' || status === 'settlement' || status === 'capture') {
        console.log('Redirecting to success page');
        return res.redirect('/payment/success');
    } else {
        console.log('Unknown status, redirecting to cancelled page');
        return res.redirect('/payment/cancelled');
    }
});

router.post('/redirect', (req, res) => {
    console.log('=== PAYMENT REDIRECT POST RECEIVED ===');
    console.log('Body:', req.body);
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    
    const status = req.body.payment_status || req.body.transaction_status || req.body.status || 
                  req.query.status || req.query.payment_status || req.query.transaction_status;
    console.log('Redirect status:', status);
    
    if (status === 'failed' || status === 'failure' || status === 'error' || status === 'cancel' || status === 'cancelled') {
        console.log('Redirecting to failed page');
        return res.redirect('/payment/failed');
    } else if (status === 'success' || status === 'settlement' || status === 'capture') {
        console.log('Redirecting to success page');
        return res.redirect('/payment/success');
    } else {
        console.log('Unknown status, redirecting to cancelled page');
        return res.redirect('/payment/cancelled');
    }
});

// Payment success page
router.get('/success', (req, res) => {
    // Serve a success page that will communicate with parent window
    const successPageHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pembayaran Berhasil - Ikayama Katalog</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
            }
            .success-container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
            }
            .success-icon {
                color: #4CAF50;
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .success-title {
                color: #333;
                margin-bottom: 1rem;
            }
            .success-message {
                color: #666;
                margin-bottom: 2rem;
            }
            .close-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
            }
            .close-btn:hover {
                background: #45a049;
            }
        </style>
    </head>
    <body>
        <div class="success-container">
            <div class="success-icon">✓</div>
            <h2 class="success-title">Pembayaran Berhasil!</h2>
            <p class="success-message">
                Terima kasih atas pembayaran Anda. Download akan dimulai secara otomatis.
            </p>
            <button class="close-btn" onclick="closeWindow()">Tutup</button>
        </div>
        
        <script>
            // Get order ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('order_id');
            
            // Send success message to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'PAYMENT_SUCCESS',
                    orderId: orderId,
                    payment_status: 'success'
                }, '*');
            }
            
            function closeWindow() {
                if (window.opener) {
                    window.close();
                } else {
                    // If no parent window, redirect to main site
                    window.location.href = '/';
                }
            }
            
            // Auto close after 5 seconds
            setTimeout(() => {
                closeWindow();
            }, 5000);
        </script>
    </body>
    </html>
    `;
    
    res.send(successPageHtml);
});

// Payment failed page
router.get('/failed', (req, res) => {
    const failedPageHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pembayaran Gagal - Ikayama Katalog</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
            }
            .failed-container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
            }
            .failed-icon {
                color: #f44336;
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .failed-title {
                color: #333;
                margin-bottom: 1rem;
            }
            .failed-message {
                color: #666;
                margin-bottom: 2rem;
            }
            .retry-btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
                margin-right: 1rem;
            }
            .close-btn {
                background: #666;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
            }
        </style>
    </head>
    <body>
        <div class="failed-container">
            <div class="failed-icon">✗</div>
            <h2 class="failed-title">Pembayaran Gagal</h2>
            <p class="failed-message">
                Pembayaran Anda tidak dapat diproses. Silakan coba lagi.
            </p>
            <button class="retry-btn" onclick="retryPayment()">Coba Lagi</button>
            <button class="close-btn" onclick="closeWindow()">Tutup</button>
        </div>
        
        <script>
            function retryPayment() {
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'PAYMENT_RETRY'
                    }, '*');
                    window.close();
                } else {
                    window.location.href = '/';
                }
            }
            
            function closeWindow() {
                if (window.opener) {
                    window.close();
                } else {
                    window.location.href = '/';
                }
            }
        </script>
    </body>
    </html>
    `;
    
    res.send(failedPageHtml);
});

// Payment cancelled page
router.get('/cancelled', (req, res) => {
    const cancelledPageHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pembayaran Dibatalkan - Ikayama Katalog</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
            }
            .cancelled-container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
            }
            .cancelled-icon {
                color: #ff9800;
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .cancelled-title {
                color: #333;
                margin-bottom: 1rem;
            }
            .cancelled-message {
                color: #666;
                margin-bottom: 2rem;
            }
            .home-btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
            }
            .home-btn:hover {
                background: #1976D2;
            }
        </style>
    </head>
    <body>
        <div class="cancelled-container">
            <div class="cancelled-icon">⚠</div>
            <h2 class="cancelled-title">Pembayaran Dibatalkan</h2>
            <p class="cancelled-message">
                Pembayaran Anda telah dibatalkan. Anda akan diarahkan ke halaman utama.
            </p>
            <button class="home-btn" onclick="goToHome()">Kembali ke Beranda</button>
        </div>
        
        <script>
            function goToHome() {
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'PAYMENT_CANCELLED'
                    }, '*');
                    window.close();
                } else {
                    // If no parent window, redirect to main site
                    window.location.href = '/';
                }
            }
            
            // Auto redirect to home after 3 seconds
            setTimeout(() => {
                goToHome();
            }, 3000);
        </script>
    </body>
    </html>
    `;
    
    res.send(cancelledPageHtml);
});

module.exports = router;