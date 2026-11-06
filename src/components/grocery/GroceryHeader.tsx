"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import GroceryLanguageSwitcher from "@/components/grocery/GroceryLanguageSwitcher";
import { CartIcon, LeafIcon, SearchIcon } from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";

export const GroceryHeader: React.FC = () => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const { totalItems, total, setIsCartOpen, searchQuery, setSearchQuery } =
    useGroceryCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95">
      {/* Top Notification Bar */}
      <div className="bg-brand-50 px-4 py-1.5 text-center text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
        {t("topNotice")}
      </div>

      {/* Main Header Row */}
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-3 px-4 py-3 sm:px-6 md:gap-6 md:py-4 lg:px-8 xl:px-10">
        {/* Brand / Logo */}
        <Link href="/grocery" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-xs">
            <LeafIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Super<span className="text-brand-500">Barrio</span>
              </span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 uppercase">
                {t("badge")}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("tagline")}
            </p>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="relative hidden max-w-md flex-1 md:block">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pe-4 ps-10 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-brand-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Location & Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher (ES / EN) */}
          <GroceryLanguageSwitcher />

          {/* Theme Toggle Button */}
          <ThemeToggleButton />

          {/* Cart Basket Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-theme-xs transition hover:bg-brand-600 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <div className="relative">
              <CartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -end-2.5 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white shadow-theme-xs">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">{t("basket")}</span>
            <span className="hidden rounded bg-brand-700/60 px-1.5 py-0.5 text-xs font-bold md:inline">
              {formatPrice(total, locale)}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="border-t border-gray-100 px-4 py-2 md:hidden dark:border-gray-800">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchMobilePlaceholder")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pe-3 ps-8 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2.5 text-gray-400">
            <SearchIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </header>
  );
};

export default GroceryHeader;
