"use client";

import React from "react";
import { useGroceryCart, SortOption } from "@/context/GroceryCartContext";
import { useTranslations } from "next-intl";
import { TagIcon } from "@/icons";

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
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-y border-gray-200/80 bg-white/60 px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-md dark:border-emerald-950/60 dark:bg-[#071910]/60 rounded-xl sm:rounded-2xl mb-4 sm:mb-5">
      {/* Left: Quick Filters */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* In Stock Filter */}
        <button
          onClick={() => setFilterInStockOnly(!filterInStockOnly)}
          className={`inline-flex items-center gap-1 rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold transition-all ${
            filterInStockOnly
              ? "bg-emerald-600 text-white shadow-xs"
              : "border border-gray-200/80 bg-white text-gray-700 hover:bg-gray-50 dark:border-emerald-950/80 dark:bg-[#071d12] dark:text-gray-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
              filterInStockOnly ? "bg-white" : "bg-emerald-500"
            }`}
          />
          <span>In Stock</span>
        </button>

        {/* On Sale Filter */}
        <button
          onClick={() => setFilterOnSaleOnly(!filterOnSaleOnly)}
          className={`inline-flex items-center gap-1 rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold transition-all ${
            filterOnSaleOnly
              ? "bg-amber-500 text-white shadow-xs"
              : "border border-gray-200/80 bg-white text-gray-700 hover:bg-gray-50 dark:border-emerald-950/80 dark:bg-[#071d12] dark:text-gray-300"
          }`}
        >
          <TagIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>On Sale</span>
        </button>

        <span className="text-[11px] sm:text-xs font-semibold text-gray-400 dark:text-emerald-400/60 hidden sm:inline">
          ({totalCount} items)
        </span>
      </div>

      {/* Right: Sort By Dropdown */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <label
          htmlFor="sort-select"
          className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-emerald-300/80 hidden xs:inline"
        >
          Sort:
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg sm:rounded-xl border border-gray-200/80 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-gray-800 shadow-xs transition focus:border-emerald-500 focus:outline-none dark:border-emerald-950/80 dark:bg-[#071d12] dark:text-white"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>
    </div>
  );
};

export default SortFilterBar;

