import React, { useState } from 'react';
import { Product, MaterialOption, ColorOption, ProductSize, ProductReview } from '../types';
import { useStore } from '../context/StoreContext';
import { ThreeDViewer } from './ThreeDViewer';
import { REVIEWS_DATABASE } from '../data/products';
import { PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  MapPin,
  ChevronDown,
  ChevronUp,
  Box,
  Gift,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  MessageSquarePlus,
  Share2,
  Eye,
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setIsPrintHubModalOpen,
    giftWrapping,
    setGiftWrapping,
    giftNote,
    setGiftNote,
    setCurrentView,
  } = useStore();

  // Selected Options State
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'photos' | '3d'>('photos');

  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(product.materials[0]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);

  // Custom dimensions state
  const [isCustomDimensions, setIsCustomDimensions] = useState(false);
  const [customWidthMm, setCustomWidthMm] = useState(selectedSize.dimensions.widthMm);
  const [customDepthMm, setCustomDepthMm] = useState(selectedSize.dimensions.depthMm);
  const [customHeightMm, setCustomHeightMm] = useState(selectedSize.dimensions.heightMm);

  const [quantity, setQuantity] = useState(1);

  // Accordions State
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: true,
    dimensions: true,
    shipping: false,
    sku: false,
  });

  // Modals
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Reviews state
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(
    REVIEWS_DATABASE[product.id] || [
      {
        id: 'default-rev-1',
        productId: product.id,
        userName: 'Sophia Chen',
        userLocation: 'San Francisco, CA',
        rating: 5,
        date: 'July 18, 2026',
        title: 'Exceeded print precision expectations',
        comment: 'The layer line resolution in Tough PETG is immaculate. Exactly as described in the 3D preview.',
        verified: true,
        materialUsed: 'Tough PETG - Obsidian Black',
        helpfulCount: 14,
      },
    ]
  );

  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  // Calculate dynamic price based on size multiplier + custom dimension scaling
  const customScaleFactor = isCustomDimensions
    ? (customWidthMm * customDepthMm * customHeightMm) /
      (selectedSize.dimensions.widthMm * selectedSize.dimensions.depthMm * selectedSize.dimensions.heightMm)
    : 1.0;

  const currentScaleFactor = selectedSize.scaleFactor * Math.max(0.4, Math.min(3.0, customScaleFactor));
  const dynamicUnitPrice = product.basePrice * selectedMaterial.priceMultiplier * currentScaleFactor;
  const totalPrice = dynamicUnitPrice * quantity;

  const wishlisted = isWishlisted(product.id);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText || !newReviewAuthor) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      userName: newReviewAuthor,
      userLocation: 'Verified Customer',
      rating: newReviewRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: newReviewTitle || 'Awesome Print Quality!',
      comment: newReviewText,
      verified: true,
      materialUsed: `${selectedMaterial.name} - ${selectedColor.name}`,
      helpfulCount: 0,
    };

    setReviewsList((prev) => [newRev, ...prev]);
    setNewReviewText('');
    setNewReviewTitle('');
    setNewReviewAuthor('');
    setIsReviewFormOpen(false);
  };

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="bg-[#FAF9F6] font-sans text-[#2C2C2C] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8E9299] mb-6">
          <button onClick={() => setCurrentView('home')} className="hover:text-[#5A5A40]">Home</button>
          <span>/</span>
          <button onClick={() => setCurrentView('catalog')} className="hover:text-[#5A5A40]">Catalog</button>
          <span>/</span>
          <span className="text-[#2C2C2C] font-semibold">{product.category}</span>
          <span>/</span>
          <span className="text-[#8E9299] truncate">{product.name}</span>
        </div>

        {/* Main Grid: Left Gallery & Right Sticky Buying Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Image Gallery (Vertical Thumbnails + Main View / 3D Canvas) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
            {/* Thumbnail Strip */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto max-h-[540px]">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImageIdx(idx);
                    setViewMode('photos');
                  }}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    viewMode === 'photos' && selectedImageIdx === idx
                      ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/20 shadow-xs'
                      : 'border-[#E5E2D9] hover:border-[#5A5A40] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`${product.name} view ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}

              {/* 3D Model View Thumbnail Toggle Button */}
              <button
                onClick={() => setViewMode('3d')}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#2C2C2C] text-[#D1CFB9] font-mono text-[10px] flex flex-col items-center justify-center gap-1 shrink-0 border-2 transition-all ${
                  viewMode === '3d'
                    ? 'border-[#D1CFB9] ring-2 ring-[#D1CFB9]/30'
                    : 'border-[#3F3F2C] hover:border-[#5A5A40] text-stone-300'
                }`}
              >
                <Box className="w-5 h-5 text-[#D1CFB9]" />
                <span>Interactive 3D</span>
              </button>
            </div>

            {/* Large Main Image Display or Interactive 3D Canvas */}
            <div className="order-1 sm:order-2 flex-1 relative bg-white rounded-2xl overflow-hidden border border-[#E5E2D9] min-h-[420px] sm:min-h-[540px] shadow-xs">
              {viewMode === 'photos' ? (
                <div className="w-full h-full relative group">
                  <img
                    src={product.images[selectedImageIdx]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                    referrerPolicy="no-referrer"
                  />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {product.badges?.map((b) => (
                      <span key={b} className="bg-[#2C2C2C] text-[#D1CFB9] text-xs font-mono font-bold uppercase px-3 py-1 rounded-full shadow-md">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <ThreeDViewer
                  geometryType={product.stlGeometryType}
                  colorHex={selectedColor.hex}
                  materialFinish={selectedMaterial.name}
                  height="h-[520px]"
                  customDimensions={{
                    x: isCustomDimensions ? customWidthMm : selectedSize.dimensions.widthMm,
                    y: isCustomDimensions ? customDepthMm : selectedSize.dimensions.depthMm,
                    z: isCustomDimensions ? customHeightMm : selectedSize.dimensions.heightMm,
                  }}
                />
              )}

              {/* Mode Toggle Pills overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs border border-[#E5E2D9] flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setViewMode('photos')}
                    className={`px-2.5 py-0.5 rounded-full transition-colors ${viewMode === 'photos' ? 'bg-[#2C2C2C] text-white font-semibold' : 'text-[#4A4A4A] hover:text-[#2C2C2C]'}`}
                  >
                    Photos
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${viewMode === '3d' ? 'bg-[#5A5A40] text-white font-semibold' : 'text-[#4A4A4A] hover:text-[#2C2C2C]'}`}
                  >
                    <Box className="w-3 h-3" />
                    <span>3D Canvas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Customization & Accordions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header: Title, Subtitle, Rating */}
            <div className="space-y-2 pb-4 border-b border-[#E5E2D9]">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-widest text-[#5A5A40] font-bold">
                  {product.category}
                </span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-colors ${
                    wishlisted ? 'bg-rose-50 text-rose-600 font-semibold' : 'bg-[#F2F0EA] text-[#4A4A4A] hover:bg-[#E5E2D9]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-rose-600' : ''}`} />
                  <span>{wishlisted ? 'Wishlisted' : 'Save to Wishlist'}</span>
                </button>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C2C] leading-tight">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#8E9299]">{product.subtitle}</p>

              {/* Ratings */}
              <div className="flex items-center gap-2 text-xs pt-1">
                <div className="flex text-[#5A5A40]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-[#5A5A40]' : 'text-[#E5E2D9]'}`} />
                  ))}
                </div>
                <span className="font-bold text-[#2C2C2C]">{product.rating}</span>
                <span className="text-[#8E9299]">•</span>
                <a href="#reviews" className="text-[#5A5A40] hover:underline font-medium">
                  {reviewsList.length} Verified Customer Reviews
                </a>
              </div>

              {/* Price display */}
              <div className="pt-3 flex items-baseline gap-3">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C2C]">
                  {formatPrice(dynamicUnitPrice)}
                </span>
                <span className="text-xs text-[#8E9299] font-mono">
                  (Includes Duties & Taxes)
                </span>
              </div>
            </div>

            {/* Material Selector with Badges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#2C2C2C] flex items-center gap-1">
                  <span>Material / Filament:</span>
                  <span className="text-[#5A5A40] font-normal">{selectedMaterial.name}</span>
                </label>
                <span className="text-[#8E9299] font-mono">{selectedMaterial.properties.finish}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {product.materials.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedMaterial.id === mat.id
                        ? 'border-[#5A5A40] bg-[#F2F0EA] ring-1 ring-[#5A5A40]/30'
                        : 'border-[#E5E2D9] hover:border-[#5A5A40] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2C2C2C]">{mat.name}</span>
                      {mat.badge && (
                        <span className="text-[9px] font-mono bg-[#2C2C2C] text-[#FAF9F6] px-1.5 py-0.5 rounded-sm">
                          {mat.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8E9299] line-clamp-1 mt-0.5">{mat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#2C2C2C]">
                  Color Swatch: <span className="text-[#5A5A40] font-normal">{selectedColor.name}</span>
                </label>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className={`group/color relative w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center ${
                      selectedColor.id === color.id
                        ? 'scale-110 border-[#5A5A40] ring-2 ring-[#5A5A40]/30'
                        : 'border-[#E5E2D9] hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor.id === color.id && (
                      <CheckCircle2 className={`w-4 h-4 ${color.hex === '#F5F5F4' || color.hex === '#FFFFFF' ? 'text-[#2C2C2C]' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector: Preset vs Custom Input */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#2C2C2C]">Dimensions & Scale</label>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-[#5A5A40] hover:underline font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fit Guide</span>
                </button>
              </div>

              {/* Toggle Custom Slicing Dimensions */}
              <div className="flex items-center gap-2 bg-[#F7F6F2] p-1 rounded-xl text-xs font-semibold text-[#4A4A4A] border border-[#E5E2D9]">
                <button
                  onClick={() => setIsCustomDimensions(false)}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    !isCustomDimensions ? 'bg-white shadow-xs text-[#2C2C2C]' : 'hover:text-[#2C2C2C]'
                  }`}
                >
                  Preset Sizes
                </button>
                <button
                  onClick={() => setIsCustomDimensions(true)}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    isCustomDimensions ? 'bg-[#5A5A40] text-white shadow-xs font-bold' : 'hover:text-[#2C2C2C]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#D1CFB9]" />
                  <span>Custom Dimensions (mm)</span>
                </button>
              </div>

              {!isCustomDimensions ? (
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSize(s);
                        setCustomWidthMm(s.dimensions.widthMm);
                        setCustomDepthMm(s.dimensions.depthMm);
                        setCustomHeightMm(s.dimensions.heightMm);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all text-xs ${
                        selectedSize.id === s.id
                          ? 'border-[#5A5A40] bg-[#F2F0EA] font-bold text-[#2C2C2C]'
                          : 'border-[#E5E2D9] hover:border-[#5A5A40] text-[#4A4A4A] bg-white'
                      }`}
                    >
                      <p className="font-semibold">{s.label}</p>
                      <p className="text-[10px] text-[#8E9299] font-mono mt-0.5">
                        {s.dimensions.widthMm}×{s.dimensions.heightMm}mm
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-[#F7F6F2] p-3 rounded-xl border border-[#5A5A40]/40 space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <label className="text-[10px] text-[#8E9299] block">Width X (mm)</label>
                      <input
                        type="number"
                        min="30"
                        max="500"
                        value={customWidthMm}
                        onChange={(e) => setCustomWidthMm(Number(e.target.value))}
                        className="w-full mt-1 bg-white border border-[#E5E2D9] rounded-md p-1.5 text-center font-bold text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8E9299] block">Depth Y (mm)</label>
                      <input
                        type="number"
                        min="30"
                        max="500"
                        value={customDepthMm}
                        onChange={(e) => setCustomDepthMm(Number(e.target.value))}
                        className="w-full mt-1 bg-white border border-[#E5E2D9] rounded-md p-1.5 text-center font-bold text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8E9299] block">Height Z (mm)</label>
                      <input
                        type="number"
                        min="30"
                        max="500"
                        value={customHeightMm}
                        onChange={(e) => setCustomHeightMm(Number(e.target.value))}
                        className="w-full mt-1 bg-white border border-[#E5E2D9] rounded-md p-1.5 text-center font-bold text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#5A5A40] text-center font-semibold">
                    ⚡ Auto-scaled volume quote: Price updates live based on bounding box dimensions.
                  </p>
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart Button */}
            <div className="space-y-3 pt-4 border-t border-[#E5E2D9]">
              <div className="flex items-center gap-3">
                {/* Quantity Editor */}
                <div className="flex items-center border border-[#E5E2D9] rounded-xl bg-white overflow-hidden text-xs font-bold">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-3 hover:bg-[#F7F6F2] text-[#2C2C2C] transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 text-[#2C2C2C]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-3 hover:bg-[#F7F6F2] text-[#2C2C2C] transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Main Add to Cart Button */}
                <button
                  onClick={() =>
                    addToCart(
                      product,
                      selectedMaterial,
                      selectedColor,
                      selectedSize,
                      isCustomDimensions
                        ? { widthMm: customWidthMm, depthMm: customDepthMm, heightMm: customHeightMm }
                        : undefined,
                      quantity
                    )
                  }
                  className="flex-1 bg-[#2C2C2C] hover:bg-[#444444] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4 text-[#D1CFB9] group-hover:scale-110 transition-transform" />
                  <span>Add to Cart • {formatPrice(totalPrice)}</span>
                </button>
              </div>

              {/* Gift Wrapping Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-[#2C2C2C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftWrapping}
                    onChange={(e) => setGiftWrapping(e.target.checked)}
                    className="rounded border-[#E5E2D9] text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                  <Gift className="w-4 h-4 text-[#5A5A40]" />
                  <span>Add Eco-Gift Packaging & Handwritten Note (+$4.00)</span>
                </label>
                {giftWrapping && (
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Enter gift message to include in box..."
                    className="w-full mt-2 p-2.5 text-xs bg-white border border-[#E5E2D9] rounded-lg focus:outline-hidden focus:border-[#5A5A40]"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* Store Hub Locator module */}
            <div className="bg-[#F2F0EA] border border-[#E5E2D9] p-3.5 rounded-2xl flex items-center justify-between text-xs text-[#2C2C2C]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-[#5A5A40] shrink-0" />
                <div>
                  <p className="font-bold">Check Print Hub Availability</p>
                  <p className="text-[11px] text-[#8E9299]">Local 2-hour pickup or local lab dispatch available.</p>
                </div>
              </div>
              <button
                onClick={() => setIsPrintHubModalOpen(true)}
                className="bg-[#2C2C2C] hover:bg-[#444444] text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0"
              >
                Find Hub
              </button>
            </div>

            {/* EXPANDABLE ACCORDIONS */}
            <div className="border-t border-[#E5E2D9] pt-2 space-y-1">
              {/* Accordion 1: Details */}
              <div className="border-b border-[#E5E2D9] py-3">
                <button
                  onClick={() => toggleAccordion('details')}
                  className="w-full flex items-center justify-between text-sm font-bold text-[#2C2C2C] text-left"
                >
                  <span>Details & Print Specifications</span>
                  {openAccordions.details ? <ChevronUp className="w-4 h-4 text-[#8E9299]" /> : <ChevronDown className="w-4 h-4 text-[#8E9299]" />}
                </button>
                {openAccordions.details && (
                  <div className="mt-3 text-xs text-[#4A4A4A] space-y-2 leading-relaxed">
                    <p>{product.detailsAccordion}</p>
                    <div className="grid grid-cols-2 gap-2 font-mono bg-[#F7F6F2] p-3 rounded-xl border border-[#E5E2D9] text-[11px]">
                      <div><span className="text-[#8E9299]">Layer Height:</span> {product.specs.layerHeightMm}mm</div>
                      <div><span className="text-[#8E9299]">Infill Density:</span> {product.specs.infillPercentage}%</div>
                      <div><span className="text-[#8E9299]">Weight:</span> {product.specs.weightGrams}g</div>
                      <div><span className="text-[#8E9299]">Est. Print Time:</span> {product.specs.printTimeHours}h</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Size & Fit / Dimensions */}
              <div className="border-b border-[#E5E2D9] py-3">
                <button
                  onClick={() => toggleAccordion('dimensions')}
                  className="w-full flex items-center justify-between text-sm font-bold text-[#2C2C2C] text-left"
                >
                  <span>Size & Fit / Dimensions</span>
                  {openAccordions.dimensions ? <ChevronUp className="w-4 h-4 text-[#8E9299]" /> : <ChevronDown className="w-4 h-4 text-[#8E9299]" />}
                </button>
                {openAccordions.dimensions && (
                  <div className="mt-3 text-xs text-[#4A4A4A] space-y-2">
                    <div className="bg-[#F7F6F2] p-3 rounded-xl border border-[#E5E2D9] space-y-1 font-mono">
                      <p><span className="font-bold text-[#2C2C2C]">Width (X):</span> {isCustomDimensions ? customWidthMm : selectedSize.dimensions.widthMm} mm</p>
                      <p><span className="font-bold text-[#2C2C2C]">Depth (Y):</span> {isCustomDimensions ? customDepthMm : selectedSize.dimensions.depthMm} mm</p>
                      <p><span className="font-bold text-[#2C2C2C]">Height (Z):</span> {isCustomDimensions ? customHeightMm : selectedSize.dimensions.heightMm} mm</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="border-b border-[#E5E2D9] py-3">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-sm font-bold text-[#2C2C2C] text-left"
                >
                  <span>Shipping & Free Returns</span>
                  {openAccordions.shipping ? <ChevronUp className="w-4 h-4 text-[#8E9299]" /> : <ChevronDown className="w-4 h-4 text-[#8E9299]" />}
                </button>
                {openAccordions.shipping && (
                  <div className="mt-3 text-xs text-[#4A4A4A] space-y-2 leading-relaxed">
                    <p>• Orders are printed on-demand within 24-48 hours at your nearest regional print hub.</p>
                    <p>• Free Express Global Shipping on orders over $50. All import duties and local taxes included at checkout.</p>
                    <p>• 30-Day zero-defect returns on all standard model purchases.</p>
                  </div>
                )}
              </div>

              {/* Accordion 4: Product Code / SKU & Licensing */}
              <div className="border-b border-[#E5E2D9] py-3">
                <button
                  onClick={() => toggleAccordion('sku')}
                  className="w-full flex items-center justify-between text-sm font-bold text-[#2C2C2C] text-left"
                >
                  <span>Product Code / SKU & Licensing</span>
                  {openAccordions.sku ? <ChevronUp className="w-4 h-4 text-[#8E9299]" /> : <ChevronDown className="w-4 h-4 text-[#8E9299]" />}
                </button>
                {openAccordions.sku && (
                  <div className="mt-3 text-xs text-[#4A4A4A] space-y-1 font-mono">
                    <p><span className="text-[#8E9299]">SKU Code:</span> {product.specs.sku}</p>
                    <p><span className="text-[#8E9299]">Designer:</span> {product.specs.designer}</p>
                    <p><span className="text-[#8E9299]">License:</span> {product.specs.license}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Need Help block */}
            <div className="bg-[#F7F6F2] p-4 rounded-xl flex items-center justify-between text-xs text-[#2C2C2C] border border-[#E5E2D9]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#5A5A40]" />
                <span>Need assistance with custom sizing or slicing?</span>
              </div>
              <a
                href="mailto:support@forge3d.com"
                className="font-bold text-[#2C2C2C] underline hover:text-[#5A5A40]"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* REVIEWS & RATINGS SECTION */}
        <section id="reviews" className="mt-16 pt-12 border-t border-[#E5E2D9] space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">Customer Ratings & Photos</h2>
              <p className="text-xs text-[#8E9299]">Real print photos and feedback from verified purchasers.</p>
            </div>

            <button
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
              className="bg-[#2C2C2C] hover:bg-[#444444] text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#D1CFB9]" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Write Review Form */}
          {isReviewFormOpen && (
            <form onSubmit={handleAddReview} className="bg-[#F7F6F2] p-6 rounded-2xl border border-[#E5E2D9] space-y-4 max-w-xl">
              <h3 className="font-bold text-[#2C2C2C] text-sm">Write Your Print Review</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full p-2 bg-white border border-[#E5E2D9] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#E5E2D9] rounded-lg text-xs"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Perfect Print)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars - Great)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">Review Title</label>
                <input
                  type="text"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Flawless layer precision!"
                  className="w-full p-2 bg-white border border-[#E5E2D9] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2C2C2C] block mb-1">Review Details</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share details about layer lines, material feel, or surface finish..."
                  className="w-full p-2 bg-white border border-[#E5E2D9] rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="bg-[#5A5A40] hover:bg-[#737758] text-white font-bold text-xs py-2 px-4 rounded-lg">
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setIsReviewFormOpen(false)}
                  className="bg-[#E5E2D9] hover:bg-[#D1CFB9] text-[#2C2C2C] text-xs py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2C2C2C] text-white font-bold text-xs flex items-center justify-center">
                      {rev.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#2C2C2C] flex items-center gap-1.5">
                        <span>{rev.userName}</span>
                        {rev.verified && (
                          <span className="bg-[#F2F0EA] text-[#5A5A40] border border-[#E5E2D9] text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                            Verified Purchase
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-[#8E9299]">{rev.userLocation} • {rev.date}</p>
                    </div>
                  </div>

                  <div className="flex text-[#5A5A40]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#5A5A40]' : 'text-[#E5E2D9]'}`} />
                    ))}
                  </div>
                </div>

                <h4 className="font-bold text-sm text-[#2C2C2C]">{rev.title}</h4>
                <p className="text-xs text-[#4A4A4A] leading-relaxed">{rev.comment}</p>

                {rev.materialUsed && (
                  <p className="text-[10px] font-mono text-[#8E9299]">
                    Printed in: <span className="text-[#2C2C2C]">{rev.materialUsed}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* RELATED PRODUCTS CAROUSEL */}
        <section className="mt-16 pt-12 border-t border-[#E5E2D9] space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      </div>

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-[#2C2C2C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-[#E5E2D9]">
            <h3 className="font-serif text-xl font-bold text-[#2C2C2C]">3D Print Sizing & Volume Guide</h3>
            <p className="text-xs text-[#8E9299] leading-relaxed">
              When entering custom dimensions (X, Y, Z mm), our automatic slicer scales your model uniformly or along custom axes.
            </p>
            <div className="bg-[#F7F6F2] p-4 rounded-xl border border-[#E5E2D9] space-y-2 text-xs font-mono">
              <p><span className="text-[#5A5A40] font-bold">X-Axis (Width):</span> Left to right measurement across print bed.</p>
              <p><span className="text-[#5A5A40] font-bold">Y-Axis (Depth):</span> Front to back depth of model.</p>
              <p><span className="text-[#5A5A40] font-bold">Z-Axis (Height):</span> Vertical height of layer stack.</p>
              <p className="text-[#8E9299] text-[10px] pt-1">* Maximum single-piece build volume: 300 × 300 × 400 mm.</p>
            </div>
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full bg-[#2C2C2C] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-[#444444]"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
