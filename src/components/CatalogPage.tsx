import React from 'react';
import { useStore } from '../context/StoreContext';
import { MATERIAL_OPTIONS } from '../data/materials';
import { CURRENCIES } from '../data/currencies';
import { ProductCard } from './ProductCard';
import { ProductCardSkeletonGrid } from './ProductCardSkeleton';
import {
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Box,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const {
    filterState,
    setFilterState,
    resetFilters,
    currency,
    products,
    isLoadingProducts,
    refreshProducts,
    setIsManageModalOpen,
    isFirebaseConnected,
  } = useStore();

  const categories = [
    'All',
    'Anime & Action Figures',
    'Home Decor',
    'Wall Hangings',
    'Keychains',
  ];

  // Filter products based on active state (Category, Search query, Price range, Rating, Materials)
  const filteredProducts = products
    .filter((p) => {
      // 1. Category Filter
      if (filterState.category !== 'All' && p.category !== filterState.category) {
        return false;
      }

      // 2. Search Query Filter (Name, Category, Subtitle, Badges)
      if (filterState.searchQuery && filterState.searchQuery.trim() !== '') {
        const query = filterState.searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        const matchSubtitle = p.subtitle?.toLowerCase().includes(query);
        const matchTags = p.badges?.some((b) => b.toLowerCase().includes(query));
        if (!matchName && !matchCategory && !matchSubtitle && !matchTags) {
          return false;
        }
      }

      // 3. Price Filter
      if (p.basePrice < filterState.minPrice || p.basePrice > filterState.maxPrice) {
        return false;
      }

      // 4. Rating Filter
      if (filterState.minRating > 0 && p.rating < filterState.minRating) {
        return false;
      }

      // 5. Materials Filter
      if (filterState.materials.length > 0) {
        const hasMaterial = p.materials.some((m) => filterState.materials.includes(m.name));
        if (!hasMaterial) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filterState.sort) {
        case 'price-low':
          return a.basePrice - b.basePrice;
        case 'price-high':
          return b.basePrice - a.basePrice;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.badges?.includes('NEW') ? 1 : -1;
        case 'trending':
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

  const toggleMaterialFilter = (matName: string) => {
    setFilterState((prev) => ({
      ...prev,
      materials: prev.materials.includes(matName)
        ? prev.materials.filter((m) => m !== matName)
        : [...prev.materials, matName],
    }));
  };

  const handleClearSearch = () => {
    setFilterState((prev) => ({ ...prev, searchQuery: '' }));
  };

  return (
    <div className="bg-stone-50 min-h-screen font-sans pb-20">
      {/* Top Banner */}
      <div className="bg-[#2C2C2C] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#5A5A40]/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#D1CFB9]">
                UrPrint-3D models Catalog
              </span>
              {isFirebaseConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#3F3F2C] text-[#FAF9F6] px-2 py-0.5 rounded-full border border-[#5A5A40]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Firebase Connected</span>
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-1">Shop All 3D Models</h1>
            <p className="text-xs sm:text-sm text-[#A5A898] mt-1">
              Select custom scale options (25% - 250%) for all 3D models with real-time sizing preview and precision bio-polymer printing.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsManageModalOpen(true)}
              className="bg-[#5A5A40] hover:bg-[#6D6D4E] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              title="Add or edit 3D models in Firebase database"
            >
              <Plus className="w-4 h-4 text-[#D1CFB9]" />
              <span>+ Add / Modify Models (Firebase)</span>
            </button>

            <div className="bg-[#3A3A3A] px-4 py-2.5 rounded-xl text-xs font-mono text-[#FAF9F6] border border-[#5A5A40]/50 flex items-center gap-2">
              <Box className="w-4 h-4 text-[#D1CFB9]" />
              <span>{filteredProducts.length} Models</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Horizontal Category Pill Bar & Quick Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterState((prev) => ({ ...prev, category: cat }))}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  filterState.category === cat
                    ? 'bg-[#2C2C2C] text-[#FAF9F6] shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-[#E5E2D9] border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick search input on Catalog Header */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={filterState.searchQuery || ''}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="Search catalog models..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-300 rounded-full focus:outline-hidden focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/20 text-stone-900"
            />
            {filterState.searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Catalog Main Layout (Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Sidebar Filters */}
          <aside className="lg:col-span-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#5A5A40]" />
                <span>Filters</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-stone-500 hover:text-[#5A5A40] font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                Price Range ({CURRENCIES[currency]?.symbol || '₹'})
              </label>
              <div className="flex items-center gap-2 text-xs font-mono">
                <input
                  type="number"
                  value={filterState.minPrice}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, minPrice: Number(e.target.value) }))
                  }
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  placeholder="Min"
                />
                <span className="text-stone-400">-</span>
                <input
                  type="number"
                  value={filterState.maxPrice}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
                  }
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Material Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">Polymer Material</label>
              <div className="space-y-1.5 text-xs text-stone-700">
                {MATERIAL_OPTIONS.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 cursor-pointer hover:text-stone-900"
                  >
                    <input
                      type="checkbox"
                      checked={filterState.materials.includes(m.name)}
                      onChange={() => toggleMaterialFilter(m.name)}
                      className="rounded border-stone-300 text-[#5A5A40] focus:ring-[#5A5A40]"
                    />
                    <span>{m.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">Minimum Rating</label>
              <select
                value={filterState.minRating}
                onChange={(e) =>
                  setFilterState((prev) => ({ ...prev, minRating: Number(e.target.value) }))
                }
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              >
                <option value={0}>All Ratings</option>
                <option value={4.5}>4.5+ Stars ⭐</option>
                <option value={4.8}>4.8+ Stars ⭐</option>
              </select>
            </div>
          </aside>

          {/* RIGHT: Main Product Grid */}
          <main className="lg:col-span-9 space-y-4">
            {/* Sorting & Active Filters Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              {/* Active Filter Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-stone-500 font-medium">Active:</span>

                {filterState.searchQuery && (
                  <span className="bg-[#5A5A40]/15 text-[#3F3F2C] border border-[#5A5A40]/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <Search className="w-3 h-3 text-[#5A5A40]" />
                    <span>Search: "{filterState.searchQuery}"</span>
                    <X
                      className="w-3 h-3 hover:text-red-600 cursor-pointer"
                      onClick={handleClearSearch}
                    />
                  </span>
                )}

                {filterState.category !== 'All' && (
                  <span className="bg-stone-100 text-stone-900 border border-stone-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <span>Category: {filterState.category}</span>
                    <X
                      className="w-3 h-3 hover:text-red-600 cursor-pointer"
                      onClick={() => setFilterState((prev) => ({ ...prev, category: 'All' }))}
                    />
                  </span>
                )}

                {filterState.materials.map((m) => (
                  <span
                    key={m}
                    className="bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1"
                  >
                    <span>{m}</span>
                    <X
                      className="w-3 h-3 hover:text-red-600 cursor-pointer"
                      onClick={() => toggleMaterialFilter(m)}
                    />
                  </span>
                ))}

                {!filterState.searchQuery &&
                  filterState.category === 'All' &&
                  filterState.materials.length === 0 && (
                    <span className="text-stone-400 italic">Showing all models</span>
                  )}
              </div>

              {/* Sort By Dropdown & Refresh */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="catalog-refresh-btn"
                  onClick={() => refreshProducts()}
                  disabled={isLoadingProducts}
                  className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-700 transition-colors cursor-pointer disabled:opacity-50"
                  title="Reload models from database"
                >
                  <RotateCcw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin text-[#5A5A40]' : ''}`} />
                </button>

                <span className="text-stone-500 font-semibold">Sort By:</span>
                <select
                  value={filterState.sort}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, sort: e.target.value as any }))
                  }
                  className="bg-stone-50 border border-stone-300 rounded-lg p-2 font-semibold text-stone-900 focus:outline-hidden"
                >
                  <option value="trending">🔥 Trending Popularity</option>
                  <option value="newest">✨ Newest Arrivals</option>
                  <option value="price-low">💵 Price: Low to High</option>
                  <option value="price-high">💎 Price: High to Low</option>
                  <option value="rating">⭐ Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {isLoadingProducts ? (
              <ProductCardSkeletonGrid id="catalog-products-skeleton-grid" count={6} />
            ) : filteredProducts.length > 0 ? (
              <div id="catalog-products-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-4">
                <Box className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  No 3D Models Match Your Search
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {filterState.searchQuery
                    ? `No models found matching "${filterState.searchQuery}". Try searching for "Dragon", "Vase", or "Katana".`
                    : 'Try resetting your price range or material selection.'}
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  {filterState.searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="bg-[#5A5A40] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#474732] transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={resetFilters}
                    className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
