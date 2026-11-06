"use client";

import React from "react";
import { useGroceryCart, SortOption } from "@/context/GroceryCartContext";
import { useTranslations } from "next-intl";

interface SortFilterBarProps {
  totalCount: number;
}

export const SortFilterBar: React.FC<SortFilterBarProps> = ({ totalCount }) => {
  const t = useTranslations("grocery");
  const {
    sortBy,
    setSortBy,
    filterInStockOnly,
    setFilterInStockOnly,
    filterOnSaleOnly,
    setFilterOnSaleOnly,
  } = useGroceryCart();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-gray-200/80 bg-white/60 px-4 py-3 backdrop-blur-md dark:border-emerald-950/60 dark:bg-[#071910]/60 rounded-2xl mb-5">
      {/* Left: Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* In Stock Filter */}
        <button
          onClick={() => setFilterInStockOnly(!filterInStockOnly)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            filterInStockOnly
              ? "bg-emerald-600 text-white shadow-xs"
              : "border border-gray-200/80 bg-white text-gray-700 hover:bg-gray-50 dark:border-emerald-950/80 dark:bg-[#071d12] dark:text-gray-300"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              filterInStockOnly ? "bg-white" : "bg-emerald-500"
            }`}
          />
          <span>In Stock Only</span>
        </button>

        {/* On Sale Filter */}
        <button
          onClick={() => setFilterOnSaleOnly(!filterOnSaleOnly)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            filterOnSaleOnly
              ? "bg-amber-500 text-white shadow-xs"
              : "border border-gray-200/80 bg-white text-gray-700 hover:bg-gray-50 dark:border-emerald-950/80 dark:bg-[#071d12] dark:text-gray-300"
          }`}
        >
          <span>🏷️</span>
          <span>On Sale</span>
        </button>

        <span className="text-xs font-semibold text-gray-400 dark:text-emerald-400/60 hidden sm:inline">
          ({totalCount} items)
        </span>
      </div>

      {/* Right: Sort By Dropdown */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sort-select"
          className="text-xs font-bold text-gray-500 dark:text-emerald-300/80"
        >
          Sort by:
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-xl border border-gray-200/80 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 shadow-xs transition focus:border-emerald-500 focus:outline-none dark:border-emerald-950/80 dark:bg-[#071d12] dark:text-white"
        >
          <option value="featured">Featured / Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated ★</option>
          <option value="discount">Biggest Discount %</option>
        </select>
      </div>
    </div>
  );
};

export default SortFilterBar;
