"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import {
  CartIcon,
  CheckCircleIcon,
  LeafIcon,
  TrashBinIcon,
  WhatsAppIcon,
} from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
    discountRate,
    discountAmount,
    promoCode,
    applyPromoCode,
    removePromoCode,
    total,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
  } = useGroceryCart();

  const [inputCoupon, setInputCoupon] = useState("");

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100),
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyPromoCode(inputCoupon);
    if (res.success) {
      toast.success(res.message, { icon: "🎉" });
      setInputCoupon("");
    } else {
      toast.error(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removePromoCode();
    toast.info("Promo code removed.");
  };

  const getWhatsAppOrderUrl = () => {
    let msg = `*🛒 New Order from SuperBarrio*\n\n`;
    cart.forEach((item, index) => {
      msg += `${index + 1}. *${item.name}* (${item.unit}) x ${item.quantity} = ${formatPrice(item.price * item.quantity, locale)}\n`;
    });
    msg += `\n*Subtotal:* ${formatPrice(subtotal, locale)}`;
    if (discountAmount > 0) {
      msg += `\n*Discount (${promoCode} - ${discountRate * 100}%):* -${formatPrice(discountAmount, locale)}`;
    }
    msg += `\n*Delivery:* ${deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee, locale)}`;
    msg += `\n*Grand Total:* ${formatPrice(total, locale)}\n\n`;
    msg += `Please confirm my order and share delivery details!`;
    return `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`;
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 end-0 flex max-w-full ps-10">
            {/* Animated Sliding Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="flex w-screen max-w-md flex-col bg-white shadow-2xl dark:bg-[#071910] dark:border-s dark:border-emerald-950/80"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-200/80 px-6 py-4.5 dark:border-emerald-950/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CartIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit text-lg font-black tracking-tight text-gray-900 dark:text-white">
                      {t("myBasket")}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      onClick={() => {
                        clearCart();
                        toast.info("Basket cleared.");
                      }}
                      className="rounded-xl px-2.5 py-1 text-xs font-bold text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      title="Clear basket"
                    >
                      {t("clearAll")}
                    </button>
                  )}
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-emerald-950/60 dark:hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Free delivery tracker with Animated Fill */}
              <div className="border-b border-gray-100 bg-emerald-50/60 p-4 dark:border-emerald-950/60 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between text-xs">
                  {amountNeededForFreeDelivery === 0 ? (
                    <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>{t("freeDeliveryUnlocked")}</span>
                    </span>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Add{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatPrice(amountNeededForFreeDelivery, locale)}
                      </strong>{" "}
                      more for{" "}
                      <strong className="text-emerald-600 font-bold">
                        FREE delivery
                      </strong>
                    </span>
                  )}
                  <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                    {progressPercent}%
                  </span>
                </div>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-gray-800">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center py-10">
                    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl dark:bg-emerald-500/15" />
                      <div className="absolute -top-1 -start-1 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-sm shadow-xs dark:bg-amber-950/70">
                        🍊
                      </div>
                      <div className="absolute -bottom-1 -end-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-sm shadow-xs dark:bg-emerald-950/70">
                        🍏
                      </div>
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-xl shadow-emerald-600/30">
                        <CartIcon className="h-10 w-10 stroke-[1.8]" />
                      </div>
                    </div>
                    <h4 className="mt-5 font-outfit text-base sm:text-lg font-black text-gray-900 dark:text-white">
                      {t("emptyBasketTitle")}
                    </h4>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                      {t("emptyBasketDesc")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105 active:scale-95"
                    >
                      ← {t("startShopping")}
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-emerald-950/60">
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3.5 py-4"
                      >
                        {/* Item visual */}
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-emerald-950 dark:bg-gray-800">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <LeafIcon className="h-6 w-6 text-emerald-500" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h5 className="truncate text-xs font-bold text-gray-900 dark:text-white">
                            {item.name}
                          </h5>
                          <p className="text-[11px] font-medium text-gray-500 dark:text-emerald-300/60">
                            {item.unit} • {formatPrice(item.price, locale)}
                          </p>
                          <span className="font-outfit text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {formatPrice(item.price * item.quantity, locale)}
                          </span>
                        </div>

                        {/* Stepper & Delete Action */}
                        <div className="flex shrink-0 items-center gap-2">
                          <div className="flex items-center rounded-xl border border-gray-200/80 bg-gray-50/80 dark:border-emerald-950 dark:bg-emerald-950/40">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="flex h-8 w-7 items-center justify-center text-xs font-black text-gray-600 transition hover:bg-gray-200/60 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-800"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-xs font-black text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="flex h-8 w-7 items-center justify-center text-xs font-black text-gray-600 transition hover:bg-gray-200/60 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-800"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              removeFromCart(item.id);
                              toast.info(`Removed ${item.name}`);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-rose-50 hover:text-rose-500 dark:text-gray-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                            title="Remove from basket"
                          >
                            <TrashBinIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer / Checkout Actions */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200/80 bg-gray-50/90 p-5 dark:border-emerald-950/80 dark:bg-[#05130b]">
                  {/* Promo Code Input Box */}
                  <div className="mb-4">
                    {discountRate > 0 ? (
                      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-50/90 px-3.5 py-2.5 text-xs text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <div className="flex items-center gap-2">
                          <span>🎉</span>
                          <span className="font-extrabold tracking-wide">
                            {promoCode} (20% OFF Applied)
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="font-bold text-rose-500 hover:text-rose-700"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleApplyCoupon}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          placeholder="Promo code (Try FRESH20)"
                          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-emerald-950/80 dark:bg-[#071910] dark:text-white"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white shadow-xs transition hover:bg-emerald-700"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Cost breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                      <span>{t("subtotal")}</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatPrice(subtotal, locale)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Promo Discount (20%)</span>
                        <span>-{formatPrice(discountAmount, locale)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                      <span>{t("deliveryFee")}</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {t("free")}
                          </span>
                        ) : (
                          formatPrice(deliveryFee, locale)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-gray-200/80 pt-2 text-sm font-black text-gray-900 dark:border-emerald-950/80 dark:text-white">
                      <span>{t("total")}</span>
                      <motion.span
                        key={total}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="font-outfit text-xl font-black text-emerald-600 dark:text-emerald-400"
                      >
                        {formatPrice(total, locale)}
                      </motion.span>
                    </div>
                  </div>

                  {/* Checkout & WhatsApp Order Actions */}
                  <div className="mt-4 flex flex-col gap-2.5">
                    <Link
                      href="/grocery/checkout"
                      onClick={() => setIsCartOpen(false)}
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-600/40 active:scale-98"
                    >
                      <span>{t("proceedToCheckout")}</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        ➔
                      </span>
                    </Link>

                    <a
                      href={getWhatsAppOrderUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-[#25D366]/10 py-3 text-xs font-bold text-[#128C7E] transition-all duration-200 hover:bg-[#25D366] hover:text-white dark:bg-[#25D366]/20 dark:text-emerald-300 dark:hover:bg-[#25D366] dark:hover:text-white"
                    >
                      <WhatsAppIcon className="h-4 w-4 fill-current" />
                      <span>{t("orderViaWhatsApp")}</span>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
