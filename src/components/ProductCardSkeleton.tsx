import React from 'react';
import { Box } from 'lucide-react';

interface ProductCardSkeletonProps {
  id?: string;
  className?: string;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  id,
  className = '',
}) => {
  return (
    <div
      id={id}
      aria-hidden="true"
      className={`relative bg-white rounded-2xl border border-[#E5E2D9] shadow-xs flex flex-col overflow-hidden animate-pulse select-none ${className}`}
    >
      {/* 1. Image Container Skeleton */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F7F6F2] flex items-center justify-center animate-shimmer-sweep">
        {/* Subtle geometric 3D model placeholder watermark */}
        <Box className="w-12 h-12 text-[#D1CFB9]/50 stroke-1" />

        {/* Badges Top-Left Placeholder */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          <div className="h-5 w-16 rounded-full bg-[#E5E2D9]" />
        </div>

        {/* Wishlist Heart Top-Right Placeholder */}
        <div className="absolute top-3 right-3 p-2 rounded-full bg-white/90 border border-[#E5E2D9] shadow-xs z-10">
          <div className="w-4 h-4 rounded-full bg-[#E5E2D9]" />
        </div>

        {/* Quick View Button Hover Area Placeholder */}
        <div className="absolute inset-x-3 bottom-3 hidden group-hover:block">
          <div className="h-9 w-full rounded-xl bg-white/90" />
        </div>
      </div>

      {/* 2. Product Information Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div className="space-y-2">
          {/* Rating Skeleton */}
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-sm bg-[#E5E2D9]" />
            <div className="w-7 h-3 rounded bg-[#E5E2D9]" />
            <div className="w-10 h-3 rounded bg-[#F2F0EA]" />
          </div>

          {/* Title Skeleton */}
          <div className="h-5 w-4/5 rounded-md bg-[#E5E2D9]" />

          {/* Subtitle Skeleton */}
          <div className="h-3.5 w-3/5 rounded-md bg-[#F2F0EA]" />
        </div>

        {/* Color Swatch Dots Skeleton */}
        <div className="flex items-center justify-between py-1 border-t border-b border-[#F7F6F2]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#E5E2D9]" />
            <div className="w-4 h-4 rounded-full bg-[#E5E2D9]" />
            <div className="w-4 h-4 rounded-full bg-[#E5E2D9]" />
            <div className="w-4 h-4 rounded-full bg-[#E5E2D9]" />
          </div>
          <div className="w-16 h-2.5 rounded bg-[#F2F0EA]" />
        </div>

        {/* 3. Print Scale Selector & Size Bounds Skeleton */}
        <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-[#E5E2D9]" />
            <div className="h-3 w-16 rounded bg-[#E5E2D9]" />
          </div>

          {/* Preset Scale Buttons (4 items) */}
          <div className="grid grid-cols-4 gap-1">
            <div className="h-6 rounded-md bg-white border border-[#E5E2D9]" />
            <div className="h-6 rounded-md bg-white border border-[#E5E2D9]" />
            <div className="h-6 rounded-md bg-white border border-[#E5E2D9]" />
            <div className="h-6 rounded-md bg-white border border-[#E5E2D9]" />
          </div>

          {/* Scale Slider Track */}
          <div className="space-y-1 pt-0.5">
            <div className="w-full h-1.5 bg-[#E5E2D9] rounded-lg" />
            <div className="flex justify-between items-center">
              <div className="h-2 w-20 rounded bg-[#E5E2D9]" />
              <div className="h-2 w-20 rounded bg-[#E5E2D9]" />
            </div>
          </div>

          {/* Active Dimension Preview Box */}
          <div className="h-6 w-full rounded-md bg-white border border-[#E5E2D9] flex items-center justify-between px-2">
            <div className="h-2.5 w-24 rounded bg-[#F2F0EA]" />
            <div className="h-2.5 w-16 rounded bg-[#E5E2D9]" />
          </div>
        </div>

        {/* 4. Price & Action Button Footer Skeleton */}
        <div className="pt-2 border-t border-[#E5E2D9] flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-24 rounded bg-[#F2F0EA]" />
            <div className="h-6 w-20 rounded-md bg-[#E5E2D9]" />
          </div>

          <div className="h-9 w-28 rounded-xl bg-[#E5E2D9]" />
        </div>
      </div>
    </div>
  );
};

interface ProductCardSkeletonGridProps {
  id?: string;
  count?: number;
  className?: string;
}

export const ProductCardSkeletonGrid: React.FC<ProductCardSkeletonGridProps> = ({
  id = 'product-skeleton-grid',
  count = 6,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
}) => {
  return (
    <div id={id} className={className} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton
          key={`product-skeleton-${index}`}
          id={`${id}-item-${index}`}
        />
      ))}
    </div>
  );
};
