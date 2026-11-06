"use client";

import React from "react";
import { useGroceryCart } from "@/context/GroceryCartContext";
import ProductCard from "@/components/grocery/ProductCard";
import { GROCERY_PRODUCTS } from "@/data/groceryData";
import { motion } from "framer-motion";

export const RecentlyViewedSection: React.FC = () => {
  const { recentlyViewed, activeCategory } = useGroceryCart();

  // "You May Also Like" recommendation based on category or top-rated products
  const recommendations = React.useMemo(() => {
    return GROCERY_PRODUCTS.filter((p) =>
      activeCategory === "all" ? p.rating >= 4.8 : p.category === activeCategory,
    ).slice(0, 4);
  }, [activeCategory]);

  return (
    <div className="mt-14 space-y-12">
      {/* 1. Recently Viewed Section (if any viewed) */}
      {recentlyViewed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-emerald-950/60 dark:bg-[#071910]/60 sm:p-8"
        >
          <div className="flex items-center justify-between pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🕒</span>
                <h3 className="font-outfit text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  Recently Viewed
                </h3>
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
                Pick up right where you left off
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {recentlyViewed.slice(0, 4).map((product) => (
              <ProductCard key={`recent-${product.id}`} product={product} />
            ))}
          </div>
        </motion.div>
      )}

      {/* 2. "You May Also Like" Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 via-white to-green-50/30 p-6 shadow-sm backdrop-blur-sm dark:border-emerald-950/60 dark:from-[#061d11]/70 dark:via-[#071910]/60 dark:to-[#04140b]/80 sm:p-8"
      >
        <div className="flex items-center justify-between pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h3 className="font-outfit text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                You May Also Like
              </h3>
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
              Curated chef & customer top-rated picks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {recommendations.map((product) => (
            <ProductCard key={`rec-${product.id}`} product={product} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RecentlyViewedSection;

