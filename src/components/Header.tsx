import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  UploadCloud,
  Globe,
  MapPin,
  X,
  Sparkles,
  Box,
  LayoutDashboard,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartTotalItems,
    cartSubtotalUSD,
    setIsCartDrawerOpen,
    wishlistIds,
    formatPrice,
    openProductDetail,
    setIsPrintHubModalOpen,
    products,
    isFirebaseConnected,
    storeSettings,
    filterState,
    setFilterState,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filterState.searchQuery || '');
  const [selectedCategoryPill, setSelectedCategoryPill] = useState<string>('All');
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal search input if filterState changes externally
  useEffect(() => {
    setSearchInput(filterState.searchQuery || '');
  }, [filterState.searchQuery]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    'All',
    'Anime & Action Figures',
    'Home Decor',
    'Wall Hangings',
    'Keychains',
  ];

  const popularSearchTerms = [
    'Dragon',
    'Spiral Vase',
    'Anime Katana',
    'Mandala',
    'Planter',
    'Keychains',
    'Chibi',
  ];

  // Real-time filtered products for search suggestion dropdown
  const filteredSearchProducts = products.filter((p) => {
    if (selectedCategoryPill !== 'All' && p.category !== selectedCategoryPill) {
      return false;
    }
    if (!searchInput.trim()) return true;
    const q = searchInput.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.badges?.some((b) => b.toLowerCase().includes(q))
    );
  });

  const handleExecuteSearch = (queryText: string, category = selectedCategoryPill) => {
    setFilterState((prev) => ({
      ...prev,
      searchQuery: queryText.trim(),
      category: category,
    }));
    setCurrentView('catalog');
    setIsSearchOpen(false);
    setIsDropdownFocused(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch(searchInput);
    } else if (e.key === 'Escape') {
      setIsDropdownFocused(false);
      setIsSearchOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilterState((prev) => ({ ...prev, searchQuery: '' }));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E2D9] shadow-xs transition-all">
      {/* 1. Announcement Top Bar */}
      {storeSettings?.showAnnouncement !== false && (
        <div className="bg-[#2C2C2C] text-[#FAF9F6] text-xs py-2 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Left: Announcement message */}
            <div className="flex items-center gap-3 text-[11px] font-medium tracking-wide">
              <span className="inline-flex items-center gap-1 text-[#D1CFB9]">
                <Sparkles className="w-3.5 h-3.5 text-[#D1CFB9]" />
                <span>
                  {storeSettings?.announcementText ||
                    'Free Pan-India Express Delivery on orders over ₹999'}
                </span>
              </span>
              <span className="hidden md:inline text-stone-600">•</span>
              <span className="hidden md:inline text-[#8E9299]">
                19,000+ Indian PIN Codes Serviced | All GST Included
              </span>
            </div>

            {/* Right: Currency & Print Hub Quick Link */}
            <div className="flex items-center gap-4 text-stone-300 text-xs">
              <button
                onClick={() => setIsPrintHubModalOpen(true)}
                className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D1CFB9]" />
                <span>India Print Hubs (8 Cities)</span>
              </button>

              <span className="text-stone-700">|</span>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#D1CFB9] bg-[#3F3F2C] px-2.5 py-1 rounded-md">
                <Globe className="w-3 h-3 text-[#D1CFB9]" />
                <span>INR (₹) Domestic</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Primary Navigation Bar with Integrated Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5 text-[#D1CFB9]" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2C2C2C] block leading-none">
                UrPrint<span className="text-[#5A5A40] font-sans font-medium text-lg ml-1">-3D models</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8E9299] font-sans font-medium block">
                Custom Printing & Model Marketplace
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar (Desktop & Tablet) */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl relative">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#8E9299] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onFocus={() => setIsDropdownFocused(true)}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsDropdownFocused(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search 3D models by name or category (e.g. Dragon, Anime, Vase)..."
              className="w-full pl-10 pr-20 py-2.5 bg-[#F7F6F2] hover:bg-[#F0EEE6] focus:bg-white text-xs sm:text-sm text-[#2C2C2C] placeholder-[#8E9299] rounded-full border border-[#E5E2D9] focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/15 outline-hidden transition-all shadow-2xs"
            />

            <div className="absolute right-2.5 flex items-center gap-1">
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 text-[#8E9299] hover:text-[#2C2C2C] rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleExecuteSearch(searchInput)}
                className="bg-[#5A5A40] hover:bg-[#474732] text-white p-1.5 rounded-full text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                title="Search Models"
              >
                <Search className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>

          {/* Autosuggest & Category Filter Dropdown */}
          {isDropdownFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E5E2D9] shadow-xl p-4 z-50 animate-in fade-in-50 duration-150">
              {/* Category Quick Filter Chips */}
              <div className="space-y-2 pb-3 border-b border-[#E5E2D9]">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E9299] block">
                  Filter by Category:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryPill(cat);
                        if (searchInput) {
                          handleExecuteSearch(searchInput, cat);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        selectedCategoryPill === cat
                          ? 'bg-[#2C2C2C] text-[#FAF9F6]'
                          : 'bg-[#F7F6F2] hover:bg-[#E5E2D9] text-[#4A4A4A]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Searches when search input is empty */}
              {!searchInput.trim() && (
                <div className="pt-3 space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E9299] block">
                    Popular 3D Searches:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {popularSearchTerms.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchInput(term);
                          handleExecuteSearch(term);
                        }}
                        className="bg-[#F2F0EA] hover:bg-[#5A5A40] hover:text-white text-[#2C2C2C] text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Search className="w-3 h-3 opacity-60" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtered Models Results Preview */}
              {searchInput.trim() && (
                <div className="pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E9299]">
                      Matching 3D Models ({filteredSearchProducts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(searchInput)}
                      className="text-xs font-bold text-[#5A5A40] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View in Catalog</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {filteredSearchProducts.slice(0, 5).map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          openProductDetail(prod);
                          setIsDropdownFocused(false);
                        }}
                        className="flex items-center justify-between p-2 hover:bg-[#F7F6F2] rounded-xl cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg border border-[#E5E2D9]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-semibold text-xs text-[#2C2C2C] group-hover:text-[#5A5A40] transition-colors">
                              {prod.name}
                            </p>
                            <span className="text-[10px] font-mono text-[#8E9299]">
                              {prod.category} • 0.08mm Layer
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-serif font-bold text-xs text-[#2C2C2C]">
                            {formatPrice(prod.basePrice)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {filteredSearchProducts.length === 0 && (
                      <div className="text-center py-6 text-xs text-[#8E9299] space-y-1">
                        <p>No 3D models match "{searchInput}".</p>
                        <p className="text-[11px]">
                          Try searching for "Dragon", "Anime", "Vase", or check all categories.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Navigation Links & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-3 text-sm font-medium text-[#4A4A4A]">
            <button
              onClick={() => {
                setFilterState((prev) => ({ ...prev, searchQuery: '', category: 'All' }));
                setCurrentView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-[#5A5A40] transition-colors py-1 cursor-pointer ${
                currentView === 'catalog' && !filterState.searchQuery
                  ? 'text-[#2C2C2C] border-b-2 border-[#2C2C2C] font-semibold'
                  : ''
              }`}
            >
              Shop Models
            </button>
            <button
              onClick={() => setCurrentView('custom-upload')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E5E2D9] text-[#5A5A40] bg-[#F2F0EA] hover:bg-[#E5E2D9] transition-colors cursor-pointer ${
                currentView === 'custom-upload' ? 'bg-[#5A5A40] text-white font-semibold' : ''
              }`}
            >
              <UploadCloud className="w-4 h-4 text-[#5A5A40]" />
              <span>Custom Print</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all font-bold text-xs shadow-xs cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#2C2C2C] text-[#FAF9F6] border-[#2C2C2C]'
                  : 'bg-white border-[#5A5A40]/40 text-[#2C2C2C] hover:bg-[#F2F0EA]'
              }`}
              title="Open Creator & Storefront Admin Dashboard"
            >
              <LayoutDashboard
                className={`w-3.5 h-3.5 ${
                  currentView === 'dashboard' ? 'text-[#D1CFB9]' : 'text-[#5A5A40]'
                }`}
              />
              <span>Admin Studio</span>
            </button>
          </nav>

          {/* Mobile Search Toggle Icon */}
          <div className="md:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#4A4A4A] hover:text-[#2C2C2C] hover:bg-[#F2F0EA] rounded-full transition-colors cursor-pointer"
              title="Search 3D Models"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={() => setCurrentView('account')}
            className="relative p-2 text-[#4A4A4A] hover:text-[#2C2C2C] hover:bg-[#F2F0EA] rounded-full transition-colors cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#5A5A40] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Account Icon */}
          <button
            onClick={() => setCurrentView('account')}
            className="p-2 text-[#4A4A4A] hover:text-[#2C2C2C] hover:bg-[#F2F0EA] rounded-full transition-colors cursor-pointer"
            title="My Account"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Sticky Cart Drawer Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-2 bg-[#2C2C2C] hover:bg-[#444444] text-white px-3.5 py-2 rounded-full font-medium text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-[#D1CFB9]" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#5A5A40] text-white font-black text-[10px] rounded-full flex items-center justify-center">
                  {cartTotalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-semibold">
              {cartSubtotalUSD > 0 ? formatPrice(cartSubtotalUSD) : 'Cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Sub-Bar */}
      <div className="flex lg:hidden items-center justify-around border-t border-[#E5E2D9] bg-[#F7F6F2] py-2 text-xs font-medium text-[#4A4A4A]">
        <button
          onClick={() => {
            setFilterState((prev) => ({ ...prev, searchQuery: '', category: 'All' }));
            setCurrentView('catalog');
          }}
          className="hover:text-[#5A5A40] cursor-pointer"
        >
          Shop Models
        </button>
        <button
          onClick={() => setCurrentView('custom-upload')}
          className="text-[#5A5A40] font-semibold flex items-center gap-1 cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Custom Print
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-[#2C2C2C] font-semibold flex items-center gap-1 cursor-pointer"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-[#5A5A40]" />
          Dashboard
        </button>
        <button
          onClick={() => setIsPrintHubModalOpen(true)}
          className="hover:text-[#5A5A40] cursor-pointer"
        >
          Hubs
        </button>
      </div>

      {/* 3. Mobile Search Drawer / Expandable Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden border-t border-[#E5E2D9] bg-white p-4 space-y-3 shadow-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#8E9299]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search 3D models by name or category..."
              className="w-full pl-10 pr-20 py-2.5 bg-[#F7F6F2] rounded-full border border-[#E5E2D9] text-xs text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
              autoFocus
            />
            <div className="absolute right-2.5 flex items-center gap-1">
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 text-[#8E9299] hover:text-[#2C2C2C]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handleExecuteSearch(searchInput)}
                className="bg-[#5A5A40] text-white px-3 py-1 rounded-full text-xs font-bold"
              >
                Go
              </button>
            </div>
          </div>

          {/* Category quick filter chips for mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategoryPill(cat);
                  handleExecuteSearch(searchInput, cat);
                }}
                className={`px-3 py-1 rounded-full text-xs shrink-0 font-medium ${
                  selectedCategoryPill === cat
                    ? 'bg-[#2C2C2C] text-[#FAF9F6]'
                    : 'bg-[#F7F6F2] text-[#4A4A4A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile search results preview */}
          {searchInput.trim() && (
            <div className="max-h-48 overflow-y-auto space-y-2 pt-2 border-t border-[#E5E2D9]">
              {filteredSearchProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    openProductDetail(p);
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between p-2 hover:bg-[#F7F6F2] rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-8 h-8 object-cover rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-semibold text-[#2C2C2C]">{p.name}</p>
                      <p className="text-[10px] text-[#8E9299]">{p.category}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#5A5A40]">{formatPrice(p.basePrice)}</span>
                </div>
              ))}

              {filteredSearchProducts.length === 0 && (
                <p className="text-center text-xs text-[#8E9299] py-2">
                  No 3D models found for "{searchInput}".
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
