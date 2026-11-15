"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import GroceryHeroBanner from "@/components/grocery/GroceryHeroBanner";
import CategoryBar from "@/components/grocery/CategoryBar";
import ProductCard from "@/components/grocery/ProductCard";
import SortFilterBar from "@/components/grocery/SortFilterBar";
import { GROCERY_PRODUCTS, getAllProducts } from "@/data/groceryData";
import { GroceryProduct } from "@/types/grocery";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { useLocale, useTranslations } from "next-intl";
import { SearchIcon } from "@/icons";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import below-the-fold components
const RecentlyViewedSection = dynamic(
  () =>
    import("@/components/grocery/RecentlyViewedSection").then((m) => ({
      default: m.RecentlyViewedSection ?? m.default,
    })),
  { ssr: false },
);
const MarqueeStrip = dynamic(
  () => import("@/components/grocery/MarqueeStrip"),
  { ssr: false },
);
const TestimonialsSection = dynamic(
  () =>
    import("@/components/grocery/TestimonialsSection").then((m) => ({
      default: m.TestimonialsSection ?? m.default,
    })),
  { ssr: false },
);
const NewsletterSection = dynamic(
  () =>
    import("@/components/grocery/NewsletterSection").then((m) => ({
      default: m.NewsletterSection ?? m.default,
    })),
  { ssr: false },
);

