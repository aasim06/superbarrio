"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import GroceryLanguageSwitcher from "@/components/grocery/GroceryLanguageSwitcher";
import { CartIcon, LeafIcon, SearchIcon, BoltIcon } from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { GROCERY_PRODUCTS } from "@/data/groceryData";
import { GroceryProduct } from "@/types/grocery";

export const GroceryHeader: React.FC = () => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const {
    totalItems,
    total,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    isBasketBouncing,
    setQuickViewProduct,
  } = useGroceryCart();

  const [suggestions, setSuggestions] = useState<GroceryProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced live search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      const q = searchQuery.toLowerCase().trim();
      const matches = GROCERY_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      ).slice(0, 5);

      setSuggestions(matches);
      setShowSuggestions(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (product: GroceryProduct) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    setQuickViewProduct(product);
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          className="bg-amber-200 text-gray-900 rounded-xs font-black dark:bg-amber-500/40 dark:text-amber-200"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/70 bg-white/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors duration-300 dark:border-emerald-950/60 dark:bg-[#071910]/85 dark:shadow-[0_4px_25px_-5px_rgba(0,0,0,0.4)]">
      {/* Top Notification Announcement Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 px-4 py-1.5 text-center text-xs font-semibold tracking-wide text-white shadow-inner">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-300 animate-ping" />
          <span>{t("topNotice")}</span>
          <span className="hidden sm:inline text-white/80">•</span>
          <span className="hidden sm:inline font-bold text-amber-200">
            <BoltIcon className="inline h-3.5 w-3.5 me-1 text-amber-300 fill-current" />
            15-Min Instant Delivery • Code FRESH20 for 20% OFF
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-2 sm:gap-3 px-3 py-2 sm:px-6 md:gap-6 md:py-3.5 lg:px-8 xl:px-10">
        {/* Brand / Logo */}
        <Link
          href="/grocery"
          className="group flex items-center gap-2 sm:gap-3 transition-transform duration-200 active:scale-95"
        >
          <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_6px_16px_-2px_rgba(22,163,74,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_20px_-2px_rgba(22,163,74,0.5)]">
            <LeafIcon className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:rotate-12" />
            <span className="absolute -top-1 -end-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500 border border-white dark:border-gray-900" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-outfit text-lg sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                Super<span className="text-emerald-600 dark:text-emerald-400">Barrio</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-800 uppercase shadow-xs dark:bg-emerald-950/80 dark:text-emerald-300">
                {t("badge")}
              </span>
            </div>
            <p className="hidden sm:block text-[11px] font-medium text-gray-500 dark:text-emerald-200/60">
              {t("tagline")}
            </p>
          </div>
        </Link>

        {/* Live Search Bar with Dropdown Suggestions */}
        <div
          ref={searchContainerRef}
          className="relative hidden max-w-lg flex-1 md:block"
        >
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-gray-400 dark:text-emerald-400/60">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            type="text"
            value={searchQuery}
            onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-2xl border border-gray-200/80 bg-gray-50/80 py-2.5 pe-9 ps-11 text-sm font-medium text-gray-800 placeholder-gray-400 shadow-xs backdrop-blur-sm transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(22,163,74,0.15)] focus:outline-none dark:border-emerald-950/80 dark:bg-gray-900/60 dark:text-white dark:placeholder-gray-500 dark:focus:border-emerald-500 dark:focus:bg-gray-900"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-xs text-gray-400 transition hover:text-gray-700 dark:hover:text-white"
            >
              ✕
            </button>
          )}

          {/* Dropdown Suggestions Window */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-emerald-950/90 dark:bg-[#071910]/95"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-emerald-400/60">
                  Matching Products
                </div>
                <div className="divide-y divide-gray-100 dark:divide-emerald-950/60">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item)}
                      className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-emerald-50/70 dark:hover:bg-emerald-950/50 cursor-pointer"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="truncate text-xs font-bold text-gray-900 dark:text-white">
                          {highlightMatch(item.name, searchQuery)}
                        </h5>
                        <p className="text-[11px] text-gray-500 dark:text-emerald-300/60">
                          {item.unit} •{" "}
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(item.price, locale)}
                          </span>
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">➔</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location & Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher (ES / EN) */}
          <GroceryLanguageSwitcher />

          {/* Theme Toggle Button */}
          <ThemeToggleButton />

          {/* Animated Cart Basket Button with Bounce effect & Real-time Animated Total */}
          <motion.button
            id="header-basket-btn"
            onClick={() => setIsCartOpen(true)}
            animate={
              isBasketBouncing
                ? {
                    scale: [1, 1.25, 0.9, 1.15, 1],
                    rotate: [0, -6, 6, -3, 0],
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-1.5 sm:gap-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_-4px_rgba(22,163,74,0.45)] transition-all duration-300 hover:shadow-[0_12px_24px_-4px_rgba(22,163,74,0.55)] sm:text-sm"
          >
            <div className="relative">
              <CartIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -end-3 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[11px] font-black text-white shadow-[0_2px_8px_rgba(245,158,11,0.6)]"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="hidden sm:inline tracking-wide">{t("basket")}</span>
            <motion.span
              key={total}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="hidden rounded-xl bg-black/20 px-2 py-0.5 text-xs font-extrabold md:inline"
            >
              {formatPrice(total, locale)}
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="border-t border-gray-100 px-3 py-2 md:hidden dark:border-emerald-950/60 dark:bg-[#071910]/95">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchMobilePlaceholder")}
            className="w-full rounded-xl border border-gray-200/80 bg-gray-50/80 py-2 pe-3 ps-9 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-emerald-900/60 dark:bg-gray-900/80 dark:text-white"
          />
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
            <SearchIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </header>
  );
};

export default GroceryHeader;
