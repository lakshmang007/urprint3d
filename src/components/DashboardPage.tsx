import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, Order, Coupon, HeroSlideData, PrintHub } from '../types';
import { ThreeDViewer } from './ThreeDViewer';
import {
  LayoutDashboard,
  Box,
  Palette,
  ClipboardList,
  Tag,
  MapPin,
  UploadCloud,
  Database,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Sliders,
  DollarSign,
  Printer,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  RefreshCw,
  Copy,
  AlertTriangle,
  Search,
} from 'lucide-react';

type TabType = 'catalog' | 'ui-editor' | 'orders' | 'coupons' | 'hubs' | 'uploads' | 'database';

export const DashboardPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetCatalogToDefaults,
    storeSettings,
    updateStoreSettings,
    resetStoreSettings,
    printHubs,
    updatePrintHub,
    addPrintHub,
    orders,
    updateOrderStatus,
    customUploads,
    refreshCustomUploads,
    formatPrice,
    setCurrentView,
    openProductDetail,
    isFirebaseConnected,
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [notification, setNotification] = useState<string | null>(null);

  // Edit / Add Product State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    subtitle: '',
    category: 'Anime & Action Figures',
    basePrice: 1499,
    rating: 4.9,
    reviewCount: 12,
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80'],
    hoverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
    badges: ['NEW'],
    stlGeometryType: 'anime_figure',
    inStock: true,
    detailsAccordion: 'Precision engineered 3D printed model with fine layer lines and durable structure.',
    specs: {
      designer: 'UrPrint Studio India',
      license: 'Commercial Print Ready',
      weightGrams: 180,
      printTimeHours: 6.5,
      infillPercentage: 20,
      layerHeightMm: 0.12,
      sku: `URP-${Math.floor(1000 + Math.random() * 9000)}`,
    },
  });

  // UI Settings Form State
  const [uiForm, setUiForm] = useState(storeSettings);

  // Add Hub State
  const [isAddingHub, setIsAddingHub] = useState(false);
  const [hubForm, setHubForm] = useState<Partial<PrintHub>>({
    name: '',
    city: '',
    address: '',
    phone: '+91 ',
    activePrinters: 24,
    queueTimeHours: 1.5,
    rating: 4.9,
    pickupAvailable: true,
    distanceKm: 2.5,
  });

  // Add Coupon State
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 999,
    isActive: true,
    description: '',
  });

  // Order Details Modal / Invoice State
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter products for catalog tab
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.basePrice) {
      showNotice('Please provide model name and base price.');
      return;
    }

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productForm);
        showNotice(`Updated "${productForm.name}" successfully!`);
      } else {
        const newId = `prod-${Date.now()}`;
        const newProd: Product = {
          id: newId,
          name: productForm.name || 'New 3D Model',
          subtitle: productForm.subtitle || 'Custom 3D Fabrication',
          category: productForm.category as ProductCategory,
          basePrice: Number(productForm.basePrice),
          rating: 4.9,
          reviewCount: 1,
          images: productForm.images?.length ? productForm.images : ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80'],
          hoverImage: productForm.hoverImage || productForm.images?.[0] || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
          badges: productForm.badges || ['NEW'],
          materials: products[0]?.materials || [],
          colors: products[0]?.colors || [],
          sizes: products[0]?.sizes || [],
          defaultMaterial: 'mat-pla',
          defaultColor: 'col-black',
          defaultSize: 'size-m',
          specs: productForm.specs as any,
          detailsAccordion: productForm.detailsAccordion || '',
          stlGeometryType: productForm.stlGeometryType as any,
          inStock: productForm.inStock ?? true,
        };
        await addProduct(newProd);
        showNotice(`Created new 3D model "${newProd.name}"!`);
      }
      setIsEditingProduct(false);
      setEditingProductId(null);
    } catch (err) {
      showNotice('Failed to save product. Please try again.');
    }
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({ ...prod });
    setIsEditingProduct(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleStartCreate = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      subtitle: 'Artisan 3D Printed Model',
      category: 'Anime & Action Figures',
      basePrice: 1499,
      images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80'],
      hoverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
      badges: ['NEW'],
      stlGeometryType: 'anime_figure',
      inStock: true,
      detailsAccordion: 'Precision engineered additive manufacturing with micro-tolerance layer bonding.',
      specs: {
        designer: 'UrPrint Studio India',
        license: 'Commercial Print Ready',
        weightGrams: 150,
        printTimeHours: 5.0,
        infillPercentage: 20,
        layerHeightMm: 0.12,
        sku: `URP-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    });
    setIsEditingProduct(true);
  };

  const handleDelete = async (prod: Product) => {
    if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
      await deleteProduct(prod.id);
      showNotice(`Deleted "${prod.name}".`);
    }
  };

  // UI Settings Save
  const handleSaveUiSettings = async () => {
    await updateStoreSettings(uiForm);
    showNotice('UI and Storefront settings saved and published live!');
  };

  // Add Coupon Handler
  const handleSaveCoupon = () => {
    if (!couponForm.code || !couponForm.discountValue) {
      showNotice('Please fill coupon code and discount value.');
      return;
    }
    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: couponForm.code.toUpperCase().trim(),
      discountType: couponForm.discountType || 'percentage',
      discountValue: Number(couponForm.discountValue),
      minOrderAmount: Number(couponForm.minOrderAmount) || 0,
      isActive: couponForm.isActive ?? true,
      description: couponForm.description || `${couponForm.discountValue}${couponForm.discountType === 'percentage' ? '%' : '₹'} off discount`,
    };
    const updatedCoupons = [...(uiForm.coupons || []), newCoupon];
    setUiForm({ ...uiForm, coupons: updatedCoupons });
    updateStoreSettings({ coupons: updatedCoupons });
    setIsAddingCoupon(false);
    showNotice(`Coupon "${newCoupon.code}" created!`);
  };

  const handleDeleteCoupon = (id: string) => {
    const updated = (uiForm.coupons || []).filter((c) => c.id !== id);
    setUiForm({ ...uiForm, coupons: updated });
    updateStoreSettings({ coupons: updated });
    showNotice('Coupon deleted.');
  };

  // Add Hub Handler
  const handleSaveHub = () => {
    if (!hubForm.name || !hubForm.city || !hubForm.address) {
      showNotice('Please enter hub name, city, and address.');
      return;
    }
    const newHub: PrintHub = {
      id: `hub-${Date.now()}`,
      name: hubForm.name,
      city: hubForm.city,
      address: hubForm.address,
      phone: hubForm.phone || '+91 80 4122 8900',
      activePrinters: Number(hubForm.activePrinters) || 20,
      queueTimeHours: Number(hubForm.queueTimeHours) || 1.5,
      rating: 4.9,
      pickupAvailable: hubForm.pickupAvailable ?? true,
      distanceKm: Number(hubForm.distanceKm) || 3.0,
    };
    addPrintHub(newHub);
    setIsAddingHub(false);
    showNotice(`Print Hub "${newHub.name}" added to pan-India fleet!`);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] font-sans text-[#2C2C2C] pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#2C2C2C] text-[#FAF9F6] px-5 py-3 rounded-2xl shadow-2xl border border-[#D1CFB9]/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-[#D1CFB9]" />
          <span className="text-xs sm:text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Top Banner & Context Header */}
      <div className="bg-[#2C2C2C] text-[#FAF9F6] border-b border-[#3F3F2C] pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-[#5A5A40] text-[#FAF9F6] text-[11px] font-mono font-semibold uppercase tracking-wider">
                  Admin Control Panel
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Firestore Active
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Creator & Storefront Studio
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm max-w-2xl">
                Add and edit 3D models, configure live storefront banners, manage pan-India manufacturing queues, and oversee customer STL print orders.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setCurrentView('catalog')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF9F6] text-xs font-semibold backdrop-blur-md transition-all cursor-pointer border border-white/10"
              >
                <Eye className="w-4 h-4 text-[#D1CFB9]" />
                <span>View Live Store</span>
              </button>
              <button
                onClick={handleStartCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#737758] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add 3D Model</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-stone-700/60 no-scrollbar">
            {[
              { id: 'catalog', label: '3D Models & Catalog', icon: Box, count: products.length },
              { id: 'ui-editor', label: 'Storefront & UI Editor', icon: Palette },
              { id: 'orders', label: 'Production & Orders', icon: ClipboardList, count: orders.length },
              { id: 'coupons', label: 'Discount Coupons', icon: Tag, count: uiForm.coupons?.length || 0 },
              { id: 'hubs', label: 'Print Hubs Fleet', icon: MapPin, count: printHubs.length },
              { id: 'uploads', label: 'Customer STL Queue', icon: UploadCloud, count: customUploads.length },
              { id: 'database', label: 'Database & Sync', icon: Database },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setIsEditingProduct(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F7F6F2] text-[#2C2C2C] shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-[#5A5A40]' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-[#5A5A40] text-white' : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ========================================================================= */}
        {/* TAB 1: 3D MODELS & CATALOG MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* If Edit/Create Form is open */}
            {isEditingProduct ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
                      {editingProductId ? `Edit 3D Model: ${productForm.name}` : 'Add New 3D Model'}
                    </h2>
                    <p className="text-xs text-[#8E9299]">
                      Set pricing in Indian Rupees (₹), configure 3D geometry engine, and define fabrication specs.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingProduct(false)}
                    className="text-xs font-semibold text-[#8E9299] hover:text-[#2C2C2C] px-3 py-1.5 rounded-lg border border-[#E5E2D9] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Form Fields (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Name & Subtitle */}
                      <div>
                        <label className="block text-xs font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
                          Model Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name || ''}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="e.g. Cyberpunk Katana Ronin Samurai"
                          className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-sm focus:outline-hidden focus:border-[#5A5A40]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
                          Short Subtitle / Tagline
                        </label>
                        <input
                          type="text"
                          value={productForm.subtitle || ''}
                          onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                          placeholder="e.g. High-detail 0.08mm micro-resin artisan sculpture"
                          className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-sm focus:outline-hidden focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* Category & Base Price */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
                            Category *
                          </label>
                          <select
                            value={productForm.category || 'Anime & Action Figures'}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                            className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-sm focus:outline-hidden focus:border-[#5A5A40]"
                          >
                            <option value="Anime & Action Figures">Anime & Action Figures</option>
                            <option value="Home Decor">Home Decor</option>
                            <option value="Wall Hangings">Wall Hangings</option>
                            <option value="Keychains">Keychains</option>
                            <option value="Sculptures & Accents">Sculptures & Accents</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
                            Base Price in INR (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5A5A40]">
                              ₹
                            </span>
                            <input
                              type="number"
                              required
                              min={49}
                              max={99999}
                              value={productForm.basePrice || 1499}
                              onChange={(e) => setProductForm({ ...productForm, basePrice: Number(e.target.value) })}
                              className="w-full pl-8 pr-3.5 py-2.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:border-[#5A5A40]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3D Geometry Type & In-Stock */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
                            3D Interactive Mesh Type
                          </label>
                          <select
                            value={productForm.stlGeometryType || 'anime_figure'}
                            onChange={(e) => setProductForm({ ...productForm, stlGeometryType: e.target.value as any })}
                            className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-sm focus:outline-hidden focus:border-[#5A5A40]"
                          >
                            <option value="anime_figure">Anime Action Figure (Resin Sculpt)</option>
                            <option value="chibi">Chibi Companion Figurine</option>
                            <option value="dragon">Articulated Flexi Dragon</option>
                            <option value="wall_art">Sacred Geometry Wall Relief</option>
                            <option value="spiral_vase">Parametric Spiral Vase</option>
                            <option value="planter">Ribbed Fluted Planter</option>
                            <option value="lamp">Ambient Lattice Lamp</option>
                            <option value="keychain">Pocket Plate Charm</option>
                            <option value="sculpture">Polyhedron Sculpture</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
                            Inventory & Availability
                          </label>
                          <div className="flex items-center gap-3 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                              <input
                                type="checkbox"
                                checked={productForm.inStock ?? true}
                                onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                                className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40]"
                              />
                              <span>Ready for 3D Slicing & Print (In Stock)</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Image URLs */}
                      <div>
                        <label className="block text-xs font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
                          Product Image URL
                        </label>
                        <input
                          type="url"
                          value={productForm.images?.[0] || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              images: [e.target.value, ...(productForm.images?.slice(1) || [])],
                              hoverImage: e.target.value,
                            })
                          }
                          placeholder="https://..."
                          className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#5A5A40]"
                        />
                      </div>

                      {/* Fabrication Specs (Weight, Print Time, Infill, Layer) */}
                      <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] space-y-3">
                        <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                          3D Printing Technical Specifications
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[11px] text-[#8E9299] block">Est. Weight (g)</label>
                            <input
                              type="number"
                              value={productForm.specs?.weightGrams || 150}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  specs: {
                                    designer: productForm.specs?.designer || 'UrPrint India',
                                    license: productForm.specs?.license || 'Commercial',
                                    sku: productForm.specs?.sku || 'URP-001',
                                    infillPercentage: productForm.specs?.infillPercentage || 20,
                                    layerHeightMm: productForm.specs?.layerHeightMm || 0.12,
                                    printTimeHours: productForm.specs?.printTimeHours || 4.5,
                                    weightGrams: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-[#8E9299] block">Print Hours (h)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={productForm.specs?.printTimeHours || 5.0}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  specs: {
                                    designer: productForm.specs?.designer || 'UrPrint India',
                                    license: productForm.specs?.license || 'Commercial',
                                    sku: productForm.specs?.sku || 'URP-001',
                                    weightGrams: productForm.specs?.weightGrams || 150,
                                    infillPercentage: productForm.specs?.infillPercentage || 20,
                                    layerHeightMm: productForm.specs?.layerHeightMm || 0.12,
                                    printTimeHours: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-[#8E9299] block">Infill %</label>
                            <input
                              type="number"
                              value={productForm.specs?.infillPercentage || 20}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  specs: {
                                    designer: productForm.specs?.designer || 'UrPrint India',
                                    license: productForm.specs?.license || 'Commercial',
                                    sku: productForm.specs?.sku || 'URP-001',
                                    weightGrams: productForm.specs?.weightGrams || 150,
                                    printTimeHours: productForm.specs?.printTimeHours || 4.5,
                                    layerHeightMm: productForm.specs?.layerHeightMm || 0.12,
                                    infillPercentage: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-[#8E9299] block">Layer (mm)</label>
                            <input
                              type="number"
                              step="0.02"
                              value={productForm.specs?.layerHeightMm || 0.12}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  specs: {
                                    designer: productForm.specs?.designer || 'UrPrint India',
                                    license: productForm.specs?.license || 'Commercial',
                                    sku: productForm.specs?.sku || 'URP-001',
                                    weightGrams: productForm.specs?.weightGrams || 150,
                                    printTimeHours: productForm.specs?.printTimeHours || 4.5,
                                    infillPercentage: productForm.specs?.infillPercentage || 20,
                                    layerHeightMm: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description Accordion text */}
                      <div>
                        <label className="block text-xs font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
                          Product Details & Fabricating Notes
                        </label>
                        <textarea
                          rows={3}
                          value={productForm.detailsAccordion || ''}
                          onChange={(e) => setProductForm({ ...productForm, detailsAccordion: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-xs focus:outline-hidden focus:border-[#5A5A40]"
                        />
                      </div>
                    </div>

                    {/* Right: Live Interactive 3D Model Preview (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-[#2C2C2C] rounded-2xl p-4 text-[#FAF9F6] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-[#D1CFB9] font-bold uppercase tracking-wider">
                            Interactive 3D Preview
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#3F3F2C] text-[#D1CFB9]">
                            {productForm.stlGeometryType || 'anime_figure'}
                          </span>
                        </div>
                        <div className="h-64 rounded-xl overflow-hidden bg-black/40 border border-[#3F3F2C]">
                          <ThreeDViewer
                            geometryType={productForm.stlGeometryType as any}
                            height="h-64"
                            colorHex="#5A5A40"
                          />
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                          Drag with mouse or touch to rotate 360°. This interactive CAD rendering is how customers view and inspect your model on the live storefront.
                        </p>
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex items-center gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#5A5A40] hover:bg-[#737758] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingProductId ? 'Save Model Changes' : 'Publish New 3D Model'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              /* Catalog Table & Filter Bar */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-6">
                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#8E9299] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search models by name, category, or SKU..."
                      className="w-full pl-9 pr-4 py-2 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-[#F7F6F2] border border-[#E5E2D9] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#5A5A40]"
                    >
                      <option value="All">All Categories</option>
                      <option value="Anime & Action Figures">Anime & Action Figures</option>
                      <option value="Home Decor">Home Decor</option>
                      <option value="Wall Hangings">Wall Hangings</option>
                      <option value="Keychains">Keychains</option>
                      <option value="Sculptures & Accents">Sculptures & Accents</option>
                    </select>

                    <button
                      onClick={handleStartCreate}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5A5A40] hover:bg-[#737758] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Model</span>
                    </button>
                  </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto border border-[#E5E2D9] rounded-2xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F7F6F2] border-b border-[#E5E2D9] text-[#5A5A40] font-mono text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Model & Preview</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Base Price (INR)</th>
                        <th className="py-3 px-4">3D Mesh</th>
                        <th className="py-3 px-4">Print Specs</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2D9]">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-12 h-12 rounded-lg object-cover border border-[#E5E2D9]"
                              />
                              <div>
                                <h4 className="font-serif font-bold text-[#2C2C2C] text-sm">
                                  {prod.name}
                                </h4>
                                <span className="text-[11px] text-[#8E9299] block font-mono">
                                  {prod.specs?.sku || prod.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-[#F2F0EA] text-[#5A5A40] text-xs font-medium">
                              {prod.category}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-sm text-[#2C2C2C]">
                            {formatPrice(prod.basePrice)}
                          </td>

                          <td className="py-3 px-4 text-xs font-mono text-[#8E9299]">
                            {prod.stlGeometryType}
                          </td>

                          <td className="py-3 px-4 text-xs font-mono text-[#5A5A40]">
                            {prod.specs?.weightGrams || 150}g • {prod.specs?.printTimeHours || 4}h
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => updateProduct(prod.id, { inStock: !prod.inStock })}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                prod.inStock
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {prod.inStock ? '● In Stock' : '○ Disabled'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openProductDetail(prod)}
                                className="p-1.5 text-[#8E9299] hover:text-[#5A5A40] rounded-lg hover:bg-[#F2F0EA] cursor-pointer"
                                title="View on Storefront"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStartEdit(prod)}
                                className="p-1.5 text-[#5A5A40] hover:text-[#2C2C2C] rounded-lg hover:bg-[#F2F0EA] cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(prod)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STOREFRONT & UI CUSTOMIZER */}
        {/* ========================================================================= */}
        {activeTab === 'ui-editor' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
                  Live Storefront & UI Customizer
                </h2>
                <p className="text-xs text-[#8E9299]">
                  Edit announcement messages, pan-India free delivery threshold, and hero carousel banners.
                </p>
              </div>
              <button
                onClick={handleSaveUiSettings}
                className="inline-flex items-center gap-2 bg-[#5A5A40] hover:bg-[#737758] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Publish UI Changes</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Announcement Bar Customizer */}
              <div className="p-5 bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                    <h3 className="font-bold text-sm text-[#2C2C2C]">Top Announcement Bar</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={uiForm.showAnnouncement}
                      onChange={(e) => setUiForm({ ...uiForm, showAnnouncement: e.target.checked })}
                      className="rounded text-[#5A5A40] accent-[#5A5A40]"
                    />
                    <span>Show Banner</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-[#8E9299] mb-1">Announcement Text</label>
                  <input
                    type="text"
                    value={uiForm.announcementText}
                    onChange={(e) => setUiForm({ ...uiForm, announcementText: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Free Shipping & Pricing Thresholds */}
              <div className="p-5 bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#5A5A40]" />
                  <h3 className="font-bold text-sm text-[#2C2C2C]">Pan-India Shipping Thresholds (₹ INR)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Free Shipping Min Order (₹)</label>
                    <input
                      type="number"
                      value={uiForm.freeShippingThresholdINR}
                      onChange={(e) => setUiForm({ ...uiForm, freeShippingThresholdINR: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-white border border-[#E5E2D9] rounded-xl text-sm font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Standard Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={uiForm.standardShippingFeeINR}
                      onChange={(e) => setUiForm({ ...uiForm, standardShippingFeeINR: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-white border border-[#E5E2D9] rounded-xl text-sm font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Priority 24h Hub Express (₹)</label>
                    <input
                      type="number"
                      value={uiForm.priorityShippingFeeINR}
                      onChange={(e) => setUiForm({ ...uiForm, priorityShippingFeeINR: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-white border border-[#E5E2D9] rounded-xl text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Carousel Slides Editor */}
              <div className="p-5 bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#5A5A40]" />
                    <h3 className="font-bold text-sm text-[#2C2C2C]">Homepage Hero Slides ({uiForm.heroSlides?.length || 0})</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {uiForm.heroSlides?.map((slide, idx) => (
                    <div key={slide.id || idx} className="p-4 bg-white rounded-xl border border-[#E5E2D9] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#5A5A40]">Slide #{idx + 1}</span>
                        <span className="text-[11px] text-[#8E9299] font-mono">{slide.targetView}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[#8E9299] block">Slide Headline</label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => {
                              const updated = [...uiForm.heroSlides];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setUiForm({ ...uiForm, heroSlides: updated });
                            }}
                            className="w-full px-3 py-1.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-[#8E9299] block">Subtitle</label>
                          <input
                            type="text"
                            value={slide.subtitle}
                            onChange={(e) => {
                              const updated = [...uiForm.heroSlides];
                              updated[idx] = { ...updated[idx], subtitle: e.target.value };
                              setUiForm({ ...uiForm, heroSlides: updated });
                            }}
                            className="w-full px-3 py-1.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-[#8E9299] block">Tag Eyebrow</label>
                          <input
                            type="text"
                            value={slide.tag}
                            onChange={(e) => {
                              const updated = [...uiForm.heroSlides];
                              updated[idx] = { ...updated[idx], tag: e.target.value };
                              setUiForm({ ...uiForm, heroSlides: updated });
                            }}
                            className="w-full px-3 py-1.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-[#8E9299] block">Button Text</label>
                          <input
                            type="text"
                            value={slide.ctaText}
                            onChange={(e) => {
                              const updated = [...uiForm.heroSlides];
                              updated[idx] = { ...updated[idx], ctaText: e.target.value };
                              setUiForm({ ...uiForm, heroSlides: updated });
                            }}
                            className="w-full px-3 py-1.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-[#8E9299] block">Base Display Price (₹)</label>
                          <input
                            type="number"
                            value={slide.price}
                            onChange={(e) => {
                              const updated = [...uiForm.heroSlides];
                              updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                              setUiForm({ ...uiForm, heroSlides: updated });
                            }}
                            className="w-full px-3 py-1.5 bg-[#F7F6F2] border border-[#E5E2D9] rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ORDERS & PRODUCTION TRACKER */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
                  Live Production & Orders ({orders.length})
                </h2>
                <p className="text-xs text-[#8E9299]">
                  Real-time manufacturing queue, hub reassignment, and status dispatch stepper.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-[#8E9299] space-y-2">
                <ClipboardList className="w-10 h-10 mx-auto text-[#D1CFB9]" />
                <p className="text-sm">No live orders placed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E5E2D9] rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F7F6F2] border-b border-[#E5E2D9] text-[#5A5A40] font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer & City</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Assigned Print Hub</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Total (INR)</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2D9]">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-[#2C2C2C] block">{order.id}</span>
                          <span className="text-[11px] text-[#8E9299]">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#2C2C2C] block">
                            {order.shippingAddress?.fullName || 'Customer'}
                          </span>
                          <span className="text-[11px] text-[#8E9299]">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} ({order.shippingAddress?.postalCode})
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-xs text-[#5A5A40]">
                            {order.items?.length || 1} items
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={order.printHubAssigned || 'Bengaluru Tech & Additive Hub'}
                            onChange={(e) => updateOrderStatus(order.id, order.status, e.target.value)}
                            className="px-2 py-1 bg-[#F7F6F2] border border-[#E5E2D9] rounded-lg text-xs font-medium focus:outline-hidden"
                          >
                            {printHubs.map((hub) => (
                              <option key={hub.id} value={hub.name}>
                                {hub.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 text-xs font-mono uppercase text-[#8E9299]">
                          {order.paymentMethod || 'UPI'}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-sm text-[#2C2C2C]">
                          {formatPrice(order.total)}
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : order.status === 'Shipped'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : order.status === '3D Printing'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-stone-100 text-stone-800 border-stone-300'
                            }`}
                          >
                            <option value="Sliced">1. Sliced</option>
                            <option value="3D Printing">2. 3D Printing</option>
                            <option value="Post-Processing">3. Post-Processing</option>
                            <option value="Shipped">4. Shipped via Express</option>
                            <option value="Delivered">5. Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: COUPONS & PROMOTIONS */}
        {/* ========================================================================= */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
                  Promotions & Coupon Codes
                </h2>
                <p className="text-xs text-[#8E9299]">
                  Create discount codes for Indian customers with percentage or flat ₹ INR discounts.
                </p>
              </div>
              <button
                onClick={() => setIsAddingCoupon(!isAddingCoupon)}
                className="inline-flex items-center gap-2 bg-[#5A5A40] hover:bg-[#737758] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingCoupon ? 'Cancel' : 'Create Coupon'}</span>
              </button>
            </div>

            {isAddingCoupon && (
              <div className="p-5 bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] space-y-4">
                <h3 className="text-sm font-bold text-[#2C2C2C]">New Coupon Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Coupon Code (e.g. FESTIVE20)</label>
                    <input
                      type="text"
                      value={couponForm.code || ''}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs font-mono font-bold uppercase"
                      placeholder="INDIA3D"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Discount Type</label>
                    <select
                      value={couponForm.discountType || 'percentage'}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs font-semibold"
                    >
                      <option value="percentage">Percentage Off (%)</option>
                      <option value="flat">Flat Amount Off (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Discount Value</label>
                    <input
                      type="number"
                      value={couponForm.discountValue || 10}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      value={couponForm.minOrderAmount || 499}
                      onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Coupon Description</label>
                    <input
                      type="text"
                      value={couponForm.description || ''}
                      onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                      placeholder="Special inaugural 3D printing discount"
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveCoupon}
                  className="bg-[#5A5A40] text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save & Activate Coupon
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {uiForm.coupons?.map((coupon) => (
                <div key={coupon.id} className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm bg-white px-2.5 py-1 rounded-lg border border-[#E5E2D9] text-[#5A5A40]">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-[#2C2C2C]">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% Instant Discount`
                      : `Flat ₹${coupon.discountValue} Off`}
                  </p>
                  <p className="text-[11px] text-[#8E9299]">{coupon.description}</p>
                  <span className="text-[10px] font-mono text-stone-500 block">
                    Min order: ₹{coupon.minOrderAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PRINT HUBS FLEET */}
        {/* ========================================================================= */}
        {activeTab === 'hubs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
                  Pan-India 3D Additive Hubs ({printHubs.length})
                </h2>
                <p className="text-xs text-[#8E9299]">
                  Manage regional fabrication hubs across Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, etc.
                </p>
              </div>
              <button
                onClick={() => setIsAddingHub(!isAddingHub)}
                className="inline-flex items-center gap-2 bg-[#5A5A40] hover:bg-[#737758] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingHub ? 'Cancel' : 'Add Regional Hub'}</span>
              </button>
            </div>

            {isAddingHub && (
              <div className="p-5 bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] space-y-4">
                <h3 className="text-sm font-bold text-[#2C2C2C]">Add New Regional 3D Studio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Hub Name</label>
                    <input
                      type="text"
                      value={hubForm.name || ''}
                      onChange={(e) => setHubForm({ ...hubForm, name: e.target.value })}
                      placeholder="e.g. Chennai Additive Lab"
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">City, State</label>
                    <input
                      type="text"
                      value={hubForm.city || ''}
                      onChange={(e) => setHubForm({ ...hubForm, city: e.target.value })}
                      placeholder="Chennai, Tamil Nadu"
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8E9299] mb-1">Active 3D Printers</label>
                    <input
                      type="number"
                      value={hubForm.activePrinters || 24}
                      onChange={(e) => setHubForm({ ...hubForm, activePrinters: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#8E9299] mb-1">Address</label>
                  <input
                    type="text"
                    value={hubForm.address || ''}
                    onChange={(e) => setHubForm({ ...hubForm, address: e.target.value })}
                    placeholder="Full industrial park or studio address"
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] rounded-xl text-xs"
                  />
                </div>

                <button
                  onClick={handleSaveHub}
                  className="bg-[#5A5A40] text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Regional Hub
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {printHubs.map((hub) => (
                <div key={hub.id} className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] space-y-2">
                  <div className="flex items-center gap-2 text-[#5A5A40]">
                    <MapPin className="w-4 h-4 text-[#5A5A40]" />
                    <span className="font-bold text-sm text-[#2C2C2C]">{hub.name}</span>
                  </div>
                  <p className="text-xs text-[#8E9299] leading-relaxed">{hub.address}</p>
                  <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-[#E5E2D9]/60">
                    <span className="text-[#5A5A40] font-semibold">{hub.activePrinters} Printers Fleet</span>
                    <span className="text-[#8E9299]">Queue: ~{hub.queueTimeHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CUSTOM STL UPLOADS QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 'uploads' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
                  Customer STL / CAD Uploads Queue ({customUploads.length})
                </h2>
                <p className="text-xs text-[#8E9299]">
                  Inspect custom 3D files uploaded by users for instant quotes, slicing, and production jobs.
                </p>
              </div>
              <button
                onClick={refreshCustomUploads}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E2D9] text-xs font-semibold text-[#5A5A40] hover:bg-[#F7F6F2] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>

            {customUploads.length === 0 ? (
              <div className="py-12 text-center text-[#8E9299] space-y-3">
                <UploadCloud className="w-10 h-10 mx-auto text-[#D1CFB9]" />
                <p className="text-sm">No custom STL uploads submitted yet.</p>
                <button
                  onClick={() => setCurrentView('custom-upload')}
                  className="text-xs text-[#5A5A40] font-semibold underline cursor-pointer"
                >
                  Test upload a file on the Custom Slicer page →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E5E2D9] rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F7F6F2] border-b border-[#E5E2D9] text-[#5A5A40] font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">CAD File Name</th>
                      <th className="py-3 px-4">Volume (cm³)</th>
                      <th className="py-3 px-4">Material & Color</th>
                      <th className="py-3 px-4">Infill & Layer</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Quote (INR)</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2D9]">
                    {customUploads.map((up) => (
                      <tr key={up.id} className="hover:bg-[#F7F6F2]/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-xs text-[#2C2C2C]">
                          {up.fileName || 'custom_model.stl'}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{up.volumeCm3 || 24.5} cm³</td>
                        <td className="py-3 px-4 text-xs font-semibold text-[#5A5A40]">
                          {up.materialName || 'Tough PETG'} ({up.colorName || 'Signal Black'})
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#8E9299]">
                          {up.infillPercentage || 20}% • {up.layerHeightMm || 0.12}mm
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{up.quantity || 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-sm text-[#2C2C2C]">
                          {formatPrice(up.priceINR || 349)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            {up.status || 'Pending Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: DATABASE & BACKUP */}
        {/* ========================================================================= */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
                  Database & Cloud Persistence
                </h2>
                <p className="text-xs text-[#8E9299]">
                  Firebase Firestore synchronization, catalog export/import, and factory defaults restore.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-emerald-700">Firestore Connected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Reset to Defaults */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-[#E5E2D9] space-y-3">
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <RotateCcw className="w-5 h-5 text-[#5A5A40]" />
                  <h3 className="font-bold text-sm text-[#2C2C2C]">Reset Catalog to Defaults</h3>
                </div>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  Restores the standard Indian 3D catalog (Anime statues, mandala wall hangings, spiral vases, and keychains) to Firebase Firestore.
                </p>
                <button
                  onClick={async () => {
                    if (confirm('Reset entire catalog to default items? This updates Firestore.')) {
                      await resetCatalogToDefaults();
                      showNotice('Catalog reset to default 3D models.');
                    }
                  }}
                  className="w-full px-4 py-2 bg-stone-200 hover:bg-stone-300 text-[#2C2C2C] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Reset Catalog
                </button>
              </div>

              {/* Export Catalog JSON */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-[#E5E2D9] space-y-3">
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <FileText className="w-5 h-5 text-[#5A5A40]" />
                  <h3 className="font-bold text-sm text-[#2C2C2C]">Export Catalog JSON</h3>
                </div>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  Download all active models, pricing, technical specs, and UI configurations as a JSON file backup.
                </p>
                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', `urprint_catalog_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    showNotice('Catalog JSON downloaded!');
                  }}
                  className="w-full px-4 py-2 bg-[#5A5A40] hover:bg-[#737758] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Download JSON Backup
                </button>
              </div>

              {/* Reset UI Settings */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-[#E5E2D9] space-y-3">
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <Palette className="w-5 h-5 text-[#5A5A40]" />
                  <h3 className="font-bold text-sm text-[#2C2C2C]">Reset Storefront UI</h3>
                </div>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  Restores default announcement bar, carousel slides, and shipping thresholds to initial settings.
                </p>
                <button
                  onClick={async () => {
                    if (confirm('Reset UI settings and announcements to default?')) {
                      await resetStoreSettings();
                      setUiForm(storeSettings);
                      showNotice('Storefront settings reset to default.');
                    }
                  }}
                  className="w-full px-4 py-2 bg-stone-200 hover:bg-stone-300 text-[#2C2C2C] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Reset Storefront Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