export const GroceryCatalog: React.FC = () => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const isEs = locale === "es";
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    filterInStockOnly,
    filterOnSaleOnly,
  } = useGroceryCart();

  const [products, setProducts] = useState<GroceryProduct[]>(
    () => GROCERY_PRODUCTS,
  );

  useEffect(() => {
    setProducts(getAllProducts());
    const handleUpdate = () => {
      setProducts(getAllProducts());
    };
    window.addEventListener("grocery-products-updated", handleUpdate);
    return () =>
      window.removeEventListener("grocery-products-updated", handleUpdate);
  }, []);

  // Filtered products for active category / search view
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;

      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(
          product.nameEn &&
            product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(
          product.descriptionEn &&
            product.descriptionEn
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        ) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStock = !filterInStockOnly || product.inStock;
      const matchesSale =
        !filterOnSaleOnly ||
        Boolean(product.originalPrice && product.originalPrice > product.price);

      return matchesCategory && matchesSearch && matchesStock && matchesSale;
    });

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        result = [...result].sort((a, b) => {
          const discountA = a.originalPrice ? a.originalPrice - a.price : 0;
          const discountB = b.originalPrice ? b.originalPrice - b.price : 0;
          return discountB - discountA;
        });
        break;
      case "featured":
      default:
        break;
    }

    return result;
  }, [
    products,
    activeCategory,
    searchQuery,
    sortBy,
    filterInStockOnly,
    filterOnSaleOnly,
  ]);

  // Curated section slices for mobile & desktop home feed
  const trendingProducts = useMemo(() => {
    return products
      .filter((p) => p.badge || p.rating >= 4.85)
      .slice(0, 10);
  }, [products]);

  const beverageProducts = useMemo(() => {
    return products.filter((p) => p.category === "beverages").slice(0, 8);
  }, [products]);

  const dairyProducts = useMemo(() => {
    return products.filter((p) => p.category === "dairy-eggs").slice(0, 8);
  }, [products]);

  const charcuterieProducts = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.category === "meat-poultry" || p.category === "pantry-cooking",
      )
      .slice(0, 8);
  }, [products]);

  const isHomeFeed = activeCategory === "all" && !searchQuery;

  return (
    <div className="mx-auto w-full max-w-[1920px] px-3 py-3 sm:px-6 md:py-6 lg:px-8 xl:px-10 pb-20 md:pb-8">
      {/* Top Hero Promotions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <GroceryHeroBanner />
      </motion.div>

      {/* Sticky Category Pills Bar */}
      <div className="mt-2 sm:mt-5">
        <CategoryBar />
      </div>

      {/* Infinite Organic Ticker Marquee Strip (desktop) */}
      <div className="hidden sm:block">
        <MarqueeStrip />
      </div>

      {/* HOME FEED (Trending Sections + Themed Banner Cards like Reference Screenshots) */}
      {isHomeFeed ? (
        <div className="mt-4 sm:mt-8 space-y-6 sm:space-y-10">
          {/* SECTION 1: TRENDING PRODUCTS (Exact UI with Title, Arrow & Horizontal Carousel) */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="font-outfit text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  {isEs ? "Productos Más Vendidos" : "Trending Products"}
                </h3>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-emerald-300/70">
                  {isEs
                    ? "Los alimentos más populares de España"
                    : "Top customer favorites in Spain"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("full-catalog-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1 text-xs font-bold text-gray-800 hover:text-emerald-600 dark:text-gray-200 transition-colors"
              >
                <span>{isEs ? "Ver más" : "See all"}</span>
                <span className="text-sm font-black">→</span>
              </button>
            </div>

            <div className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
              {trendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[145px] sm:w-[170px] shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {/* THEMED BANNER CARD 1: ELECTRIC BLUE BEVERAGES (Matching Reference Screenshot 2) */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-4 sm:p-6 text-white shadow-md relative overflow-hidden flex items-center justify-between">
            <div className="max-w-[62%] z-10">
              <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-1 backdrop-blur-xs">
                {isEs ? "Hasta 15% DTO" : "Upto 15% OFF"}
              </span>
              <h3 className="font-outfit text-base sm:text-2xl font-black leading-tight text-white">
                {isEs
                  ? "Tus Bebidas y Refrescos Favoritos"
                  : "Your Favourite Beverages"}
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-blue-100 line-clamp-1">
                {isEs
                  ? "Zumo de naranja de Valencia, agua Solán de Cabras y Mahou fría"
                  : "Fresh Valencia orange juices, mineral waters & cold beers"}
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory("beverages")}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-black text-blue-800 shadow-sm transition-transform active:scale-95 hover:bg-blue-50"
              >
                <span>{isEs ? "Comprar Bebidas" : "Shop Now"}</span>
                <span className="text-sm">→</span>
              </button>
            </div>

            <div className="relative w-28 h-28 sm:w-44 sm:h-36 shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80"
                alt="Bebidas de España"
                fill
                className="object-cover rounded-2xl shadow-md border-2 border-white/30"
              />
            </div>
          </div>

          {/* SECTION 2: BEBIDAS Y REFRESCOS (Spanish Drinks) */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="font-outfit text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  {isEs ? "Bebidas y Jugos Naturales" : "Drinks & Fresh Juices"}
                </h3>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-emerald-300/70">
                  {isEs
                    ? "Zumos 100% fruta, aguas minerales y cervezas artesanas"
                    : "100% natural juices, pure water & cold craft beers"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory("beverages")}
                className="flex items-center gap-1 text-xs font-bold text-gray-800 hover:text-emerald-600 dark:text-gray-200 transition-colors"
              >
                <span>{isEs ? "Ver más" : "See all"}</span>
                <span className="text-sm font-black">→</span>
              </button>
            </div>

            <div className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
              {beverageProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[145px] sm:w-[170px] shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {/* THEMED BANNER CARD 2: SUNNY YELLOW DAIRY & CHEESE (Matching Reference Screenshot 1) */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 p-4 sm:p-6 text-gray-950 shadow-md relative overflow-hidden flex items-center justify-between">
            <div className="max-w-[62%] z-10">
              <span className="inline-block rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-1">
                {isEs ? "Granja y Pastos" : "Farm & Pasture"}
              </span>
              <h3 className="font-outfit text-base sm:text-2xl font-black leading-tight text-gray-950">
                {isEs
                  ? "Tus Lácteos y Quesos Favoritos"
                  : "Your Dairy & Cheese Favourites"}
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-gray-800 line-clamp-1">
                {isEs
                  ? "Queso Manchego D.O.P., leche gallega y mantequilla artesana"
                  : "Manchego cheese, Galician milk & artisan butter"}
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory("dairy-eggs")}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-3.5 py-1.5 text-xs font-black text-white shadow-sm transition-transform active:scale-95 hover:bg-black"
              >
                <span>{isEs ? "Explorar Lácteos" : "Shop Dairy"}</span>
                <span className="text-sm">→</span>
              </button>
            </div>

            <div className="relative w-28 h-28 sm:w-44 sm:h-36 shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80"
                alt="Lácteos y Quesos"
                fill
                className="object-cover rounded-2xl shadow-md border-2 border-white/40"
              />
            </div>
          </div>

          {/* SECTION 3: LÁCTEOS Y QUESOS DE GRANJA */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="font-outfit text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  {isEs ? "Lácteos y Quesos Artesanos" : "Artisan Dairy & Cheeses"}
                </h3>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-emerald-300/70">
                  {isEs
                    ? "Quesos D.O.P., leche de pastoreo y huevos camperos"
                    : "P.D.O. cheeses, pasture milk & free-range farm eggs"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory("dairy-eggs")}
                className="flex items-center gap-1 text-xs font-bold text-gray-800 hover:text-emerald-600 dark:text-gray-200 transition-colors"
              >
                <span>{isEs ? "Ver más" : "See all"}</span>
                <span className="text-sm font-black">→</span>
              </button>
            </div>

            <div className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
              {dairyProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[145px] sm:w-[170px] shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {/* THEMED BANNER CARD 3: RICH BURGUNDY IBERIAN CHARCUTERIE & OLIVE OIL */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-800 via-rose-900 to-amber-950 p-4 sm:p-6 text-white shadow-md relative overflow-hidden flex items-center justify-between">
            <div className="max-w-[62%] z-10">
              <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-1 backdrop-blur-xs">
                {isEs ? "Gourmet Ibérico" : "Iberian Gourmet"}
              </span>
              <h3 className="font-outfit text-base sm:text-2xl font-black leading-tight text-white">
                {isEs
                  ? "Jamón Ibérico & Aceite de Oliva"
                  : "Iberian Ham & Olive Oil"}
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-rose-100 line-clamp-1">
                {isEs
                  ? "Jamón de Bellota 100%, AOVE Picual de Jaén y Arroz Bomba"
                  : "100% Acorn Ham, Extra Virgin Olive Oil & Paella Rice"}
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory("meat-poultry")}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-black text-red-950 shadow-sm transition-transform active:scale-95 hover:bg-rose-50"
              >
                <span>{isEs ? "Ver Selección" : "Explore"}</span>
                <span className="text-sm">→</span>
              </button>
            </div>

            <div className="relative w-28 h-28 sm:w-44 sm:h-36 shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
                alt="Jamón Ibérico"
                fill
                className="object-cover rounded-2xl shadow-md border-2 border-white/30"
              />
            </div>
          </div>

          {/* SECTION 4: CHARCUTERÍA Y DESPENSA IBÉRICA */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="font-outfit text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  {isEs
                    ? "Charcutería y Despensa de España"
                    : "Iberian Charcuterie & Pantry"}
                </h3>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-emerald-300/70">
                  {isEs
                    ? "Jamón de Bellota, Chorizo, Aceite de Oliva Virgen Extra y Arroz Bomba"
                    : "Acorn Iberian ham, extra virgin olive oil & Bomba paella rice"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory("pantry-cooking")}
                className="flex items-center gap-1 text-xs font-bold text-gray-800 hover:text-emerald-600 dark:text-gray-200 transition-colors"
              >
                <span>{isEs ? "Ver más" : "See all"}</span>
                <span className="text-sm font-black">→</span>
              </button>
            </div>

            <div className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
              {charcuterieProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[145px] sm:w-[170px] shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* FULL PRODUCTS CATALOG GRID */}
      <div id="full-catalog-section" className="mt-6 sm:mt-10 scroll-mt-28">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3">
          <div>
            <h3 className="font-outfit text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              {searchQuery
                ? isEs
                  ? `Búsqueda: "${searchQuery}"`
                  : `Search: "${searchQuery}"`
                : activeCategory === "all"
                ? isEs
                  ? "Catálogo Completo de la Huerta"
                  : "All Fresh Grocery Catalog"
                : t("categoryItems")}
            </h3>
            <p className="text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
              {t("showingItems", { count: filteredProducts.length })}
            </p>
          </div>

          {(searchQuery || activeCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-emerald-950/80 dark:bg-gray-900 dark:text-gray-300 transition-colors"
            >
              {isEs ? "Restablecer filtros" : "Reset filters"}
            </button>
          )}
        </div>

        {/* Sort & Filter Bar */}
        <SortFilterBar totalCount={filteredProducts.length} />

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white p-12 text-center shadow-sm dark:border-emerald-950/60 dark:bg-[#071d12]/60"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <SearchIcon className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h4 className="mt-4 font-outfit text-lg font-bold text-gray-900 dark:text-white">
                {t("noItemsTitle")}
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                {t("noItemsDesc")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-transform hover:scale-105 active:scale-95"
              >
                {t("showAll")}
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-y-4 sm:gap-y-6">
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Below-the-fold recommendations */}
      <RecentlyViewedSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
};

export default GroceryCatalog;
