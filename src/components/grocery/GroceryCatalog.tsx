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

export const GroceryCatalog: React.FC = () => {
  const t = useTranslations("grocery");
  const { activeCategory, searchQuery, setSearchQuery } = useGroceryCart();
  const [products, setProducts] = useState<GroceryProduct[]>(() => GROCERY_PRODUCTS);

  useEffect(() => {
    setProducts(getAllProducts());
    const handleUpdate = () => {
      setProducts(getAllProducts());
    };
    window.addEventListener("grocery-products-updated", handleUpdate);
    return () => window.removeEventListener("grocery-products-updated", handleUpdate);
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
      {/* Top Hero Promotions */}
      <GroceryHeroBanner />

      {/* Category Pills Bar */}
      <div className="mt-8">
        <CategoryBar />
      </div>

      {/* Products Catalog Grid */}
      <div id="grocery-catalog" className="mt-6 scroll-mt-24">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {searchQuery
                ? `Search: "${searchQuery}"`
                : activeCategory === "all"
                ? t("popularEssentials")
                : t("categoryItems")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("showingItems", { count: filteredProducts.length })}
            </p>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {t("clearSearch")}
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <SearchIcon className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h4 className="mt-4 text-base font-bold text-gray-800 dark:text-white">
              {t("noItemsTitle")}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("noItemsDesc")}
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600"
            >
              {t("showAll")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-y-5 lg:gap-4.5 xl:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryCatalog;
