import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Layers } from 'lucide-react';

export const HeroCarousel: React.FC = () => {
  const { setCurrentView, openProductDetail, formatPrice, products, storeSettings } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = storeSettings?.heroSlides && storeSettings.heroSlides.length > 0
    ? storeSettings.heroSlides
    : [
        {
          id: 'slide-1',
          title: 'Anime Action Figures & Statues',
          subtitle: 'Micro-layer 0.08mm resin & dual-silk action poses, katana champions, and chibi collectibles.',
          tag: 'FEATURED ANIME COLLECTION',
          price: 1899,
          image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80',
          ctaText: 'Shop Anime Models',
          targetView: 'catalog' as const,
          specs: '0.08mm Layer Resolution • Custom Scale 25%-250%',
        },
      ];

  // Auto slide with hover pause
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const activeIndex = currentSlide % slides.length;
  const active = slides[activeIndex] || slides[0];

  const handleCta = () => {
    if (active.targetView === 'custom-upload') {
      setCurrentView('custom-upload');
    } else if (active.targetView === 'hubs') {
      setCurrentView('hubs');
    } else {
      const matched = products.find((p) => p.category === 'Anime & Action Figures');
      if (matched) openProductDetail(matched);
      else setCurrentView('catalog');
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[480px] sm:h-[540px] lg:h-[580px] bg-[#2C2C2C] overflow-hidden font-sans group select-none"
    >
      {/* Background Images with smooth CSS opacity transitions */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover opacity-40 scale-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] via-[#2C2C2C]/60 to-[#2C2C2C]/30" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20">
        <div className="max-w-xl space-y-4 text-[#FAF9F6]">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-[#5A5A40]/50 text-[#D1CFB9] border border-[#D1CFB9]/30 px-3.5 py-1 rounded-full text-xs font-mono font-medium tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D1CFB9]" />
            <span>{active.tag}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF9F6] leading-tight">
            {active.title}
          </h1>

          {/* Subtitle */}
          <p className="text-[#E5E2D9] text-sm sm:text-base leading-relaxed max-w-lg">
            {active.subtitle}
          </p>

          {/* Specs note */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#D1CFB9]">
            <Layers className="w-3.5 h-3.5 text-[#D1CFB9]" />
            <span>{active.specs}</span>
          </div>

          {/* Price & CTA */}
          <div className="pt-2 flex items-center gap-4 flex-wrap">
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2.5 bg-[#5A5A40] hover:bg-[#737758] text-white px-6 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-[#5A5A40]/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{active.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-left font-mono">
              <span className="text-[10px] uppercase text-[#8E9299] block">Starting From</span>
              <span className="text-xl font-bold text-white">{formatPrice(active.price)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#2C2C2C]/80 hover:bg-[#2C2C2C] text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[#E5E2D9]/20 z-30 cursor-pointer"
            title="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#2C2C2C]/80 hover:bg-[#2C2C2C] text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[#E5E2D9]/20 z-30 cursor-pointer"
            title="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Progress Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeIndex ? 'w-8 bg-[#D1CFB9]' : 'w-2 bg-stone-600 hover:bg-stone-500'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
