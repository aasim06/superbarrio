"use client";

import React from "react";
import { usePathname } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { CartIcon, HomeIcon, SearchIcon, StoreIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations("grocery");
  const { totalItems, setIsCartOpen } = useGroceryCart();

  // Do not render bottom nav on checkout or order confirmation pages
  if (pathname.includes("/checkout") || pathname.includes("/order-success")) {
    return null;
  }

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
      const searchInputs = document.querySelectorAll<HTMLInputElement>(
        'header input[type="text"]',
      );
      if (searchInputs.length > 0) {
        // Pick the visible mobile search input
        const mobileInput = searchInputs[searchInputs.length - 1];
        mobileInput?.focus();
      }
    }, 250);
  };

  return (
    <nav
      aria-label="Barra de navegación móvil"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200/80 bg-white/95 px-4 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-emerald-950/80 dark:bg-[#071910]/95"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Home */}
        <button
          type="button"
          onClick={handleHome}
          className="flex flex-col items-center gap-1 text-gray-600 transition-colors hover:text-emerald-600 active:scale-90 dark:text-gray-400 dark:hover:text-emerald-400"
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold">Inicio</span>
        </button>

        {/* Categories */}
        <button
          type="button"
          onClick={handleCategories}
          className="flex flex-col items-center gap-1 text-gray-600 transition-colors hover:text-emerald-600 active:scale-90 dark:text-gray-400 dark:hover:text-emerald-400"
        >
          <StoreIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold">Categorías</span>
        </button>

        {/* Search */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex flex-col items-center gap-1 text-gray-600 transition-colors hover:text-emerald-600 active:scale-90 dark:text-gray-400 dark:hover:text-emerald-400"
        >
          <SearchIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold">Buscar</span>
        </button>

        {/* Basket */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-emerald-600 transition-colors active:scale-90 dark:text-emerald-400"
        >
          <div className="relative">
            <CartIcon className="h-5 w-5" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  className="absolute -top-1.5 -end-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1 text-[9px] font-black text-white shadow-xs"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[10px] font-black">{t("basket")}</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
