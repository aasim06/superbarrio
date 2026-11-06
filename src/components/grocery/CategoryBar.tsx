"use client";

import React from "react";
import { GROCERY_CATEGORIES } from "@/data/groceryData";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
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
    <div
      id="category-bar-section"
      className="sticky top-[68px] z-30 w-full py-2.5 backdrop-blur-xl bg-[#f8faf9]/90 dark:bg-[#04130b]/90 border-b border-gray-200/60 dark:border-emerald-950/60 transition-colors"
    >
      <div className="flex items-center justify-between pb-3">
        <h3 className="font-outfit text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white">
          {t("shopByCategory")}
        </h3>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {GROCERY_CATEGORIES.length - 1} {t("departments")}
        </span>
      </div>

      {/* Horizontal Scrollable Category Bar with Apple-style sliding pill indicator */}
      <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto py-1.5">
        {GROCERY_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const translatedName =
            categoryTranslations[cat.id]?.[locale === "es" ? "es" : "en"] ||
            cat.name;

          const CategoryIcon = categoryIcons[cat.id] || StoreIcon;

          return (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative inline-flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors select-none ${
                isActive
                  ? "text-white shadow-md"
                  : "border border-gray-200/80 bg-white/80 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-950/60 dark:bg-[#071d12]/60 dark:text-gray-300 dark:hover:border-emerald-800 dark:hover:bg-[#092b1a]"
              }`}
            >
              {/* Sliding Pill Indicator via Framer Motion layoutId */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 shadow-[0_4px_16px_rgba(22,163,74,0.4)]"
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 32,
                  }}
                  style={{ zIndex: -1 }}
                />
              )}

              <span className="flex h-4 w-4 items-center justify-center">
                <CategoryIcon className="h-4 w-4 stroke-[1.8]" />
              </span>
              <span>{translatedName}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
