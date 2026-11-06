"use client";

import React from "react";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { CartIcon, LeafIcon, SearchIcon, StoreIcon } from "@/icons";
import { motion } from "framer-motion";

export const MobileBottomNav: React.FC = () => {
  const { totalItems, setIsCartOpen } = useGroceryCart();

  const handleHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategories = () => {
    const el = document.getElementById("category-bar-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const searchInput = document.querySelector<HTMLInputElement>(
        'input[type="text"]',
      );
      if (searchInput) {
        searchInput.focus();
      }
    }, 300);
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200/80 bg-white/90 px-3 py-2 shadow-2xl backdrop-blur-xl dark:border-emerald-950/80 dark:bg-[#071910]/95">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={handleHome}
          className="flex flex-col items-center gap-1 text-gray-600 transition hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
        >
          <LeafIcon className="h-5 w-5 text-emerald-500" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Categories */}
        <button
          onClick={handleCategories}
          className="flex flex-col items-center gap-1 text-gray-600 transition hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
        >
          <StoreIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold">Categories</span>
        </button>

        {/* Search */}
        <button
          onClick={handleSearch}
          className="flex flex-col items-center gap-1 text-gray-600 transition hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
        >
          <SearchIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold">Search</span>
        </button>

        {/* Basket */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-gray-600 transition hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
        >
          <div className="relative">
            <CartIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -end-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white shadow-xs"
              >
                {totalItems}
              </motion.span>
            )}
          </div>
          <span className="text-[10px] font-bold">Basket</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
