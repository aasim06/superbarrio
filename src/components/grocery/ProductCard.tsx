"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { GroceryProduct } from "@/types/grocery";
import { getProductLocalized } from "@/data/groceryData";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { HeartIcon } from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { triggerHaptic } from "@/utils/haptics";

interface ProductCardProps {
  product: GroceryProduct;
  className?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";

export const ProductCard: React.FC<ProductCardProps> = React.memo(function ProductCard({
  product,
  className,
}) {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const {
    cart,
    addToCart,
    updateQuantity,
    toggleWishlist,
    isWishlisted,
    setQuickViewProduct,
  } = useGroceryCart();

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const wishlisted = isWishlisted(product.id);

  const imageRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  const isEs = locale === "es";
  const localized = getProductLocalized(product, locale);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("medium");
    addToCart(product, 1, null);
    toast.success(
      isEs
        ? `¡${localized.name} añadido a la cesta!`
        : `Added ${localized.name} to basket!`,
      { duration: 1500 },
    );
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("light");
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("light");
    updateQuantity(product.id, quantity - 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("selection");
    const added = toggleWishlist(product.id);
    if (added) {
      toast.success(
        isEs ? `¡Guardado en favoritos!` : `Saved to wishlist!`,
        { duration: 1500 },
      );
    } else {
      toast.info(
        isEs ? `Eliminado de favoritos.` : `Removed from wishlist.`,
        { duration: 1500 },
      );
    }
  };

  const handleCardClick = () => {
    triggerHaptic("light");
    setQuickViewProduct(product);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="button"
      tabIndex={0}
      aria-label={
        isEs
          ? `Ver detalles de ${localized.name}, precio ${formatPrice(product.price, locale)}`
          : `View details for ${localized.name}, price ${formatPrice(product.price, locale)}`
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative flex h-full flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-2.5 sm:p-3 shadow-xs transition-all duration-200 hover:border-emerald-400 hover:shadow-md dark:border-emerald-950/70 dark:bg-[#071d12]/80 dark:hover:border-emerald-700/80 cursor-pointer select-none overflow-hidden ${
        className || ""
      }`}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-between">
        {/* Product Visual Container with Clean White Background & Floating Action */}
        <div
          ref={imageRef}
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-gray-900/60 p-2 border border-gray-100 dark:border-emerald-950/50"
        >
          {/* Skeleton Shimmer Loader */}
          {!imageError && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-emerald-950/30 dark:via-gray-800 dark:to-emerald-950/30" />
          )}

          {imageError ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
              <svg
                className="h-10 w-10 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 48 48"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <rect x="4" y="4" width="40" height="40" rx="8" />
                <circle cx="18" cy="18" r="4" />
                <path d="M4 32l10-10 8 8 6-6 10 10" />
              </svg>
            </div>
          ) : (
            <Image
              src={product.imageUrl || FALLBACK_IMAGE}
              alt={localized.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 18vw"
              className="object-contain p-1 transition-transform duration-300 ease-out group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}

          {/* Clean Pill Discount Badge (Top-Start) matching exact screenshot */}
          {discountPercent > 0 ? (
            <div className="absolute start-1.5 top-1.5 z-10">
              <span className="block rounded-full bg-rose-600 px-2 py-0.5 text-[9px] sm:text-[10px] font-black tracking-wide text-white shadow-xs">
                {discountPercent}% Off
              </span>
            </div>
          ) : localized.badge ? (
            <div className="absolute start-1.5 top-1.5 z-10">
              <span className="block truncate rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-white shadow-xs">
                {localized.badge}
              </span>
            </div>
          ) : null}

          {/* Top-End Heart Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className="absolute end-1.5 top-1.5 z-10 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur-sm transition-all hover:scale-110 active:scale-90 dark:bg-gray-900/90"
            title="Wishlist"
          >
            <HeartIcon
              className={`h-3.5 w-3.5 transition-colors ${
                wishlisted
                  ? "fill-rose-500 text-rose-500"
                  : "text-gray-300 dark:text-gray-500 hover:text-rose-500"
              }`}
            />
          </button>

          {/* Floating Circular + Button / Stepper (Bottom-End of Image, exact matching reference screenshot) */}
          <div
            className="absolute bottom-1 end-1 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add-circle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileTap={{ scale: 0.88 }}
                  type="button"
                  onClick={handleAdd}
                  aria-label="Add to basket"
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-600 hover:bg-emerald-600 active:scale-90 text-white shadow-md transition-colors duration-200"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </motion.button>
              ) : (
                <motion.div
                  key="stepper-pill"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="inline-flex items-center rounded-full bg-emerald-600 text-white shadow-md px-1.5 py-0.5 text-xs font-bold gap-1"
                >
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="h-5 w-5 rounded-full hover:bg-emerald-700 flex items-center justify-center font-black"
                  >
                    -
                  </button>
                  <span className="min-w-[14px] text-center text-[10px] font-black">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="h-5 w-5 rounded-full hover:bg-emerald-700 flex items-center justify-center font-black"
                  >
                    +
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Product Details under image */}
        <div className="mt-2 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-outfit line-clamp-2 min-h-[2rem] sm:min-h-[2.4rem] text-xs sm:text-sm font-bold text-gray-900 transition-colors duration-200 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 leading-tight">
              {localized.name}
            </h4>

            <span className="mt-0.5 block text-[11px] text-gray-500 font-medium truncate dark:text-gray-400">
              {localized.unit || "1 unit"}
            </span>
          </div>

          {/* Pricing Row matching screenshot: Bold Current Price + Strike-through Old Price */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-outfit text-xs sm:text-sm font-black text-gray-900 dark:text-white">
              {formatPrice(product.price, locale)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 line-through dark:text-gray-500 font-medium">
                {formatPrice(product.originalPrice, locale)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
