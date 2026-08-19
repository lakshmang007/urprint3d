import React, { useState } from 'react';
import { Product, ProductSize } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Star, Eye, ShoppingBag, Maximize2, Sliders } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    openProductDetail,
    formatPrice,
    toggleWishlist,
    isWishlisted,
    setQuickViewProduct,
    addToCart,
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [selectedColorHex, setSelectedColorHex] = useState(product.colors[0]?.hex || '#1C1917');
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);
  const [customScalePercent, setCustomScalePercent] = useState<number>(
    Math.round(product.sizes[0].scaleFactor * 100)
  );

  const wishlisted = isWishlisted(product.id);

  // Reference base dimensions (100% scale)
  const stdSize = product.sizes.find((s) => s.scaleFactor === 1.0) || product.sizes[0];
  const baseW = stdSize.dimensions.widthMm / (stdSize.scaleFactor || 1);
  const baseD = stdSize.dimensions.depthMm / (stdSize.scaleFactor || 1);
  const baseH = stdSize.dimensions.heightMm / (stdSize.scaleFactor || 1);

  // Bounds for Min (25%) and Max (250%)
  const minScalePct = 25;
  const maxScalePct = 250;
  const minWidthMm = Math.max(10, Math.round(baseW * 0.25));
  const minHeightMm = Math.max(10, Math.round(baseH * 0.25));
  const maxWidthMm = Math.round(baseW * 2.5);
  const maxHeightMm = Math.round(baseH * 2.5);

  // Selected scale factor & current dimensions
  const scaleFactor = customScalePercent / 100;
  const curW = Math.round(baseW * scaleFactor);
  const curD = Math.round(baseD * scaleFactor);
  const curH = Math.round(baseH * scaleFactor);

  // Price for current scale
  const calculatedPriceUSD = product.basePrice * scaleFactor;

  const selectedColorObj =
    product.colors.find((c) => c.hex === selectedColorHex) || product.colors[0];

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'NEW':
        return 'bg-[#5A5A40] text-white';
      case 'BESTSELLER':
        return 'bg-[#2C2C2C] text-[#D1CFB9] border border-[#5A5A40]';
      case 'SUSTAINABLE':
        return 'bg-[#737758] text-white';
      case 'LIMITED':
        return 'bg-[#3F3F2C] text-[#FAF9F6]';
      case 'TRENDING':
        return 'bg-[#5A5A40] text-white';
      default:
        return 'bg-[#F2F0EA] text-[#2C2C2C] border border-[#E5E2D9]';
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl border border-[#E5E2D9] hover:border-[#5A5A40] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* 1. Image Container with Hover Swap */}
      <div
        onClick={() => openProductDetail(product)}
        className="relative aspect-4/3 w-full overflow-hidden bg-[#F7F6F2] cursor-pointer"
      >
        <img
          src={isHovered && product.hoverImage ? product.hoverImage : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Badges Top-Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          {product.badges?.map((b) => (
            <span
              key={b}
              className={`text-[10px] uppercase font-mono tracking-wider font-bold px-2.5 py-0.5 rounded-full shadow-xs ${getBadgeStyle(
                b
              )}`}
            >
              {b}
            </span>
          ))}
        </div>

        {/* Wishlist Heart Top-Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-xs transition-all z-10 ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-[#2C2C2C] text-xs font-semibold py-2.5 rounded-xl shadow-md border border-[#E5E2D9] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* 2. Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div className="space-y-1">
          {/* Rating */}
          <div className="flex items-center gap-1 text-[#5A5A40] text-xs">
            <Star className="w-3.5 h-3.5 fill-[#5A5A40]" />
            <span className="font-semibold text-[#2C2C2C]">{product.rating}</span>
            <span className="text-[#8E9299] text-[11px]">({product.reviewCount})</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => openProductDetail(product)}
            className="font-serif text-base font-bold text-[#2C2C2C] group-hover:text-[#5A5A40] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Subtitle */}
          <p className="text-xs text-[#8E9299] line-clamp-1">{product.subtitle}</p>
        </div>

        {/* Color Swatch Dots */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 5).map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColorHex(color.hex)}
                className={`w-4 h-4 rounded-full border border-[#E5E2D9] transition-transform ${
                  selectedColorHex === color.hex ? 'scale-125 ring-2 ring-[#5A5A40]' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#8E9299] font-mono">{selectedColorObj.name}</span>
        </div>

        {/* 3. Print Scale Selector & Size Bounds */}
        <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#2C2C2C]">
            <span className="flex items-center gap-1 text-[#5A5A40]">
              <Maximize2 className="w-3 h-3" />
              <span>Print Scale Options:</span>
            </span>
            <span className="font-mono text-[#5A5A40] font-bold">{customScalePercent}% Scale</span>
          </div>

          {/* Preset Scale Buttons */}
          <div className="grid grid-cols-4 gap-1">
            {[50, 100, 150, 200].map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  setCustomScalePercent(pct);
                  const matchingSize = product.sizes.find(
                    (s) => Math.round(s.scaleFactor * 100) === pct
                  );
                  if (matchingSize) setSelectedSize(matchingSize);
                }}
                className={`py-1 text-[10px] font-mono font-bold rounded-md transition-all ${
                  customScalePercent === pct
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'bg-white text-[#2C2C2C] hover:bg-[#E5E2D9] border border-[#E5E2D9]'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Scale Slider */}
          <div className="space-y-1 pt-0.5">
            <input
              type="range"
              min={minScalePct}
              max={maxScalePct}
              step={5}
              value={customScalePercent}
              onChange={(e) => setCustomScalePercent(Number(e.target.value))}
              className="w-full accent-[#5A5A40] h-1.5 bg-[#E5E2D9] rounded-lg cursor-pointer"
            />

            {/* Min and Max Scale Size Mention */}
            <div className="flex justify-between items-center text-[9px] font-mono text-[#8E9299]">
              <span>Min: {minScalePct}% ({minWidthMm}×{minHeightMm}mm)</span>
              <span>Max: {maxScalePct}% ({maxWidthMm}×{maxHeightMm}mm)</span>
            </div>
          </div>

          {/* Active Dimension Preview */}
          <div className="text-[10px] font-mono text-[#2C2C2C] bg-white px-2 py-1 rounded-md border border-[#E5E2D9] flex items-center justify-between">
            <span className="text-[#8E9299]">Selected Dimensions:</span>
            <span className="font-bold">{curW}×{curD}×{curH} mm</span>
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-[#E5E2D9] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8E9299] block font-mono">Price @ {customScalePercent}% Scale</span>
            <span className="font-serif text-lg font-bold text-[#2C2C2C]">
              {formatPrice(calculatedPriceUSD)}
            </span>
          </div>

          <button
            onClick={() => {
              const customSize: ProductSize = {
                id: `scale-${customScalePercent}`,
                label: `Custom Scale (${customScalePercent}%)`,
                scaleFactor: scaleFactor,
                dimensions: { widthMm: curW, depthMm: curD, heightMm: curH },
              };
              addToCart(
                product,
                product.materials[0],
                selectedColorObj,
                customSize,
                { widthMm: curW, depthMm: curD, heightMm: curH }
              );
            }}
            className="bg-[#2C2C2C] hover:bg-[#444444] text-white px-3 py-2 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 text-xs font-semibold"
            title={`Add Model at ${customScalePercent}% Scale to Cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D1CFB9]" />
            <span>Add ({customScalePercent}%)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
