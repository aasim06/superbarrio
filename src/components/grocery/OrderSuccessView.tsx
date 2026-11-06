"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CustomerOrder } from "@/types/grocery";
import Badge from "@/components/ui/badge/Badge";
import { WhatsAppIcon, BoxIcon, TruckIcon, HomeIcon, MapPinIcon } from "@/icons";
import { useLocale } from "next-intl";
import { formatPrice } from "@/utils/currency";

export const OrderSuccessView: React.FC = () => {
  const locale = useLocale();
  const [order, setOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tailgrocery_last_order");
      if (stored) {
        const parsed = JSON.parse(stored);
        queueMicrotask(() => setOrder(parsed));
      }
    } catch {
      // Ignore
    }
  }, []);

  const orderId = order?.orderId || "ORD-583921";
  const items = order?.items || [];
  const total = order?.total || 24.5;
  const address = order?.address || "Street 4, Sector B, Main City";
  const slot = order?.deliverySlot || "Express Delivery (25 - 35 mins)";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-14">
      {/* Success Card */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-sm sm:p-10 text-center dark:border-gray-800 dark:bg-gray-900">
        {/* Animated Green Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-50 text-success-600 ring-8 ring-success-50/50 dark:bg-success-950/40 dark:text-success-400 dark:ring-success-950/20">
          <svg
            className="h-10 w-10 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <Badge variant="light" color="success" size="md">
          Order Confirmed
        </Badge>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
          Thank you! Your order is placed.
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We&apos;ve received your grocery order and our warehouse team is
          currently hand-picking the freshest items for you.
        </p>

        {/* Order Details Banner */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-gray-50 p-4 text-xs dark:bg-gray-800/60">
          <div>
            <span className="text-gray-400 block">Order ID</span>
            <span className="font-bold text-gray-800 dark:text-white">
              #{orderId}
            </span>
          </div>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <div>
            <span className="text-gray-400 block">Estimated Arrival</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {slot}
            </span>
          </div>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <div>
            <span className="text-gray-400 block">Payment</span>
            <span className="font-bold text-gray-800 dark:text-white">
              Cash on Delivery ({formatPrice(total, locale)})
            </span>
          </div>
        </div>

        {/* Live Delivery Tracker Timeline */}
        <div className="mt-8 border-t border-gray-100 pt-8 dark:border-gray-800 text-start">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Live Order Status
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Step 1 */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-500 text-xs font-bold text-white shadow-theme-xs">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Order Placed
                </h4>
                <p className="text-[11px] text-gray-400">Received at system</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white shadow-theme-xs ring-4 ring-brand-100 dark:ring-brand-950 animate-pulse">
                <BoxIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  Packing Items
                </h4>
                <p className="text-[11px] text-gray-400">Quality check active</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-start gap-2 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <TruckIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                  On the Way
                </h4>
                <p className="text-[11px] text-gray-400">Rider assigned</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-start gap-2 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <HomeIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                  Delivered
                </h4>
                <p className="text-[11px] text-gray-400">At your doorstep</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details Summary */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-start text-xs dark:border-gray-800 dark:bg-gray-850">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
              <MapPinIcon className="h-4 w-4 text-brand-500" /> Delivering to:
            </span>
            <span className="text-gray-500 dark:text-gray-400">{address}</span>
          </div>
          {items.length > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <span className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Order Items ({items.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {items.map((it) => (
                  <span
                    key={it.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="h-4 w-4 rounded object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span>{it.emoji}</span>
                    )}
                    <span>
                      {it.quantity}x {it.name}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buttons / Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/grocery"
            className="w-full rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600 sm:w-auto"
          >
            ← Order More Groceries
          </Link>
          <Link
            href="/dashboard"
            className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
          >
            Go to Admin Dashboard
          </Link>
        </div>

        {/* WhatsApp Support Link */}
        <div className="mt-5 flex justify-center">
          <a
            href={`https://wa.me/923001234567?text=${encodeURIComponent(
              `Hello SuperBarrio! I placed order #${order?.orderId || ""}. Could you please update me on delivery status?`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-[#25D366]/10 px-4 py-2 text-xs font-semibold text-[#128C7E] transition hover:bg-[#25D366] hover:text-white dark:bg-[#25D366]/20 dark:text-emerald-300 dark:hover:bg-[#25D366] dark:hover:text-white"
          >
            <WhatsAppIcon className="h-4 w-4 fill-current" />
            <span>Track / Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessView;
