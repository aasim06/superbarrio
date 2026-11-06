"use client";

import React, { useRef, useState } from "react";
import { GroceryProduct } from "@/types/grocery";
import { useGroceryCart } from "@/context/GroceryCartContext";
import Badge from "@/components/ui/badge/Badge";
import { LeafIcon } from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: GroceryProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const { cart, addToCart, updateQuantity } = useGroceryCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, imageRef.current);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, imageRef.current);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_16px_32px_-8px_rgba(22,163,74,0.2)] dark:border-emerald-950/60 dark:bg-[#071d12]/70 dark:hover:border-emerald-700/80 dark:hover:shadow-[0_16px_32px_-8px_rgba(34,197,94,0.15)]"
    >
      <div>
        {/* Product Visual Container with Skeleton Shimmer */}
        <div className="relative flex h-36 sm:h-44 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-100/80 dark:bg-gray-800/60">
          {/* Skeleton Shimmer Loader */}
          {!imageLoaded && product.imageUrl && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-emerald-950/40 dark:via-gray-800 dark:to-emerald-950/40" />
          )}

          {product.imageUrl ? (
            <img
              ref={imageRef}
              src={product.imageUrl}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.08] ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-400">
              <LeafIcon className="h-6 w-6 stroke-[1.5]" />
            </div>
          )}

          {/* Offer / Category Badge with Subtle Pulsing glow */}
          {product.badge && (
            <div className="absolute start-2.5 top-2.5 z-10">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-white shadow-[0_2px_10px_rgba(245,158,11,0.45)] animate-[pulse_2.5s_infinite]">
                {product.badge}
              </span>
            </div>
          )}

          {/* Floating Rating Tag */}
          <div className="absolute end-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-black text-gray-800 shadow-sm backdrop-blur-md dark:bg-gray-900/95 dark:text-gray-100">
            <span className="text-amber-500">★</span>
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-emerald-300/70">
            <span>{product.unit}</span>
            {product.origin && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold dark:bg-emerald-950/60 dark:text-emerald-300">
                {product.origin}
              </span>
            )}
          </div>

          <h4 className="mt-1 font-outfit line-clamp-1 text-sm sm:text-[15px] font-black text-gray-900 transition-colors duration-200 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
            {product.name}
          </h4>

          <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            {product.description}
          </p>
        </div>
      </div>

      {/* Bottom Pricing & Dynamic Add Button / Stepper */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-emerald-950/60">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-outfit text-base font-black text-gray-900 dark:text-white">
              {formatPrice(product.price, locale)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through dark:text-gray-500 font-medium">
                {formatPrice(product.originalPrice, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Stepper with Smooth Expand/Collapse Transition */}
        <div className="flex items-center">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add-btn"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 px-3 py-1.5 text-xs font-black text-emerald-700 shadow-xs transition-colors duration-200 hover:bg-emerald-600 hover:text-white dark:border-emerald-500/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white"
              >
                <span className="text-sm font-black">+</span>
                <span>{t("addToCart")}</span>
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-600/30 overflow-hidden"
              >
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleDecrement}
                  className="flex h-7 w-7 items-center justify-center font-black hover:bg-emerald-700/60 transition-colors"
                  title="Decrease"
                >
                  -
                </motion.button>

                <motion.span
                  key={quantity}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className="px-2 text-xs font-black min-w-5 text-center"
                >
                  {quantity}
                </motion.span>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleIncrement}
                  className="flex h-7 w-7 items-center justify-center font-black hover:bg-emerald-700/60 transition-colors"
                  title="Increase"
                >
                  +
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
