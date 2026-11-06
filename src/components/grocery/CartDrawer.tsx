"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { CartIcon, CheckCircleIcon, LeafIcon, TrashBinIcon, WhatsAppIcon } from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";

export const CartDrawer: React.FC = () => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
  } = useGroceryCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100),
  );

  const getWhatsAppOrderUrl = () => {
    let msg = `*New Order from SuperBarrio*\n\n`;
    cart.forEach((item, index) => {
      msg += `${index + 1}. *${item.name}* (${item.unit}) x ${item.quantity} = ${formatPrice(item.price * item.quantity, locale)}\n`;
    });
    msg += `\n*Subtotal:* ${formatPrice(subtotal, locale)}`;
    msg += `\n*Delivery:* ${deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee, locale)}`;
    msg += `\n*Total Amount:* ${formatPrice(total, locale)}\n\n`;
    msg += `Please confirm my order and share delivery details!`;
    return `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 end-0 flex max-w-full ps-10">
        <div className="flex w-screen max-w-md flex-col bg-white shadow-2xl dark:bg-gray-900">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <CartIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("myBasket")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 transition hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-950/30 dark:hover:text-error-400"
                  title="Clear basket"
                >
                  {t("clearAll")}
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Free delivery tracker */}
          <div className="border-b border-gray-100 bg-brand-50/50 p-4 dark:border-gray-800 dark:bg-brand-950/20">
            <div className="flex items-center justify-between text-xs">
              {amountNeededForFreeDelivery === 0 ? (
                <span className="flex items-center gap-1 font-semibold text-success-600 dark:text-success-400">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{t("freeDeliveryUnlocked")}</span>
                </span>
              ) : (
                <span className="text-gray-600 dark:text-gray-300">
                  Add{" "}
                  <strong className="text-brand-600 dark:text-brand-400">
                    {formatPrice(amountNeededForFreeDelivery, locale)}
                  </strong>{" "}
                  more for <strong className="text-success-600">FREE delivery</strong>
                </span>
              )}
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                {progressPercent}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                  <CartIcon className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h4 className="mt-4 text-base font-bold text-gray-800 dark:text-white">
                  {t("emptyBasketTitle")}
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("emptyBasketDesc")}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600"
                >
                  {t("startShopping")}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3.5">
                    {/* Item visual */}
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 text-2xl dark:bg-gray-800">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <LeafIcon className="h-5 w-5 text-brand-500" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h5 className="truncate text-xs font-semibold text-gray-800 dark:text-white">
                        {item.name}
                      </h5>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {item.unit} • {formatPrice(item.price, locale)}
                      </p>
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {formatPrice(item.price * item.quantity, locale)}
                      </span>
                    </div>

                    {/* Stepper & Delete Action */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      {/* Stepper */}
                      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/60 dark:border-gray-700 dark:bg-gray-800/60">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex h-7 w-6 items-center justify-center rounded-s-lg text-xs font-bold text-gray-600 transition hover:bg-gray-200/60 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          title="Decrease"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-gray-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex h-7 w-6 items-center justify-center rounded-e-lg text-xs font-bold text-gray-600 transition hover:bg-gray-200/60 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          title="Increase"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-error-50 hover:text-error-500 dark:text-gray-500 dark:hover:bg-error-950/40 dark:hover:text-error-400"
                        title="Remove from basket"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer / Checkout Actions */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/90">
              {/* Cost breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t("subtotal")}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(subtotal, locale)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t("deliveryFee")}</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="font-semibold text-success-600">{t("free")}</span>
                    ) : (
                      formatPrice(deliveryFee, locale)
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold text-gray-900 dark:border-gray-800 dark:text-white">
                  <span>{t("total")}</span>
                  <span className="text-base text-brand-600 dark:text-brand-400">
                    {formatPrice(total, locale)}
                  </span>
                </div>
              </div>

              {/* Checkout & WhatsApp Order Actions */}
              <div className="mt-4 flex flex-col gap-2.5">
                <Link
                  href="/grocery/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600"
                >
                  <span>{t("proceedToCheckout")}</span>
                  <span>➔</span>
                </Link>

                <a
                  href={getWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-[#25D366]/10 py-2.5 text-xs font-semibold text-[#128C7E] transition hover:bg-[#25D366] hover:text-white dark:bg-[#25D366]/20 dark:text-emerald-300 dark:hover:bg-[#25D366] dark:hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-current" />
                  <span>{t("orderViaWhatsApp")}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
