"use client";

import React from "react";
import { GroceryProduct } from "@/types/grocery";
import { useGroceryCart } from "@/context/GroceryCartContext";
import Badge from "@/components/ui/badge/Badge";
import { LeafIcon } from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";

interface ProductCardProps {
  product: GroceryProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const { cart, addToCart, updateQuantity } = useGroceryCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs transition-all hover:border-brand-200 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-gray-700">
      <div>
        {/* Product Visual Container */}
        <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 transition dark:bg-gray-800">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-200/60 text-gray-400 dark:bg-gray-700 dark:text-gray-400">
              <LeafIcon className="h-6 w-6 stroke-[1.5]" />
            </div>
          )}

          {/* Badge */}
          {product.badge && (
            <div className="absolute start-2.5 top-2.5 z-10">
              <Badge variant="solid" color="success" size="sm">
                {product.badge}
              </Badge>
            </div>
          )}

          {/* Rating */}
          <div className="absolute end-2.5 top-2.5 z-10 flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-bold text-gray-800 shadow-theme-xs backdrop-blur-xs dark:bg-gray-900/95 dark:text-gray-200">
            <span className="text-warning-500">★</span>
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span>{product.unit}</span>
            {product.origin && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] dark:bg-gray-800">
                {product.origin}
              </span>
            )}
          </div>

          <h4 className="mt-1 line-clamp-1 text-sm font-semibold text-gray-800 transition group-hover:text-brand-600 dark:text-white/90 dark:group-hover:text-brand-400">
            {product.name}
          </h4>

          <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
            {product.description}
          </p>
        </div>
      </div>

      {/* Bottom Pricing & Add / Quantity Stepper */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price, locale)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through dark:text-gray-500">
                {formatPrice(product.originalPrice, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Stepper or Add button */}
        {quantity === 0 ? (
          <button
            onClick={() => addToCart(product, 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 shadow-theme-xs transition hover:bg-brand-500 hover:text-white dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-brand-500 dark:hover:text-white"
          >
            <span className="text-sm font-bold">+</span>
            <span>{t("addToCart")}</span>
          </button>
        ) : (
          <div className="inline-flex items-center rounded-lg border border-brand-500 bg-brand-500 text-white shadow-theme-xs">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-s-md text-sm font-bold hover:bg-brand-600 transition"
              title="Decrease quantity"
            >
              -
            </button>
            <span className="px-2 text-xs font-bold">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-e-md text-sm font-bold hover:bg-brand-600 transition"
              title="Increase quantity"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
