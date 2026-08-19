import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { Box, UploadCloud, Sparkles, Layers, Tag, ArrowRight } from 'lucide-react';

import animeActionFigureImg from '../assets/images/anime_action_figure_1786878754221.jpg';
import wallHangingArtImg from '../assets/images/wall_hanging_art_1786878773767.jpg';
import customKeychainsImg from '../assets/images/custom_keychains_1786878793720.jpg';
import categoryHomeDecorImg from '../assets/images/category_home_decor_1785305986796.jpg';

export const CategoryGrid: React.FC = () => {
  const { setCurrentView, setFilterState } = useStore();

  const handleCategoryClick = (category: ProductCategory | 'All') => {
    setFilterState((prev) => ({ ...prev, category }));
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    {
      id: 'cat-anime',
      category: 'Anime & Action Figures' as ProductCategory,
      title: 'Anime Action Figures',
      subtitle: 'Micro-detail resin & dual-silk katana warriors, chibi companions, and action sculptures.',
      image: animeActionFigureImg,
      icon: Sparkles,
      badge: 'Trending & Collectibles',
      itemCount: 'High Detail Resin & Silk',
    },
    {
      id: 'cat-home',
      category: 'Home Decor' as ProductCategory,
      title: 'Modern Home Decor',
      subtitle: 'Parametric spiral vases, ribbed fluted planters with drain trays, and ambient lattice lamps.',
      image: categoryHomeDecorImg,
      icon: Box,
      badge: 'Artisan & Living',
      itemCount: 'Fibonacci & Bio-Polymers',
    },
    {
      id: 'cat-wall',
      category: 'Wall Hangings' as ProductCategory,
      title: '3D Wall Hangings & Art',
      subtitle: 'Multi-layer sacred geometric mandalas, Japanese wave elevation reliefs, and polygonal wall crests.',
      image: wallHangingArtImg,
      icon: Layers,
      badge: 'Interior Statement',
      itemCount: 'Flush Wall-Mount Ready',
    },
    {
      id: 'cat-keychains',
      category: 'Keychains' as ProductCategory,
      title: 'Custom Keychains & Charms',
      subtitle: 'Articulated flexi dragons, custom engraved Japanese nameplates, and micro sneaker keyrings.',
      image: customKeychainsImg,
      icon: Tag,
      badge: 'Pocket Accessories',
      itemCount: 'Print-In-Place Flexi',
    },
  ];

  return (
    <section className="py-14 bg-[#F7F6F2] border-b border-[#E5E2D9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto space-y-2"
        >
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#5A5A40]">
            Curated 3D Print Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2C2C]">
            Explore By Category
          </h2>
          <p className="text-xs sm:text-sm text-[#8E9299]">
            Select an artisan collection or upload your custom STL / OBJ files for instant quotation and precision fabrication.
          </p>
        </motion.div>

        {/* 4 Main Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => handleCategoryClick(card.category)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-[#E5E2D9] hover:border-[#5A5A40] flex flex-col justify-between h-[380px] bg-[#2C2C2C]"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover opacity-75 group-hover:scale-108 group-hover:opacity-90 transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] via-[#2C2C2C]/50 to-transparent" />
                </div>

                {/* Top Badge */}
                <div className="relative p-4 flex justify-between items-start z-10">
                  <span className="inline-flex items-center gap-1.5 bg-[#2C2C2C]/85 backdrop-blur-md text-[#D1CFB9] text-[10px] uppercase font-mono tracking-wider font-semibold px-2.5 py-1 rounded-full border border-[#5A5A40]/40">
                    <IconComponent className="w-3 h-3 text-[#D1CFB9]" />
                    <span>{card.badge}</span>
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative p-5 space-y-2 text-white z-10">
                  <span className="text-[11px] font-mono text-[#D1CFB9] block">
                    {card.itemCount}
                  </span>
                  <h3 className="font-serif text-xl font-bold group-hover:text-[#D1CFB9] transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#E5E2D9]/80 line-clamp-2 leading-relaxed">
                    {card.subtitle}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#FAF9F6] group-hover:text-[#D1CFB9]">
                    <span>View Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Custom STL Upload Highlight Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden border-2 border-[#5A5A40] bg-[#2C2C2C] text-white p-6 sm:p-8 lg:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#5A5A40]/50 text-[#D1CFB9] border border-[#D1CFB9]/30 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase">
              <UploadCloud className="w-3.5 h-3.5 text-[#D1CFB9]" />
              <span>Instant 3D Mesh Slicer Engine</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F6]">
              Have your own 3D Model? Upload STL for Custom Printing
            </h3>
            <p className="text-xs sm:text-sm text-[#E5E2D9] leading-relaxed">
              Drag & drop your STL / OBJ / 3MF file. Our browser slicer calculates bounding box dimensions, volume (cm³), print time, and gives an instant price quote across PLA Matte, Resin, Dual-Silk, and Carbon Fiber.
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentView('custom-upload');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="shrink-0 bg-[#5A5A40] hover:bg-[#737758] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg hover:shadow-[#5A5A40]/40 transition-all flex items-center gap-3 group cursor-pointer"
          >
            <UploadCloud className="w-5 h-5 text-[#D1CFB9]" />
            <span>Launch STL Slicer Quote</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
