"use client";

import React from "react";
import { GROCERY_CATEGORIES } from "@/data/groceryData";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { useLocale, useTranslations } from "next-intl";
import {
  BakeryIcon,
  BeverageIcon,
  DairyIcon,
  FruitIcon,
  MeatIcon,
  PantryIcon,
  SnackIcon,
  StoreIcon,
} from "@/icons";

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  all: StoreIcon,
  "fruits-vegetables": FruitIcon,
  "dairy-eggs": DairyIcon,
  bakery: BakeryIcon,
  "meat-poultry": MeatIcon,
  "pantry-cooking": PantryIcon,
  beverages: BeverageIcon,
  snacks: SnackIcon,
};

const categoryTranslations: Record<string, { es: string; en: string }> = {
  all: { en: "All Items", es: "Todos los Artículos" },
  "fruits-vegetables": { en: "Fruits & Vegetables", es: "Frutas y Verduras" },
  "dairy-eggs": { en: "Dairy & Eggs", es: "Lácteos y Huevos" },
  bakery: { en: "Bakery & Breads", es: "Panadería y Panes" },
  "meat-poultry": { en: "Meat & Poultry", es: "Carnes y Aves" },
  "pantry-cooking": { en: "Pantry & Spices", es: "Despensa y Especias" },
  beverages: { en: "Drinks & Juices", es: "Bebidas y Jugos" },
  snacks: { en: "Snacks & Munchies", es: "Aperitivos y Snacks" },
};

export const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory } = useGroceryCart();
  const t = useTranslations("grocery");
  const locale = useLocale();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-base font-bold text-gray-800 dark:text-white/90">
          {t("shopByCategory")}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {GROCERY_CATEGORIES.length - 1} {t("departments")}
        </span>
      </div>

      <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto pb-2">
        {GROCERY_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const translatedName =
            categoryTranslations[cat.id]?.[locale === "es" ? "es" : "en"] ||
            cat.name;

          const CategoryIcon = categoryIcons[cat.id] || StoreIcon;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand-500 text-white shadow-theme-xs ring-2 ring-brand-500/20"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center">
                <CategoryIcon className="h-4 w-4 stroke-[1.8]" />
              </span>
              <span>{translatedName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
