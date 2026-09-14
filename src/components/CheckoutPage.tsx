import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShippingAddress, PaymentMethod } from '../types';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  Building,
  CheckCircle2,
  Lock,
  Box,
  Gift,
  Tag,
  Sparkles,
  MapPin,
  QrCode,
  Smartphone,
  Loader2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import {
  fetchRazorpayConfig,
  initiateRazorpayCheckout,
  RazorpayConfigResponse,
} from '../services/razorpayService';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi (NCR)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotalUSD,
    formatPrice,
    giftWrapping,
    giftNote,
    placeOrder,
    setCurrentView,
  } = useStore();

  const [step, setStep] = useState<'details' | 'payment'>('details');

  // Address State with Indian domestic details
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.in',
    addressLine1: '#42/1, 4th Cross, 100ft Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
    phone: '+91 98450 12345',
  });

  // Saved Indian addresses presets
  const savedAddresses: ShippingAddress[] = [
    {
      fullName: 'Aarav Sharma (Home)',
      email: 'aarav.sharma@example.in',
      addressLine1: '#42/1, 4th Cross, 100ft Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      phone: '+91 98450 12345',
    },
    {
      fullName: 'Aarav Sharma (Maker Studio)',
      email: 'aarav@makerhub.in',
      addressLine1: 'Unit 304, Prestige Tech Park, Marathahalli-Sarjapur Ring Rd',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      country: 'India',
      phone: '+91 98800 67890',
    },
  ];

  // Shipping Method
  const standardShippingFee = cartSubtotalUSD >= 999 ? 0 : 99;
  const [shippingFee, setShippingFee] = useState<number>(standardShippingFee);
  const [shippingType, setShippingType] = useState<'standard' | 'priority' | 'pickup'>('standard');

  // Payment State - Default to Razorpay Indian Gateway
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [upiId, setUpiId] = useState('aarav@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('523');

  // Razorpay Gateway State
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [razorpayError, setRazorpayError] = useState<string | null>(null);
  const [razorpayConfig, setRazorpayConfig] = useState<RazorpayConfigResponse | null>(null);

  React.useEffect(() => {
    fetchRazorpayConfig()
      .then(setRazorpayConfig)
      .catch((err) => console.warn('Razorpay config load notice:', err));
  }, []);

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'URPRINT10' || code === 'FORGE10') {
      const disc = Number((cartSubtotalUSD * 0.1).toFixed(0));
      setDiscountAmount(disc);
      setPromoApplied(true);
    } else if (code === 'INDIA3D' || code === 'NAMASTE') {
      const disc = Math.min(150, cartSubtotalUSD);
      setDiscountAmount(disc);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid coupon. Use "URPRINT10" for 10% off or "INDIA3D" for ₹150 off!');
    }
  };

  const giftFee = giftWrapping ? 99 : 0;
  const totalINR = Math.max(0, cartSubtotalUSD + shippingFee + giftFee - discountAmount);

  const handleRazorpayPayment = () => {
    if (!address.fullName.trim() || !address.addressLine1.trim() || !address.postalCode.trim()) {
      setStep('details');
      return;
    }

    setIsProcessingRazorpay(true);
    setRazorpayError(null);

    initiateRazorpayCheckout({
      amountINR: totalINR,
      customer: {
        name: address.fullName,
        email: address.email,
        phone: address.phone,
      },
      orderNotes: {
        city: address.state,
        pincode: address.postalCode,
        hub: 'UrPrint Slicing Grid',
      },
      onSuccess: (result) => {
        setIsProcessingRazorpay(false);
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
        });

        placeOrder({
          items: cart,
          subtotal: cartSubtotalUSD,
          shippingFee,
          taxAmount: 0,
          giftWrappingFee: giftFee,
          discountAmount,
          total: totalINR,
          currency: 'INR',
          shippingAddress: address,
          paymentMethod: 'razorpay',
          razorpayPaymentId: result.paymentId,
          razorpayOrderId: result.orderId,
          razorpaySignature: result.signature,
          paymentStatus: 'paid',
          giftNote: giftWrapping ? giftNote : undefined,
        });
      },
      onError: (errMsg) => {
        setIsProcessingRazorpay(false);
        setRazorpayError(errMsg || 'Razorpay payment was not completed.');
      },
      onDismiss: () => {
        setIsProcessingRazorpay(false);
      },
    });
  };

  const handleSubmitOrder = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
      return;
    }

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    placeOrder({
      items: cart,
      subtotal: cartSubtotalUSD,
      shippingFee,
      taxAmount: 0,
      giftWrappingFee: giftFee,
      discountAmount,
      total: totalINR,
      currency: 'INR',
      shippingAddress: address,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'cod' : 'pending',
      giftNote: giftWrapping ? giftNote : undefined,
    });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center p-6 text-center">
        <Box className="w-16 h-16 text-[#8E9299] mb-3" />
        <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">Your Cart is Empty</h2>
        <p className="text-xs text-[#8E9299] max-w-sm mt-1 mb-4">
          Add 3D printed models or upload your custom STL file to proceed to checkout.
        </p>
        <button
          onClick={() => setCurrentView('catalog')}
          className="bg-[#2C2C2C] text-white font-bold text-xs py-3 px-6 rounded-xl hover:bg-[#444444]"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F6F2] min-h-screen font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title & Steps */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-6">
          <div>
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#5A5A40]">
              Pan-India Domestic Checkout
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#2C2C2C]">Order Slicing & Dispatch</h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`px-3 py-1.5 rounded-full ${
                step === 'details'
                  ? 'bg-[#2C2C2C] text-[#D1CFB9]'
                  : 'bg-[#E5E2D9] text-[#2C2C2C]'
              }`}
            >
              1. Delivery Address & Shipping
            </span>
            <span>→</span>
            <span
              className={`px-3 py-1.5 rounded-full ${
                step === 'payment'
                  ? 'bg-[#2C2C2C] text-[#D1CFB9]'
                  : 'bg-[#E5E2D9] text-[#2C2C2C]'
              }`}
            >
              2. UPI / Card / COD Payment
            </span>
          </div>
        </div>

        {/* Domestic shipping notice badge */}
        <div className="bg-[#EAE8E0] border border-[#D1CFB9] text-[#2C2C2C] p-3.5 rounded-2xl flex items-center gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-[#5A5A40] shrink-0" />
          <p>
            <span className="font-bold">Domestic Indian Dispatch Only:</span> Orders are manufactured at our ISO-certified additive hubs in Bengaluru, Mumbai, and Delhi NCR with 100% genuine filament and Pan-India courier coverage across all 19,000+ PIN codes.
          </p>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Forms */}
          <div className="lg:col-span-7 space-y-6">
            {step === 'details' ? (
              <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-6">
                {/* Saved Address Quick Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#5A5A40]" />
                    <span>Saved Indian Address Book:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedAddresses.map((sa, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAddress(sa)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          address.addressLine1 === sa.addressLine1
                            ? 'border-[#5A5A40] bg-[#F7F6F2] font-bold text-[#2C2C2C]'
                            : 'border-[#E5E2D9] hover:border-[#8E9299] text-[#4A4A4A]'
                        }`}
                      >
                        <p className="font-bold">{sa.fullName}</p>
                        <p className="text-[11px] text-[#8E9299] truncate">
                          {sa.addressLine1}, {sa.city} - {sa.postalCode}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shipping Address Form */}
                <div className="space-y-4 pt-2 border-t border-[#E5E2D9]">
                  <h3 className="font-bold text-[#2C2C2C] text-sm">Delivery Address Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">
                        Full Name (Recipient) *
                      </label>
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                        placeholder="e.g. Aarav Sharma"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">
                        Mobile Phone (+91) *
                      </label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                        placeholder="+91 98450 XXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">
                      Email Address (for Track & Trace updates) *
                    </label>
                    <input
                      type="email"
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                      placeholder="name@example.in"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">
                      Flat / House No. / Building / Street Address *
                    </label>
                    <input
                      type="text"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                      placeholder="e.g. Flat 301, Tower B, Indiranagar"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">
                        City / District *
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                        placeholder="e.g. Bengaluru"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">
                        State / UT *
                      </label>
                      <select
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">
                        PIN Code (6 Digits) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value.replace(/\D/g, '') })}
                        className="w-full p-2.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs font-mono text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                        placeholder="560038"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Method Options */}
                <div className="space-y-3 pt-2 border-t border-[#E5E2D9]">
                  <h3 className="font-bold text-[#2C2C2C] text-sm">Select Delivery Method</h3>

                  <div className="space-y-2">
                    {/* Standard Courier */}
                    <label
                      onClick={() => {
                        setShippingFee(cartSubtotalUSD >= 999 ? 0 : 99);
                        setShippingType('standard');
                      }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${
                        shippingType === 'standard'
                          ? 'border-[#5A5A40] bg-[#F7F6F2] font-bold shadow-xs'
                          : 'border-[#E5E2D9] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-[#5A5A40]" />
                        <div>
                          <p className="font-bold text-[#2C2C2C]">Standard Pan-India Express (3-4 Days)</p>
                          <p className="text-[11px] text-[#8E9299] font-normal">
                            Dispatched via BlueDart / Delhivery / India Post Speed Post.
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[#2C2C2C] font-bold">
                        {cartSubtotalUSD >= 999 ? 'FREE' : formatPrice(99)}
                      </span>
                    </label>

                    {/* Priority Air */}
                    <label
                      onClick={() => {
                        setShippingFee(199);
                        setShippingType('priority');
                      }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${
                        shippingType === 'priority'
                          ? 'border-[#5A5A40] bg-[#F7F6F2] font-bold shadow-xs'
                          : 'border-[#E5E2D9] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-[#5A5A40]" />
                        <div>
                          <p className="font-bold text-[#2C2C2C]">Priority Express Air (1-2 Days)</p>
                          <p className="text-[11px] text-[#8E9299] font-normal">
                            Top priority printer bed queue + priority morning air express flight.
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[#2C2C2C] font-bold">{formatPrice(199)}</span>
                    </label>

                    {/* Hub Pickup */}
                    <label
                      onClick={() => {
                        setShippingFee(0);
                        setShippingType('pickup');
                      }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${
                        shippingType === 'pickup'
                          ? 'border-[#5A5A40] bg-[#F7F6F2] font-bold shadow-xs'
                          : 'border-[#E5E2D9] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-[#5A5A40]" />
                        <div>
                          <p className="font-bold text-[#2C2C2C]">Local Additive Hub Self-Pickup</p>
                          <p className="text-[11px] text-[#8E9299] font-normal">
                            Ready in 2 hours at Bengaluru, Mumbai, Delhi, Hyderabad, or Pune hubs.
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-emerald-700 font-bold">FREE</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="w-full bg-[#2C2C2C] hover:bg-[#444444] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Payment (₹{totalINR.toLocaleString('en-IN')}) →</span>
                </button>
              </div>
            ) : (
              /* PAYMENT STEP */
              <div className="bg-white p-6 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
                  <div>
                    <h3 className="font-bold text-[#2C2C2C] text-sm">Select Indian Payment Method</h3>
                    <p className="text-[11px] text-[#8E9299]">Instant UPI, NetBanking, Domestic Cards or COD</p>
                  </div>
                  <button
                    onClick={() => setStep('details')}
                    className="text-xs text-[#5A5A40] font-semibold hover:underline"
                  >
                    ← Edit Address
                  </button>
                </div>

                {/* Payment Options */}
                <div className="space-y-2.5">
                  {/* Top Featured: Razorpay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`w-full p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#0c2340] bg-[#F0F4F8] font-bold text-[#0c2340] ring-1 ring-[#0c2340]'
                        : 'border-[#E5E2D9] hover:border-[#8E9299] text-[#2C2C2C] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0c2340] text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-[#3399cc]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0c2340]">Razorpay Gateway</span>
                          <span className="text-[10px] bg-[#3399cc]/15 text-[#0c2340] px-2 py-0.5 rounded-full font-mono font-bold">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-[11px] text-[#555] mt-0.5">
                          Instant UPI (GPay, PhonePe, Paytm), RuPay/Visa/MasterCard, 50+ Banks NetBanking, CRED & Wallets
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <span>Instant 0% Surcharge</span>
                    </div>
                  </button>

                  {/* Alternative Methods Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    {[
                      { id: 'upi', label: 'UPI Direct (VPA)', icon: Smartphone },
                      { id: 'card', label: 'Manual Card Entry', icon: CreditCard },
                      { id: 'apple_pay', label: 'Bank Portal', icon: Building },
                      { id: 'cod', label: 'Cash on Delivery', icon: Truck },
                    ].map((pm) => {
                      const IconComp = pm.icon;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                          className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                            paymentMethod === pm.id
                              ? 'border-[#5A5A40] bg-[#F7F6F2] font-bold text-[#2C2C2C] shadow-xs'
                              : 'border-[#E5E2D9] hover:border-[#8E9299] text-[#4A4A4A]'
                          }`}
                        >
                          <IconComp className="w-4 h-4 text-[#5A5A40] shrink-0" />
                          <span className="text-xs leading-tight">{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Razorpay Interface */}
                {paymentMethod === 'razorpay' && (
                  <div className="space-y-4 bg-[#F0F4F8]/70 p-5 rounded-2xl border border-[#D0DCE5]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D0DCE5] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="font-serif font-black text-sm text-[#0c2340] tracking-tight">
                          Razorpay <span className="text-[#3399cc] font-sans font-bold text-xs uppercase tracking-wider">Secure</span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">| RBI Authorized</span>
                      </div>

                      {/* Server Config Status */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-mono text-emerald-800 text-[10px] font-bold">
                          {razorpayConfig?.isConfigured
                            ? 'Live Gateway Connected'
                            : 'Test Sandbox Ready'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-white p-2.5 rounded-xl border border-[#D0DCE5] text-center">
                        <p className="font-bold text-[#0c2340]">UPI Apps</p>
                        <p className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#D0DCE5] text-center">
                        <p className="font-bold text-[#0c2340]">All Cards</p>
                        <p className="text-[10px] text-stone-500">RuPay, Visa, Master</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#D0DCE5] text-center">
                        <p className="font-bold text-[#0c2340]">NetBanking</p>
                        <p className="text-[10px] text-stone-500">50+ Indian Banks</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#D0DCE5] text-center">
                        <p className="font-bold text-[#0c2340]">Wallets</p>
                        <p className="text-[10px] text-stone-500">CRED, Amazon, Mobi</p>
                      </div>
                    </div>

                    {razorpayError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{razorpayError}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={isProcessingRazorpay}
                        onClick={handleRazorpayPayment}
                        className="w-full bg-[#0c2340] hover:bg-[#153a66] disabled:opacity-75 text-white font-bold text-sm py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        {isProcessingRazorpay ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-[#3399cc]" />
                            <span>Opening Razorpay Secure Window...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-[#3399cc]" />
                            <span>Pay ₹{totalINR.toLocaleString('en-IN')} with Razorpay</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-[10px] text-stone-500 font-mono">
                      <span>🔒 256-Bit SSL Encrypted</span>
                      <span>•</span>
                      <span>PCI-DSS Level 1 Compliant</span>
                      <span>•</span>
                      <span>Zero Storage of Card PINs</span>
                    </div>
                  </div>
                )}

                {/* UPI Interface */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E2D9]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#2C2C2C]">
                        Enter UPI ID / VPA
                      </label>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                        Instant 0% Convenience Fee
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank or 98450XXXXX@paytm"
                        className="flex-1 p-2.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                      />
                      <button
                        type="button"
                        className="px-3 bg-[#5A5A40] text-white text-xs font-bold rounded-lg hover:bg-[#737758]"
                      >
                        Verify UPI
                      </button>
                    </div>

                    {/* Quick UPI Apps Icons */}
                    <div className="pt-2 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] text-[#8E9299]">
                      <span>Supported:</span>
                      <span className="font-semibold text-[#2C2C2C]">Google Pay • PhonePe • Paytm • BHIM • Cred</span>
                    </div>
                  </div>
                )}

                {/* Card input */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E2D9]">
                    <div>
                      <label className="text-[11px] font-semibold text-[#2C2C2C] block mb-1">
                        Debit / Credit Card Number (RuPay, Visa, MasterCard)
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono text-[#2C2C2C]"
                        placeholder="4532 0000 0000 0000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#2C2C2C] block mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono text-[#2C2C2C]"
                          placeholder="12/28"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2C2C2C] block mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full p-2.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono text-[#2C2C2C]"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'apple_pay' && (
                  <div className="space-y-3 bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E2D9]">
                    <label className="text-xs font-bold text-[#2C2C2C] block">
                      Select Your Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E5E2D9] rounded-lg text-xs text-[#2C2C2C]"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                    </select>
                    <p className="text-[11px] text-[#8E9299]">
                      You will be redirected securely to your bank portal for OTP authentication.
                    </p>
                  </div>
                )}

                {/* Cash on Delivery */}
                {paymentMethod === 'cod' && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E2D9] text-xs text-[#2C2C2C] space-y-1">
                    <p className="font-bold text-[#5A5A40]">Cash on Delivery (COD) Available</p>
                    <p className="text-[11px] text-[#8E9299]">
                      Pay by Cash or UPI to the courier delivery agent when your 3D print parcel is delivered at your doorstep.
                    </p>
                  </div>
                )}

                {paymentMethod !== 'razorpay' && (
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    className="w-full bg-[#2C2C2C] hover:bg-[#444444] text-white font-bold text-sm py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-[#D1CFB9]" />
                    <span>Confirm & Place Order (₹{totalINR.toLocaleString('en-IN')})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#2C2C2C]">Order Summary</h3>

            {/* Cart Items Preview */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-10 h-10 rounded-lg bg-[#F7F6F2] overflow-hidden shrink-0 border border-[#E5E2D9]">
                      {item.product ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#2C2C2C] text-[#D1CFB9] font-mono text-[9px]">
                          STL
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-[#2C2C2C] truncate">
                        {item.product ? item.product.name : item.customQuote?.fileName}
                      </p>
                      <p className="text-[10px] text-[#8E9299]">
                        Qty: {item.quantity} • {item.selectedMaterial.name}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#2C2C2C] shrink-0">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <form onSubmit={applyPromo} className="space-y-2 pt-3 border-t border-[#E5E2D9]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. INDIA3D)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg text-xs font-mono uppercase text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                />
                <button
                  type="submit"
                  className="bg-[#2C2C2C] hover:bg-[#444444] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>

              {promoApplied && (
                <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Coupon applied! You saved {formatPrice(discountAmount)}</span>
                </p>
              )}

              {promoError && <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>}
            </form>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs font-mono pt-3 border-t border-[#E5E2D9]">
              <div className="flex justify-between text-[#8E9299]">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#2C2C2C]">{formatPrice(cartSubtotalUSD)}</span>
              </div>

              <div className="flex justify-between text-[#8E9299]">
                <span>Pan-India Delivery</span>
                <span className="font-bold text-[#2C2C2C]">
                  {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                </span>
              </div>

              {giftWrapping && (
                <div className="flex justify-between text-[#8E9299]">
                  <span>Eco Gift Box Packaging</span>
                  <span className="font-bold text-[#2C2C2C]">{formatPrice(giftFee)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#8E9299] text-[10px]">
                <span>GST & Additive Slicing</span>
                <span>Included in all prices</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t border-[#E5E2D9] flex justify-between font-serif font-bold text-xl text-[#2C2C2C]">
              <span>Final Total (INR)</span>
              <span className="text-[#5A5A40]">₹{totalINR.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 text-center text-[10px] text-[#8E9299] space-y-1">
              <p>🔒 256-Bit SSL Encrypted Indian Payment Gateway</p>
              <p>100% Zero-Defect Print Guarantee with free reprint on flaws.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
