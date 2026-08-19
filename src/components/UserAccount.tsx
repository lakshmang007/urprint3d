import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const UserAccount: React.FC = () => {
  const {
    orders,
    wishlistIds,
    openProductDetail,
    formatPrice,
    setCurrentView,
    addToCart,
    setIsCartDrawerOpen,
  } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'stls'>('orders');

  const wishlistedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="bg-stone-50 min-h-screen font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Profile Header Card */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-serif font-bold text-2xl flex items-center justify-center shadow-md">
              AV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold">Alexander Vance</h1>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                  Pro VIP Fabrication Tier
                </span>
              </div>
              <p className="text-xs text-stone-400">alexander.vance@example.com • Member since March 2025</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-center border-t sm:border-t-0 sm:border-l border-stone-800 pt-4 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-xl font-bold text-amber-400 block">{orders.length + 3}</span>
              <span className="text-stone-400 text-[10px] uppercase">Print Orders</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white block">{wishlistIds.length}</span>
              <span className="text-stone-400 text-[10px] uppercase">Wishlist Items</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-1">
          {[
            { id: 'orders', label: 'Order History & Reprints', icon: ShoppingBag, count: orders.length },
            { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, count: wishlistIds.length },
            { id: 'stls', label: 'Purchased STL Downloads', icon: Download, count: 4 },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          ].map((t) => {
            const IconComp = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-xs shrink-0 transition-all ${
                  activeTab === t.id
                    ? 'border-amber-600 text-amber-800 font-bold bg-white/60 rounded-t-xl'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="bg-stone-200 text-stone-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ORDERS & REPRINTS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3 text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-700 text-sm">Order #{ord.id}</span>
                      <span className="text-stone-400 text-[11px] ml-2">• Placed {new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Printer className="w-3 h-3 text-amber-700 animate-pulse" />
                        <span>{ord.status}</span>
                      </span>
                      <span className="font-serif font-bold text-stone-900 text-sm">{formatPrice(ord.total)}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-3">
                          <img
                            src={it.product ? it.product.images[0] : 'https://picsum.photos/seed/stl/100/100'}
                            alt="Item"
                            className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-stone-900">{it.product ? it.product.name : it.customQuote?.fileName}</p>
                            <p className="text-[10px] text-stone-500 font-mono">
                              {it.selectedMaterial.name} • {it.selectedColor.name} • Qty: {it.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Reprint Button */}
                        <button
                          onClick={() => {
                            if (it.product) {
                              addToCart(it.product, it.selectedMaterial, it.selectedColor, it.product.sizes[0]);
                              setIsCartDrawerOpen(true);
                            }
                          }}
                          className="bg-[#F7F6F2] hover:bg-[#E5E2D9] text-[#2C2C2C] font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-[#E5E2D9]"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <span>Reprint Item</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-900">No Orders Placed Yet</h3>
                <p className="text-xs text-stone-500">Explore our catalog of parametric 3D models or upload custom CAD files.</p>
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="bg-stone-900 text-white font-bold text-xs py-2.5 px-5 rounded-xl hover:bg-stone-800"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
                <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-900">Your Wishlist is Empty</h3>
                <p className="text-xs text-stone-500">Click the heart icon on any model to save it for later.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOWNLOADABLE STL FILES */}
        {activeTab === 'stls' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'Anime_Hero_Action_Figure.stl', size: '28.4 MB', format: 'STL Mesh' },
              { name: 'Japanese_Wave_Wall_Hanging.stl', size: '18.2 MB', format: 'STL Mesh' },
              { name: 'Articulated_Flexi_Dragon_Keychain.stl', size: '12.5 MB', format: 'STL Mesh' },
              { name: 'Fibonacci_Spiral_Vase_Decor.stl', size: '15.6 MB', format: 'STL Mesh' },
            ].map((stl, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-[#E5E2D9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F6F2] text-[#5A5A40] flex items-center justify-center font-bold">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2C2C] font-mono truncate max-w-xs">{stl.name}</p>
                    <p className="text-[10px] text-[#8E9299]">{stl.format} • {stl.size}</p>
                  </div>
                </div>

                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent('solid ' + stl.name + '\nendsolid ' + stl.name)}`}
                  download={stl.name}
                  className="bg-[#2C2C2C] hover:bg-[#444444] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors shrink-0 inline-block text-center"
                >
                  Download STL
                </a>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C2C2C]">Primary Residence</span>
                <span className="bg-[#E5E2D9] text-[#2C2C2C] font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">Default</span>
              </div>
              <p className="font-bold text-[#2C2C2C]">Aarav Sharma</p>
              <p className="text-[#8E9299]">#42/1, 4th Cross, 100ft Road, Indiranagar</p>
              <p className="text-[#8E9299]">Bengaluru, Karnataka 560038, India</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C2C2C]">Maker Studio / Lab</span>
                <span className="bg-[#F7F6F2] text-[#5A5A40] font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">Secondary</span>
              </div>
              <p className="font-bold text-[#2C2C2C]">Aarav Sharma (Studio)</p>
              <p className="text-[#8E9299]">Unit 304, Prestige Tech Park, Marathahalli Ring Rd</p>
              <p className="text-[#8E9299]">Bengaluru, Karnataka 560103, India</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
