"use client";

import React, { useEffect, useMemo, useState } from "react";
import GroceryHeroBanner from "@/components/grocery/GroceryHeroBanner";
import CategoryBar from "@/components/grocery/CategoryBar";
import ProductCard from "@/components/grocery/ProductCard";
import { GROCERY_PRODUCTS, getAllProducts } from "@/data/groceryData";
import { GroceryProduct } from "@/types/grocery";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { useTranslations } from "next-intl";
import { SearchIcon } from "@/icons";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const gridItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

export const GroceryCatalog: React.FC = () => {
  const t = useTranslations("grocery");
  const { activeCategory, searchQuery, setSearchQuery } = useGroceryCart();
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category check
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;

      // Search query check
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 md:py-8 lg:px-8 xl:px-10">
      {/* Top Hero Promotions with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <GroceryHeroBanner />
      </motion.div>

      {/* Category Pills Bar with Staggered Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="mt-8"
      >
        <CategoryBar />
      </motion.div>

      {/* Products Catalog Grid with Scroll Reveal */}
      <div id="grocery-catalog" className="mt-8 scroll-mt-24">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="font-outfit text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              {searchQuery
                ? `Search: "${searchQuery}"`
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
              <button
                onClick={() => setSearchQuery("")}
                className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-transform hover:scale-105 active:scale-95"
              >
                {t("showAll")}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${activeCategory}-${searchQuery}`}
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-y-6"
            >
              {filteredProducts.map((product) => (
                <motion.div key={product.id} variants={gridItemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroceryCatalog;
