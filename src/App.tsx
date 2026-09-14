import React from 'react';
import { motion } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductCard } from './components/ProductCard';
import { ProductCardSkeletonGrid } from './components/ProductCardSkeleton';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetail } from './components/ProductDetail';
import { CustomPrintUpload } from './components/CustomPrintUpload';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmation } from './components/OrderConfirmation';
import { UserAccount } from './components/UserAccount';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { PrintHubLocatorModal } from './components/PrintHubLocatorModal';
import { ManageModelsModal } from './components/ManageModelsModal';
import { DashboardPage } from './components/DashboardPage';
import { CookieBanner } from './components/CookieBanner';

import { MATERIAL_OPTIONS } from './data/materials';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  MapPin,
  Plus,
  Cpu,
  Truck,
  LayoutDashboard,
  RotateCcw,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentView,
    selectedProduct,
    setCurrentView,
    setIsPrintHubModalOpen,
    products,
    isLoadingProducts,
    refreshProducts,
    isManageModalOpen,
    setIsManageModalOpen,
    isFirebaseConnected,
  } = useStore();

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#2C2C2C] font-sans selection:bg-[#5A5A40] selection:text-white">
      <Header />

      <main className="flex-1">
        {currentView === 'home' && (
          <>
            {/* 1. Hero Carousel */}
            <HeroCarousel />

            {/* 2. Primary Category Path Cards with Scroll Trigger */}
            <CategoryGrid />

            {/* 3. Featured 3D Models Product Grid with Smooth Fade-in */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="py-16 bg-white border-b border-[#E5E2D9] overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5A5A40]">
                        Artisan & Engineering Library
                      </span>
                      {isFirebaseConnected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#F2F0EA] text-[#5A5A40] px-2 py-0.5 rounded-full border border-[#E5E2D9]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Firestore Synced</span>
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2C2C] mt-1">
                      Featured 3D Models
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8E9299] mt-1">
                      Fabricated in micro-layer resolution with recyclable bio-polymers and pan-India express dispatch.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id="home-refresh-catalog-btn"
                      onClick={() => refreshProducts()}
                      disabled={isLoadingProducts}
                      className="inline-flex items-center gap-1.5 bg-[#F7F6F2] hover:bg-[#E5E2D9] text-[#2C2C2C] border border-[#E5E2D9] font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      title="Refresh models catalog"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 text-[#5A5A40] ${isLoadingProducts ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className="inline-flex items-center gap-1.5 bg-[#F7F6F2] hover:bg-[#E5E2D9] text-[#2C2C2C] border border-[#E5E2D9] font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                      title="Open Creator & Store Admin Dashboard"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>Admin Studio</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('catalog');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 font-bold text-xs text-[#2C2C2C] hover:text-[#5A5A40] transition-colors group self-start sm:self-auto cursor-pointer"
                    >
                      <span>Shop All Models</span>
                      <ArrowRight className="w-4 h-4 text-[#5A5A40] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {isLoadingProducts ? (
                  <ProductCardSkeletonGrid id="home-featured-skeleton-grid" count={6} />
                ) : (
                  <div id="home-featured-products-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredProducts.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-20px' }}
                        transition={{
                          duration: 0.45,
                          delay: (idx % 3) * 0.08,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>

            {/* 4. Polymer & Filament Material Showcase with Scroll Trigger */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="py-16 bg-[#2C2C2C] text-[#FAF9F6] overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D1CFB9]">
                    Precision Materials
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">
                    Engineered Filament & Resin Matrix
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A5A898]">
                    From dual-silk metallic aesthetic polymers to carbon-fiber reinforced composites.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MATERIAL_OPTIONS.map((mat, idx) => (
                    <motion.div
                      key={mat.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{
                        duration: 0.45,
                        delay: (idx % 3) * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="bg-[#3A3A3A]/80 p-6 rounded-2xl border border-[#5A5A40]/40 space-y-3 hover:border-[#D1CFB9] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg font-bold text-white">{mat.name}</span>
                        {mat.badge && (
                          <span className="bg-[#5A5A40] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {mat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A5A898] leading-relaxed">{mat.description}</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#D1CFB9] border-t border-[#5A5A40]/40">
                        <span>Finish: {mat.properties.finish}</span>
                        <span>Rating: {mat.properties.durability}/5 ★</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* 5. UrPrint Quality Guarantee & Craftsmanship Pillars */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="py-14 bg-white border-b border-[#E5E2D9] overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F6F2] text-[#5A5A40] flex items-center justify-center shrink-0 border border-[#E5E2D9]">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-[#2C2C2C]">0.08mm Ultra-Layer</h4>
                      <p className="text-xs text-[#8E9299] leading-relaxed">
                        Micro-stepped slicing ensures smooth surfaces with virtually invisible layer lines.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F6F2] text-[#5A5A40] flex items-center justify-center shrink-0 border border-[#E5E2D9]">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-[#2C2C2C]">100% Quality Checked</h4>
                      <p className="text-xs text-[#8E9299] leading-relaxed">
                        Every print undergoes tolerance verification before final packaging.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F6F2] text-[#5A5A40] flex items-center justify-center shrink-0 border border-[#E5E2D9]">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-[#2C2C2C]">Custom CAD Slicing</h4>
                      <p className="text-xs text-[#8E9299] leading-relaxed">
                        Upload custom STL / OBJ files with instant volume and print time estimation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F6F2] text-[#5A5A40] flex items-center justify-center shrink-0 border border-[#E5E2D9]">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-[#2C2C2C]">Pan-India Hub Dispatch</h4>
                      <p className="text-xs text-[#8E9299] leading-relaxed">
                        Dispatched from our nearest verified regional print hub for fast, reliable delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 6. Print Partner Store Locator Banner with Scroll Trigger */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="py-16 bg-[#F7F6F2] border-b border-[#E5E2D9] overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 bg-[#E5E2D9] text-[#2C2C2C] text-xs font-mono font-bold px-3 py-1 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Distributed Pan-India Hub Network</span>
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#2C2C2C]">
                    Check Print Partner Availability in Your City
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8E9299] leading-relaxed">
                    Our regional hubs across Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, Chennai, Kolkata, and Ahmedabad allow fast same-day dispatch and express delivery.
                  </p>
                </div>

                <button
                  onClick={() => setIsPrintHubModalOpen(true)}
                  className="bg-[#2C2C2C] hover:bg-[#444444] text-white font-bold text-sm py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#D1CFB9]" />
                  <span>Locate Nearby Print Hub</span>
                </button>
              </div>
            </motion.section>
          </>
        )}

        {currentView === 'catalog' && <CatalogPage />}
        {currentView === 'product-detail' && <ProductDetail product={selectedProduct} />}
        {currentView === 'custom-upload' && <CustomPrintUpload />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'order-confirmation' && <OrderConfirmation />}
        {currentView === 'account' && <UserAccount />}
        {currentView === 'dashboard' && <DashboardPage />}
      </main>

      <Footer />

      {/* Global Overlays */}
      <CartDrawer />
      <QuickViewModal />
      <PrintHubLocatorModal />
      <ManageModelsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
      <CookieBanner />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
