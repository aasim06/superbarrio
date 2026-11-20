"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
import GroceryHeroBanner from "@/components/grocery/GroceryHeroBanner";
import CategoryBar from "@/components/grocery/CategoryBar";
import ProductCard from "@/components/grocery/ProductCard";
import SortFilterBar from "@/components/grocery/SortFilterBar";
import { GROCERY_PRODUCTS, getAllProducts } from "@/data/groceryData";
import { GroceryProduct } from "@/types/grocery";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { useLocale, useTranslations } from "next-intl";
import { SearchIcon } from "@/icons";
import { motion, AnimatePresence } from "framer-motion";
import { searchGroceryWithFuzzy } from "@/utils/fuzzySearch";
import { ProductGridSkeleton } from "@/components/grocery/GrocerySkeleton";

// Dynamically import heavy below-the-fold components
const RecentlyViewedSection = dynamic(
  () => import("@/components/grocery/RecentlyViewedSection").then((m) => ({ default: m.RecentlyViewedSection ?? m.default })),
  { ssr: false },
);
const MarqueeStrip = dynamic(
  () => import("@/components/grocery/MarqueeStrip"),
  { ssr: false },
);
const TestimonialsSection = dynamic(
  () => import("@/components/grocery/TestimonialsSection").then((m) => ({ default: m.TestimonialsSection ?? m.default })),
  { ssr: false },
);
const NewsletterSection = dynamic(
  () => import("@/components/grocery/NewsletterSection").then((m) => ({ default: m.NewsletterSection ?? m.default })),
  { ssr: false },
);

