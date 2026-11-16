"use client";

import React from "react";

/**
 * SuperBarrio E-Commerce Skeleton Suite
 * Ultra-smooth hardware-accelerated shimmering skeleton loaders
 * Pixel-perfect match for ProductCard, CategoryBar, HeroBanner, and Orders.
 */

// 1. Single Product Card Skeleton (100% matched to ProductCard.tsx)
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="relative flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-2.5 sm:p-4 shadow-xs dark:border-emerald-950/80 dark:bg-[#071d12]/70 overflow-hidden">
      <div className="flex flex-1 flex-col justify-between">
        {/* Product Visual Container */}
        <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-emerald-950/30 animate-shimmer overflow-hidden">
          {/* Top-Left Badge Placeholder */}
          <div className="absolute start-1.5 top-1.5 sm:start-2.5 sm:top-2.5 z-10 h-4 w-14 rounded-full bg-gray-200/90 dark:bg-emerald-900/40" />

          {/* Top-Right Heart Wishlist Circle Placeholder */}
          <div className="absolute end-1.5 top-1.5 sm:end-2.5 sm:top-2.5 z-10 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-200/90 dark:bg-emerald-900/40" />

          {/* Bottom-Right Rating Tag Placeholder */}
          <div className="absolute end-1.5 bottom-1.5 sm:end-2 sm:bottom-2 z-10 h-4 w-10 rounded-full bg-gray-200/90 dark:bg-emerald-900/40" />
        </div>

        {/* Product Info Lines */}
        <div className="mt-2.5 sm:mt-3 flex-1 flex flex-col justify-between space-y-2">
          {/* Unit / Origin Row */}
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-14 rounded-md bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
            <div className="h-2.5 w-10 rounded-md bg-gray-150 dark:bg-emerald-950/40 animate-shimmer" />
          </div>

          {/* Two-Line Product Title */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-3.5 sm:h-4 w-4/5 rounded-md bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
            <div className="h-3 sm:h-3.5 w-3/5 rounded-md bg-gray-150 dark:bg-emerald-950/40 animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Add Button */}
      <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-1.5 border-t border-gray-100 pt-2 sm:pt-2.5 dark:border-emerald-950/60">
        <div className="space-y-1">
          <div className="h-4 sm:h-5 w-14 rounded-md bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
          <div className="h-2.5 w-9 rounded-md bg-gray-150 dark:bg-emerald-950/40 animate-shimmer" />
        </div>

        {/* Add to Basket Action Button */}
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 animate-shimmer" />
      </div>
    </div>
  );
};

// 2. Responsive Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// 3. Category Bar Skeleton
export const CategoryBarSkeleton: React.FC = () => {
  return (
    <div className="w-full py-2 sm:py-2.5">
      <div className="flex items-center justify-between pb-2 sm:pb-3">
        <div className="h-5 w-36 rounded-lg bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
        <div className="h-4 w-20 rounded-md bg-gray-150 dark:bg-emerald-950/40 animate-shimmer" />
      </div>

      {/* Horizontal Scrolling Pill Skeletons */}
      <div className="no-scrollbar flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 sm:py-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2 rounded-xl sm:rounded-2xl border border-gray-200/80 bg-white/80 px-3.5 py-2 sm:px-4 sm:py-2.5 dark:border-emerald-950/60 dark:bg-[#071d12]/60 animate-shimmer"
          >
            <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-emerald-900/50" />
            <div
              className="h-3.5 rounded-md bg-gray-200 dark:bg-emerald-900/50"
              style={{ width: `${60 + (i % 4) * 15}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Hero Banner Skeleton
export const HeroBannerSkeleton: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-[#072418] to-gray-950 p-6 sm:p-10 lg:p-12 text-white shadow-xl min-h-[380px] sm:min-h-[460px] animate-shimmer">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Column Content */}
        <div className="space-y-4 lg:col-span-7">
          {/* Badge */}
          <div className="h-6 w-44 rounded-full bg-emerald-800/40" />

          {/* Large Title Lines */}
          <div className="space-y-2.5 pt-2">
            <div className="h-8 sm:h-12 w-4/5 rounded-xl bg-emerald-800/30" />
            <div className="h-8 sm:h-12 w-3/5 rounded-xl bg-emerald-800/30" />
          </div>

          {/* Subtitle */}
          <div className="h-4 w-2/3 rounded-lg bg-emerald-800/20" />

          {/* CTA & Express Pill */}
          <div className="flex items-center gap-3 pt-4">
            <div className="h-11 w-32 rounded-2xl bg-emerald-500/30" />
            <div className="h-9 w-40 rounded-full bg-emerald-800/30" />
          </div>
        </div>

        {/* Right Column Pouches (Desktop) */}
        <div className="hidden lg:col-span-5 lg:flex items-center justify-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-60 w-32 rounded-2xl bg-emerald-800/20 border border-emerald-500/10 p-3 flex flex-col justify-between"
            >
              <div className="h-4 w-16 rounded bg-emerald-800/40" />
              <div className="h-20 w-20 mx-auto rounded-full bg-emerald-800/30" />
              <div className="h-4 w-20 rounded bg-emerald-800/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. Orders History Skeleton (for CustomerOrdersPage)
export const OrdersSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left List */}
      <div className="space-y-4 lg:col-span-5">
        <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200/80 bg-white p-4 space-y-3 dark:border-emerald-950/60 dark:bg-[#071910] animate-shimmer"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-emerald-900/40" />
                <div className="h-5 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950" />
              </div>
              <div className="h-3 w-40 rounded bg-gray-150 dark:bg-emerald-900/30" />
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-emerald-950/40">
                <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-emerald-900/40" />
                <div className="h-4 w-14 rounded bg-gray-200 dark:bg-emerald-900/40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Details Card */}
      <div className="hidden lg:col-span-7 lg:block">
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 space-y-5 dark:border-emerald-950/60 dark:bg-[#071910] animate-shimmer min-h-[400px]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-emerald-950/40">
            <div className="space-y-1.5">
              <div className="h-5 w-36 rounded bg-gray-200 dark:bg-emerald-900/40" />
              <div className="h-3 w-48 rounded bg-gray-150 dark:bg-emerald-900/30" />
            </div>
            <div className="h-8 w-24 rounded-full bg-emerald-100 dark:bg-emerald-950" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-emerald-900/40" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-40 rounded bg-gray-200 dark:bg-emerald-900/40" />
                  <div className="h-3 w-20 rounded bg-gray-150 dark:bg-emerald-900/30" />
                </div>
                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-emerald-900/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Complete Storefront Page Skeleton (for Next.js loading.tsx)
export const StorefrontSkeleton: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-[1920px] px-3 py-3 sm:px-6 md:py-8 lg:px-8 xl:px-10 pb-20 md:pb-8 space-y-4 sm:space-y-6">
      {/* Hero Banner Skeleton */}
      <HeroBannerSkeleton />

      {/* Category Pills Skeleton */}
      <CategoryBarSkeleton />

      {/* Catalog Header Skeleton */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <div className="space-y-1.5">
          <div className="h-6 w-44 sm:w-56 rounded-lg bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
          <div className="h-3.5 w-24 rounded-md bg-gray-150 dark:bg-emerald-950/40 animate-shimmer" />
        </div>
        <div className="h-8 w-32 rounded-xl bg-gray-200 dark:bg-emerald-950/50 animate-shimmer" />
      </div>

      {/* Product Grid Skeleton (10 Items) */}
      <ProductGridSkeleton count={10} />
    </div>
  );
};

export default StorefrontSkeleton;
