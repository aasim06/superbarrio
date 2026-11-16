"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { searchGroceryWithFuzzy } from "@/utils/fuzzySearch";

// Dynamically import heavy below-the-fold components (reduce initial JS bundle)
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

  useEffect(() => {
    setProducts(getAllProducts());
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

  return (
    <div className="mx-auto w-full max-w-[1920px] px-3 py-3 sm:px-6 md:py-8 lg:px-8 xl:px-10 pb-20 md:pb-8">
      {/* Top Hero Promotions with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <GroceryHeroBanner />
      </motion.div>

      {/* Sticky Category Pills Bar - Placed directly below Hero for instant mobile filtering */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mt-2.5 sm:mt-6"
      >
        <CategoryBar />
      </motion.div>

      {/* Infinite Organic Ticker Marquee Strip - Kept on desktop */}
      <div className="hidden sm:block">
        <MarqueeStrip />
      </div>

      {/* Products Catalog Grid with Scroll Reveal */}
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchQuery("")}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-emerald-950/80 dark:bg-gray-900 dark:text-gray-300"
            >
              {t("clearSearch")}
            </motion.button>
          )}
        </div>

        {/* Typo Auto-Correction Notification Banner */}
        {searchQuery && autoCorrection && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/80 p-3.5 backdrop-blur-sm dark:border-emerald-700/50 dark:bg-emerald-950/40 shadow-xs"
          >
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
          </motion.div>
        )}

        {/* Sort & Filter Bar */}
        <div className="relative z-30">
          <SortFilterBar totalCount={filteredProducts.length} />
        </div>

        {/* Empty State vs Animated Product Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
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
            <div
              className="relative z-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-y-4 sm:gap-y-6"
            >
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
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

      {/* Newsletter Subscription with Animated Gradient Border */}
      <div className="min-h-[60px]">
        <NewsletterSection />
      </div>
    </div>
  );
};

export default GroceryCatalog;
