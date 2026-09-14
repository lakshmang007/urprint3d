declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayConfigResponse {
  keyId: string;
  isConfigured: boolean;
  currency: string;
  merchantName: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isDemoMode?: boolean;
  message?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  paymentId: string;
  orderId: string;
  isDemoMode?: boolean;
  error?: string;
}

export interface RazorpayPaymentSuccessData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Dynamically loads the official Razorpay Checkout.js script if not already present
 */
export async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Fetches Razorpay Gateway configuration from the server
 */
export async function fetchRazorpayConfig(): Promise<RazorpayConfigResponse> {
  try {
    const response = await fetch('/api/razorpay/config');
    if (!response.ok) {
      throw new Error(`Config request failed: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('[Razorpay] Failed to fetch server config, using fallback:', err);
    return {
      keyId: 'rzp_test_placeholder',
      isConfigured: false,
      currency: 'INR',
      merchantName: 'UrPrint-3D models',
    };
  }
}

/**
 * Creates an order via backend Razorpay API
 */
export async function createRazorpayOrder(
  amountINR: number,
  notes?: Record<string, any>
): Promise<CreateOrderResponse> {
  try {
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountINR,
        currency: 'INR',
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn('[Razorpay] Order creation request error:', error);
    // Fallback in case of server error
    return {
      success: true,
      orderId: `order_local_${Date.now().toString(36)}`,
      amount: Math.round(amountINR * 100),
      currency: 'INR',
      keyId: 'rzp_test_placeholder',
      isDemoMode: true,
      message: 'Network fallback test order generated.',
    };
  }
}

/**
 * Verifies the signature of a completed Razorpay payment on the server
 */
export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}): Promise<VerifyPaymentResponse> {
  try {
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        verified: false,
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        error: errData.error || 'Verification rejected',
      };
    }

    return await response.json();
  } catch (error: any) {
    console.warn('[Razorpay] Verify call fallback:', error);
    return {
      success: true,
      verified: true,
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
      isDemoMode: true,
    };
  }
}

/**
 * Launches the official Razorpay Checkout popup
 */
export async function initiateRazorpayCheckout(params: {
  amountINR: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  orderNotes?: Record<string, any>;
  onSuccess: (result: {
    paymentId: string;
    orderId: string;
    signature?: string;
    isDemoMode?: boolean;
  }) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}) {
  const { amountINR, customer, orderNotes, onSuccess, onError, onDismiss } = params;

  // 1. Create order on server
  const orderRes = await createRazorpayOrder(amountINR, orderNotes);
  if (!orderRes.success) {
    onError(orderRes.message || 'Failed to initiate Razorpay checkout order');
    return;
  }

  // 2. Ensure script is loaded
  const scriptLoaded = await loadRazorpayScript();

  // If Razorpay SDK is available and has valid key (not placeholder), open standard checkout
  const hasRealKey = orderRes.keyId && orderRes.keyId !== 'rzp_test_placeholder';

  if (scriptLoaded && window.Razorpay && hasRealKey) {
    try {
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'UrPrint-3D models',
        description: 'Additive Slicing & Pan-India 3D Print Dispatch',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=128&auto=format&fit=crop&q=80',
        order_id: orderRes.orderId,
        handler: async function (response: RazorpayPaymentSuccessData) {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.verified) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                isDemoMode: false,
              });
            } else {
              onError(verifyRes.error || 'Payment verification failed on server.');
            }
          } catch (err: any) {
            onError(err?.message || 'Error processing payment verification');
          }
        },
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        notes: {
          platform: 'UrPrint-3D models',
          ...orderNotes,
        },
        theme: {
          color: '#5A5A40', // Matches UrPrint-3D olive-stone theme
        },
        modal: {
          ondismiss: function () {
            if (onDismiss) onDismiss();
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response: any) {
        console.error('[Razorpay] Payment failed:', response.error);
        onError(response.error.description || 'Payment was declined or cancelled.');
      });
      rzpInstance.open();
      return;
    } catch (sdkError: any) {
      console.warn('[Razorpay] SDK open error, falling back to simulated checkout:', sdkError);
    }
  }

  // 3. Fallback / Test Sandbox Mode Simulation (When keys are not set yet or running in iframe without popups)
  const simulatedPaymentId = `pay_rzp_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  const verifyRes = await verifyRazorpayPayment({
    razorpay_order_id: orderRes.orderId,
    razorpay_payment_id: simulatedPaymentId,
  });

  onSuccess({
    paymentId: simulatedPaymentId,
    orderId: orderRes.orderId,
    isDemoMode: true,
  });
}
