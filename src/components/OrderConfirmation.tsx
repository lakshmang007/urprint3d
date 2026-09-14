import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Box, Truck, Calendar, MapPin, Printer, ShieldCheck } from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
  const { lastOrder, formatPrice, setCurrentView } = useStore();

  if (!lastOrder) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
          <p className="font-serif text-lg font-bold text-stone-900">No recent order found</p>
          <button onClick={() => setCurrentView('catalog')} className="bg-stone-900 text-white font-bold text-xs py-2 px-4 rounded-xl">
            Browse Models
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { title: 'Order Sliced & Enqueued', done: true, current: false },
    { title: '3D Printing in Progress', done: true, current: true },
    { title: 'Post-Processing & Inspection', done: false, current: false },
    { title: 'Dispatched & Out for Delivery', done: false, current: false },
  ];

  return (
    <div className="bg-stone-50 min-h-screen font-sans py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Celebration Header Card */}
        <div className="bg-stone-900 text-white p-8 rounded-3xl text-center space-y-3 shadow-xl border border-stone-800">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
            Order Confirmed & Sent to Print Bed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
            Order <span className="font-mono font-bold text-amber-400">#{lastOrder.id}</span> has been sliced and dispatched to <span className="text-white font-bold">{lastOrder.printHubAssigned}</span>.
          </p>
        </div>

        {/* Live Print Progress Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-700" />
            <span>Print Production Timeline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  st.current
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs'
                    : st.done
                    ? 'border-stone-300 bg-stone-50 text-stone-800'
                    : 'border-stone-200 text-stone-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-amber-400 text-[10px] font-mono flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-[11px] leading-tight font-bold">{st.title}</p>
                </div>
                {st.current && (
                  <p className="text-[10px] text-amber-700 font-mono animate-pulse">● Active on Printer Bed #04</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Details & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Shipping Address */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2 text-xs">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Shipping Destination</span>
            </h4>
            <div className="text-stone-600 space-y-0.5">
              <p className="font-bold text-stone-900">{lastOrder.shippingAddress.fullName}</p>
              <p>{lastOrder.shippingAddress.addressLine1}</p>
              <p>{lastOrder.shippingAddress.city}, {lastOrder.shippingAddress.state} {lastOrder.shippingAddress.postalCode}</p>
              <p className="font-mono text-[10px] text-stone-400 pt-1">Phone: {lastOrder.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Delivery Estimate */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2 text-xs">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>Estimated Delivery Date</span>
            </h4>
            <p className="font-serif text-xl font-bold text-amber-800">{lastOrder.estimatedDeliveryDate}</p>
            <p className="text-stone-500 text-[11px]">Tracking Code: <span className="font-mono font-bold text-stone-900">{lastOrder.trackingNumber}</span></p>
            <p className="text-[10px] text-stone-400">Pan-India Courier Dispatch</p>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2 text-xs">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Payment Confirmation</span>
            </h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-[11px]">Amount Paid:</span>
                <span className="font-bold text-stone-900 font-mono text-sm">{formatPrice(lastOrder.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-[11px]">Gateway:</span>
                <span className="font-bold text-stone-800">
                  {lastOrder.paymentMethod === 'razorpay' ? 'Razorpay Secure' : lastOrder.paymentMethod.toUpperCase()}
                </span>
              </div>
              {lastOrder.razorpayPaymentId && (
                <div className="pt-1 border-t border-stone-100">
                  <span className="text-[10px] text-stone-400 block font-mono">Razorpay Txn ID:</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 break-all">
                    {lastOrder.razorpayPaymentId}
                  </span>
                </div>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                ✓ 256-bit Verified & Settled
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => setCurrentView('catalog')}
            className="bg-stone-900 text-white font-bold text-xs py-3 px-6 rounded-xl hover:bg-stone-800"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => setCurrentView('account')}
            className="bg-amber-600 text-white font-bold text-xs py-3 px-6 rounded-xl hover:bg-amber-500"
          >
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};
