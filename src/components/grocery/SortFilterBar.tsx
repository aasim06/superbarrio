"use client";

import React from "react";
import { useGroceryCart, SortOption } from "@/context/GroceryCartContext";
import { useLocale, useTranslations } from "next-intl";
import { TagIcon } from "@/icons";
import CustomSelect, { CustomSelectOption } from "../ui/dropdown/CustomSelect";

interface SortFilterBarProps {
  totalCount: number;
}

export const SortFilterBar: React.FC<SortFilterBarProps> = ({ totalCount }) => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const isEs = locale === "es";

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
          <span>{isEs ? "En Stock" : "In Stock"}</span>
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
          <span>{isEs ? "En Oferta" : "On Sale"}</span>
        </button>

        <span className="text-[11px] sm:text-xs font-semibold text-gray-400 dark:text-emerald-400/60 hidden sm:inline">
          ({totalCount} {isEs ? "artículos" : "items"})
        </span>
      </div>

      {/* Right: Sort By Dropdown */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <label
          htmlFor="sort-select"
          className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-emerald-300/80 hidden xsm:inline"
        >
          {isEs ? "Ordenar:" : "Sort:"}
        </label>
        <div className="w-44 sm:w-48">
          <CustomSelect
            size="sm"
            options={[
              { value: "featured", label: isEs ? "Destacados" : "Featured" },
              { value: "price-asc", label: isEs ? "Precio: Menor a Mayor" : "Price: Low to High" },
              { value: "price-desc", label: isEs ? "Precio: Mayor a Menor" : "Price: High to Low" },
              { value: "rating-desc", label: isEs ? "Mejor Valorados" : "Highest Rated" },
              { value: "discount", label: isEs ? "Mayor Descuento" : "Biggest Discount" },
            ]}
            value={sortBy}
            onChange={(val) => setSortBy(val as SortOption)}
          />
        </div>
      </div>
    </div>
  );
};

export default SortFilterBar;

