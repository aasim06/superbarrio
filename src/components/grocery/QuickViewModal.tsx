"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { formatPrice } from "@/utils/currency";
import { getProductLocalized } from "@/data/groceryData";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CartIcon, LeafIcon, ShieldCheckIcon, HeartIcon, StarIcon } from "@/icons";
import { toast } from "sonner";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    cart,
    updateQuantity,
    toggleWishlist,
    isWishlisted,
  } = useGroceryCart();

  const t = useTranslations("grocery");
  const locale = useLocale();
  const isEs = locale === "es";
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!quickViewProduct) return null;

  const localized = getProductLocalized(quickViewProduct, locale);

  const cartItem = cart.find((item) => item.id === quickViewProduct.id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const wishlisted = isWishlisted(quickViewProduct.id);

  const displayImage = quickViewProduct.imageUrl || FALLBACK_IMAGE;

  const handleAddToCart = () => {
    addToCart(quickViewProduct, 1, null);
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(quickViewProduct.id);
    if (added) {
      toast.success(
        isEs
          ? `¡"${localized.name}" añadido a favoritos!`
          : `Added "${localized.name}" to wishlist!`,
      );
    } else {
      toast.info(
        isEs
          ? `"${localized.name}" eliminado de favoritos.`
          : `Removed "${localized.name}" from wishlist.`,
      );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={() => setQuickViewProduct(null)}
        />

        {/* Modal Window / Native Mobile Bottom Sheet */}
        <motion.div
          initial={isMobile ? { y: "100%", opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { y: "100%", opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-t-[32px] sm:rounded-3xl border border-gray-200/80 bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl dark:border-emerald-950/80 dark:bg-[#071910] sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Native Mobile Grab Handle */}
          <div className="sm:hidden flex justify-center -mt-1 mb-3">
            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-emerald-800/60" />
          </div>

          {/* Close Button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute end-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 dark:bg-emerald-950/60 dark:text-gray-300 dark:hover:bg-emerald-900"
          >
            ✕
          </button>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Left: Product Image */}
            <div className="relative flex h-64 sm:h-80 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-100/90 dark:bg-gray-800/60 animate-shimmer">
              {imageError ? (
                /* Inline SVG fallback */
                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <svg className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.2}>
                    <rect x="4" y="4" width="40" height="40" rx="8" />
                    <circle cx="18" cy="18" r="4" />
                    <path d="M4 32l10-10 8 8 6-6 10 10" />
                  </svg>
                </div>
              ) : (
                <Image
                  src={displayImage}
                  alt={localized.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                  onError={() => setImageError(true)}
                />
              )}

              {/* Badge */}
              {localized.badge && (
                <span className="absolute start-3 top-3 inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-black text-white shadow-md animate-pulse">
                  {localized.badge}
                </span>
              )}

              {/* Wishlist Button inside image */}
              <button
                onClick={handleWishlistToggle}
                className="absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-md backdrop-blur-md transition hover:scale-110 active:scale-90 dark:bg-gray-900/90"
              >
                <HeartIcon
                  className={`h-5 w-5 transition-colors ${
                    wishlisted
                      ? "fill-rose-500 text-rose-500"
                      : "text-gray-400 hover:text-rose-500"
                  }`}
                />
              </button>
            </div>

            {/* Right: Details */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="uppercase tracking-wider">
                    {quickViewProduct.category.replace("-", " ")}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    <StarIcon className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span>{quickViewProduct.rating} ({quickViewProduct.reviewsCount})</span>
                  </span>
                </div>

                <h3 className="mt-2 font-outfit text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {localized.name}
                </h3>

                <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
                  {localized.unit} {localized.origin ? `• ${isEs ? "Origen" : "Origin"}: ${localized.origin}` : ""}
                </p>

                <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {localized.description}
                </p>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className="font-outfit text-2xl font-black text-gray-900 dark:text-white">
                    {formatPrice(quickViewProduct.price, locale)}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-sm font-semibold text-gray-400 line-through dark:text-gray-500">
                      {formatPrice(quickViewProduct.originalPrice, locale)}
                    </span>
                  )}
                  {quickViewProduct.originalPrice && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {isEs ? "Ahorras " : "Save "}
                      {formatPrice(
                        quickViewProduct.originalPrice - quickViewProduct.price,
                        locale,
                      )}
                    </span>
                  )}
                </div>

                {/* Delivery Guarantee */}
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>
                    {isEs
                      ? "100% Calidad Garantizada y Reparto en 25 Min"
                      : "100% Quality Guarantee & 15-Min Delivery"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3">
                {currentQty === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CartIcon className="h-5 w-5" />
                    <span>{t("addToCart")}</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 text-white shadow-lg">
                    <span className="text-xs font-bold">{isEs ? "En la Cesta" : "In Basket"}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(quickViewProduct.id, currentQty - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/20 text-sm font-bold hover:bg-black/30"
                      >
                        -
                      </button>
                      <span className="text-sm font-black w-6 text-center">
                        {currentQty}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(quickViewProduct.id, currentQty + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/20 text-sm font-bold hover:bg-black/30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;

