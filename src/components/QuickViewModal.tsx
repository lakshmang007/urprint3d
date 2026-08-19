import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ThreeDViewer } from './ThreeDViewer';
import { X, Star, ShoppingBag, ArrowRight } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, openProductDetail, addToCart, formatPrice } = useStore();
  const [activeTab, setActiveTab] = useState<'photo' | '3d'>('photo');

  if (!quickViewProduct) return null;

  const product = quickViewProduct;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      <div onClick={() => setQuickViewProduct(null)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2">
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 text-stone-400 hover:text-stone-900 bg-white/80 rounded-full backdrop-blur-md shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Media */}
          <div className="relative bg-stone-100 min-h-[340px] flex items-center justify-center">
            {activeTab === 'photo' ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <ThreeDViewer
                geometryType={product.stlGeometryType}
                colorHex={product.colors[0].hex}
                height="h-[340px]"
              />
            )}

            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs flex gap-2">
              <button
                onClick={() => setActiveTab('photo')}
                className={`px-2 py-0.5 rounded-full ${activeTab === 'photo' ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
              >
                Photo
              </button>
              <button
                onClick={() => setActiveTab('3d')}
                className={`px-2 py-0.5 rounded-full ${activeTab === '3d' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
              >
                3D Slicer
              </button>
            </div>
          </div>

          {/* Right Details */}
          <div className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-700">{product.category}</span>
              <h3 className="font-serif text-xl font-bold text-stone-900">{product.name}</h3>
              <p className="text-xs text-stone-500 line-clamp-2">{product.subtitle}</p>

              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{product.rating}</span>
                <span className="text-stone-400 font-normal">({product.reviewCount} reviews)</span>
              </div>

              <div className="pt-2">
                <span className="font-serif text-2xl font-bold text-stone-900">{formatPrice(product.basePrice)}</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-stone-200 pt-3">
              <button
                onClick={() => {
                  addToCart(product, product.materials[0], product.colors[0], product.sizes[0]);
                  setQuickViewProduct(null);
                }}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Quick Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  setQuickViewProduct(null);
                  openProductDetail(product);
                }}
                className="w-full text-center text-xs font-semibold text-amber-800 hover:underline flex items-center justify-center gap-1"
              >
                <span>View Full Oroton Specifications & Custom Sizes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
