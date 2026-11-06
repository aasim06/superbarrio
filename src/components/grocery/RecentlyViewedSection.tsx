"use client";

import React from "react";
import { useGroceryCart } from "@/context/GroceryCartContext";
import ProductCard from "@/components/grocery/ProductCard";
import { GROCERY_PRODUCTS } from "@/data/groceryData";
import { motion } from "framer-motion";
import { TimeIcon, ShootingStarIcon } from "@/icons";

export const RecentlyViewedSection: React.FC = () => {
  const { recentlyViewed, activeCategory } = useGroceryCart();

  // "You May Also Like" recommendation based on category or top-rated products
  const recommendations = React.useMemo(() => {
    return GROCERY_PRODUCTS.filter((p) =>
      activeCategory === "all" ? p.rating >= 4.8 : p.category === activeCategory,
    ).slice(0, 4);
  }, [activeCategory]);

  return (
    <div className="mt-10 sm:mt-14 space-y-8 sm:space-y-12">
      {/* 1. Recently Viewed Section (if any viewed) */}
      {recentlyViewed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white/70 p-4 sm:p-8 shadow-sm backdrop-blur-sm dark:border-emerald-950/60 dark:bg-[#071910]/60"
        >
          <div className="flex items-center justify-between pb-3 sm:pb-5">
            <div>
              <div className="flex items-center gap-2">
                <TimeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-outfit text-base sm:text-xl font-black text-gray-900 dark:text-white">
                  Recently Viewed
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
                Pick up right where you left off
              </p>
            </div>
          </div>

          {/* Swipeable row on mobile, clean grid on desktop */}
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 sm:gap-4 sm:pb-0">
            {recentlyViewed.slice(0, 4).map((product) => (
              <div
                key={`recent-${product.id}`}
                className="w-[155px] sm:w-auto shrink-0 snap-start"
              >
                <ProductCard product={product} />
              </div>
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
        className="rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 via-white to-green-50/30 p-4 sm:p-8 shadow-sm backdrop-blur-sm dark:border-emerald-950/60 dark:from-[#061d11]/70 dark:via-[#071910]/60 dark:to-[#04140b]/80"
      >
        <div className="flex items-center justify-between pb-3 sm:pb-5">
          <div>
            <div className="flex items-center gap-2">
              <ShootingStarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 fill-amber-500" />
              <h3 className="font-outfit text-base sm:text-xl font-black text-gray-900 dark:text-white">
                You May Also Like
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
              Curated chef & customer top-rated picks
            </p>
          </div>
        </div>

        {/* Swipeable row on mobile, clean grid on desktop */}
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 sm:gap-4 sm:pb-0">
          {recommendations.map((product) => (
            <div
              key={`rec-${product.id}`}
              className="w-[155px] sm:w-auto shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RecentlyViewedSection;

