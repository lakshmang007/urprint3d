import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import Razorpay from 'razorpay';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Razorpay client to prevent crashes if credentials are missing
let razorpayClient: Razorpay | null = null;

function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
}

// ==========================================
// API ROUTES FIRST
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Razorpay Gateway Config (returns public Key ID and configuration status)
app.get('/api/razorpay/config', (req, res) => {
  const isConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    isConfigured,
    currency: 'INR',
    merchantName: 'UrPrint-3D models',
  });
});

// Razorpay Create Order Endpoint
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount in INR is required' });
    }

    // Razorpay requires amount in smallest currency unit (Paise for INR, 1 INR = 100 Paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    const rzp = getRazorpay();

    if (!rzp) {
      // Graceful fallback for preview / testing before keys are added in Secrets UI
      const mockOrderId = `order_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      console.log(`[Razorpay] Keys not set. Generated test order: ${mockOrderId} (₹${amount})`);
      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        isDemoMode: true,
        message: 'Running in Razorpay Test Sandbox Mode. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Settings for live capture.',
      });
    }

    const orderOptions = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now().toString(36)}`,
      notes: notes || {},
    };

    const order = await rzp.orders.create(orderOptions);

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      isDemoMode: false,
    });
  } catch (error: any) {
    console.error('[Razorpay] Order creation failed:', error);
    return res.status(500).json({
      error: 'Failed to initiate Razorpay order',
      details: error?.message || 'Internal payment gateway error',
    });
  }
});

// Razorpay Verify Payment Signature Endpoint
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Order ID and Payment ID are required' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If running in sandbox/test mode without production secret
    if (!keySecret) {
      console.log(`[Razorpay] Test payment verified: ${razorpay_payment_id} for order ${razorpay_order_id}`);
      return res.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        isDemoMode: true,
      });
    }

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      console.log(`[Razorpay] Payment verified successfully: ${razorpay_payment_id}`);
      return res.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        isDemoMode: false,
      });
    } else {
      console.warn(`[Razorpay] Signature mismatch for payment: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid payment signature. Verification failed.',
      });
    }
  } catch (error: any) {
    console.error('[Razorpay] Payment verification error:', error);
    return res.status(500).json({
      error: 'Failed to verify payment',
      details: error?.message,
    });
  }
});

// ==========================================
// VITE MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UrPrint-3D server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