export const GroceryCatalog: React.FC = () => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const isEs = locale === "es";
  const {
    activeCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    filterInStockOnly,
    filterOnSaleOnly,
  } = useGroceryCart();

  const [products, setProducts] = useState<GroceryProduct[]>(
    () => GROCERY_PRODUCTS,
  );
  const [isFiltering, setIsFiltering] = useState(false);

  // ─── High-Performance Infinite Scroll & Virtual Rendering ───
  // Initial 40 products (8 rows on 5-col desktop, 20 rows on mobile)
  const INITIAL_BATCH = 40;
  // Load 30 products per chunk (6 full rows)
  const BATCH_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const loadMoreObserverRef = useRef<HTMLDivElement>(null);

  // Reset pagination on category or filter change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [activeCategory, searchQuery, sortBy, filterInStockOnly, filterOnSaleOnly]);

  // Micro skeleton shimmer feedback when user changes category
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 140);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  useEffect(() => {
    const loaded = getAllProducts();
    if (loaded !== GROCERY_PRODUCTS) {
      setProducts(loaded);
    }
    const handleUpdate = () => {
      setProducts(getAllProducts());
    };
    window.addEventListener("grocery-products-updated", handleUpdate);
    return () =>
      window.removeEventListener("grocery-products-updated", handleUpdate);
  }, []);

  const { filteredProducts, autoCorrection } = useMemo(() => {
    let base = products.filter((product) => {
      // Category check
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;

      // In stock only filter
      const matchesStock = !filterInStockOnly || product.inStock;

      // On sale filter
      const matchesSale =
        !filterOnSaleOnly ||
        Boolean(product.originalPrice && product.originalPrice > product.price);

      return matchesCategory && matchesStock && matchesSale;
    });

    let didYouMean: string | undefined = undefined;

    // Intelligent Fuzzy Search with Typo Tolerance
    if (searchQuery.trim()) {
      const fuzzy = searchGroceryWithFuzzy(base, searchQuery, locale);
      base = fuzzy.results;
      didYouMean = fuzzy.didYouMean;
    }

    // Apply Sorting
    switch (sortBy) {
      case "price-asc":
        base = [...base].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        base = [...base].sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        base = [...base].sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        base = [...base].sort((a, b) => {
          const discountA = a.originalPrice ? a.originalPrice - a.price : 0;
          const discountB = b.originalPrice ? b.originalPrice - b.price : 0;
          return discountB - discountA;
        });
        break;
      case "featured":
      default:
        // Keep catalog order
        break;
    }

    return { filteredProducts: base, autoCorrection: didYouMean };
  }, [
    products,
    activeCategory,
    searchQuery,
    sortBy,
    filterInStockOnly,
    filterOnSaleOnly,
    locale,
  ]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );
  const hasMore = visibleCount < filteredProducts.length;

  // Ultra-responsive IntersectionObserver with 1000px lookahead buffer
  // Pre-fetches the next 30 items BEFORE the user reaches the bottom
  useEffect(() => {
    if (!hasMore) return;
    const target = loadMoreObserverRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + BATCH_SIZE, filteredProducts.length),
          );
        }
      },
      { rootMargin: "1000px" },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, visibleCount, filteredProducts.length]);

  return (
    <div className="mx-auto w-full max-w-[1920px] px-3 py-3 sm:px-6 md:py-8 lg:px-8 xl:px-10 pb-20 md:pb-8">
      {/* Top Hero Promotions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <GroceryHeroBanner />
      </motion.div>

      {/* Sticky Category Pills Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
        className="mt-2.5 sm:mt-6"
      >
        <CategoryBar />
      </motion.div>

      {/* Infinite Organic Ticker Marquee Strip */}
      <div className="hidden sm:block">
        <MarqueeStrip />
      </div>

      {/* Products Catalog Grid */}
      <div id="grocery-catalog" className="mt-4 sm:mt-8 scroll-mt-32">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3">
          <div>
            <h3 className="font-outfit text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              {searchQuery
                ? (isEs ? `Búsqueda: "${searchQuery}"` : `Search: "${searchQuery}"`)
                : activeCategory === "all"
                ? t("popularEssentials")
                : t("categoryItems")}
            </h3>
            <p className="text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
              {t("showingItems", { count: filteredProducts.length })}
            </p>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 dark:border-emerald-950/80 dark:bg-gray-900 dark:text-gray-300 transition-all"
            >
              {t("clearSearch")}
            </button>
          )}
        </div>

        {/* Typo Auto-Correction Notification Banner */}
        {searchQuery && autoCorrection && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/80 p-3.5 backdrop-blur-sm dark:border-emerald-700/50 dark:bg-emerald-950/40 shadow-xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
              <span className="text-base">✨</span>
              <span>
                {isEs ? "Mostrando resultados para" : "Showing results for"}:{" "}
                <strong className="font-extrabold text-emerald-700 dark:text-emerald-300 underline">
                  "{autoCorrection}"
                </strong>
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({isEs ? `corregido automáticamente de "${searchQuery}"` : `auto-corrected from "${searchQuery}"`})
              </span>
            </div>
            <button
              onClick={() => setSearchQuery(autoCorrection)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-gray-950"
            >
              <span>✓</span>
              <span>{isEs ? `Aceptar "${autoCorrection}"` : `Apply "${autoCorrection}"`}</span>
            </button>
          </div>
        )}

        {/* Sort & Filter Bar */}
        <div className="relative z-30">
          <SortFilterBar totalCount={filteredProducts.length} />
        </div>

        {/* Empty State vs Optimized Product Grid vs Skeleton */}
        <AnimatePresence mode="wait">
          {isFiltering ? (
            <motion.div
              key="filtering-skeleton"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <ProductGridSkeleton count={10} />
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white p-12 text-center shadow-sm dark:border-emerald-950/60 dark:bg-[#071d12]/60"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <SearchIcon className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h4 className="mt-4 font-outfit text-lg font-bold text-gray-900 dark:text-white">
                {t("noItemsTitle")}
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                {t("noItemsDesc")}
              </p>
              
              {/* Popular Search Suggestions on Empty State */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 max-w-md">
                <span className="text-[11px] font-medium text-gray-400 dark:text-emerald-400/70 w-full mb-1">
                  {isEs ? "Prueba buscando alimentos populares:" : "Try searching popular essentials:"}
                </span>
                {["Plátanos", "Tomates", "Manzanas", "Aguacates", "Fresas", "Patatas", "Leche"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSearchQuery("")}
                className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-transform hover:scale-105 active:scale-95"
              >
                {t("showAll")}
              </button>
            </motion.div>
          ) : (
            <>
              {/* Native Virtualized Grid with CSS content-visibility: auto */}
              <div
                className="relative z-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-y-4 sm:gap-y-6"
              >
                {displayedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="[content-visibility:auto] [contain-intrinsic-size:auto_320px]"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Seamless Infinite Scroll Buffer & Load More Action */}
              {hasMore && (
                <div
                  ref={loadMoreObserverRef}
                  className="mt-10 flex flex-col items-center justify-center gap-3.5 py-8 select-none"
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500 dark:text-emerald-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                    <span>
                      {isEs
                        ? `Mostrando ${displayedProducts.length} de ${filteredProducts.length} productos`
                        : `Showing ${displayedProducts.length} of ${filteredProducts.length} products`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((prev) =>
                        Math.min(prev + BATCH_SIZE * 2, filteredProducts.length),
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 dark:border-emerald-950 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300 transition-all"
                  >
                    <span>↓</span>
                    <span>
                      {isEs ? "Cargar más productos" : "Load more products"}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Recently Viewed & Recommendations */}
      <div className="min-h-[60px]">
        <RecentlyViewedSection />
      </div>

      {/* Customer Testimonials Carousel & Reviews */}
      <div className="min-h-[60px]">
        <TestimonialsSection />
      </div>

      {/* Newsletter Subscription */}
      <div className="min-h-[60px]">
        <NewsletterSection />
      </div>
    </div>
  );
};

export default GroceryCatalog;
