import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, Gift, ShieldCheck, Sparkles, Box } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotalUSD,
    formatPrice,
    setCurrentView,
    giftWrapping,
    setGiftWrapping,
    giftNote,
    setGiftNote,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const freeShippingThresholdINR = 999.0;
  const progressPercent = Math.min(100, (cartSubtotalUSD / freeShippingThresholdINR) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdINR - cartSubtotalUSD);
  const giftPackagingFee = 99.0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* 1. Drawer Header */}
          <div className="p-5 border-b border-[#E5E2D9] bg-[#F7F6F2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#5A5A40]" />
              <h2 className="font-serif text-lg font-bold text-[#2C2C2C]">Your Print Cart</h2>
              <span className="text-xs bg-[#E5E2D9] text-[#2C2C2C] font-mono font-bold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-[#8E9299] hover:text-[#2C2C2C] rounded-full hover:bg-[#E5E2D9]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Threshold Bar */}
          <div className="bg-[#F2F0EA] px-5 py-3 border-b border-[#E5E2D9] text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#2C2C2C] font-medium">
                Add <span className="font-bold">{formatPrice(remainingForFreeShipping)}</span> more for <span className="font-bold text-[#5A5A40]">FREE Pan-India Delivery</span>!
              </p>
            ) : (
              <p className="text-[#5A5A40] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>You unlocked FREE Pan-India Delivery!</span>
              </p>
            )}
            <div className="w-full bg-[#E5E2D9] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-[#5A5A40] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 2. Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAF9F6]">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#E5E2D9] bg-white flex gap-3 text-xs relative group shadow-xs"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-[#F7F6F2] overflow-hidden shrink-0 border border-[#E5E2D9]">
                    {item.product ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#2C2C2C] text-[#D1CFB9] font-mono text-[9px] p-1 text-center">
                        <Box className="w-4 h-4 mb-0.5" />
                        <span>STL Upload</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-[#2C2C2C] line-clamp-1">
                      {item.product ? item.product.name : item.customQuote?.fileName}
                    </h4>

                    {/* Options summary */}
                    <div className="text-[10px] text-[#8E9299] font-mono space-y-0.5">
                      <p>
                        Material: <span className="text-[#2C2C2C] font-semibold">{item.selectedMaterial.name}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        Color:
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-[#E5E2D9]"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <span className="text-[#2C2C2C]">{item.selectedColor.name}</span>
                      </p>
                      <p>
                        Size: <span className="text-[#2C2C2C]">{item.selectedSizeLabel}</span> ({item.dimensions.widthMm}×{item.dimensions.heightMm}mm)
                      </p>
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center border border-[#E5E2D9] rounded-md bg-white font-bold text-[11px]">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-[#F7F6F2] text-[#2C2C2C]"
                        >
                          -
                        </button>
                        <span className="px-2 text-[#2C2C2C]">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 hover:bg-[#F7F6F2] text-[#2C2C2C]"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif font-bold text-[#2C2C2C] text-sm">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[#8E9299] hover:text-rose-600 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-16 text-center space-y-3 text-[#8E9299]">
                <ShoppingBag className="w-12 h-12 text-[#E5E2D9] mx-auto" />
                <p className="font-serif text-base font-bold text-[#2C2C2C]">Your Print Cart is Empty</p>
                <p className="text-xs">Browse our 3D model catalog or upload your custom CAD file.</p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setCurrentView('catalog');
                  }}
                  className="bg-[#2C2C2C] text-white font-bold text-xs py-2.5 px-5 rounded-xl hover:bg-[#444444]"
                >
                  Browse Models
                </button>
              </div>
            )}
          </div>

          {/* 3. Footer Summary & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E5E2D9] bg-[#F7F6F2] space-y-3">
              {/* Gift Wrapping Toggle */}
              <div className="border-b border-[#E5E2D9] pb-3">
                <label className="flex items-center justify-between text-xs text-[#2C2C2C] cursor-pointer">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Gift className="w-4 h-4 text-[#5A5A40]" />
                    <span>Eco Gift Box & Card (+₹99)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={giftWrapping}
                    onChange={(e) => setGiftWrapping(e.target.checked)}
                    className="rounded border-[#E5E2D9] text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                </label>
              </div>

              {/* Subtotal */}
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-[#8E9299]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#2C2C2C]">{formatPrice(cartSubtotalUSD)}</span>
                </div>
                {giftWrapping && (
                  <div className="flex justify-between text-[#8E9299]">
                    <span>Gift Packaging</span>
                    <span className="font-bold text-[#2C2C2C]">{formatPrice(giftPackagingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8E9299] text-[10px]">
                  <span>GST & Hub Processing</span>
                  <span>Included</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E2D9] flex justify-between font-serif font-bold text-lg text-[#2C2C2C]">
                <span>Estimated Total</span>
                <span>{formatPrice(cartSubtotalUSD + (giftWrapping ? giftPackagingFee : 0))}</span>
              </div>

              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setCurrentView('checkout');
                }}
                className="w-full bg-[#2C2C2C] hover:bg-[#444444] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#D1CFB9]" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8E9299]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>256-Bit SSL Encrypted • 100% Print Quality Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
