"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import {
  CartIcon,
  PlusIcon,
  RefreshIcon,
  StoreIcon,
} from "@/icons";

export default function StoreManagerHeader() {
  const handleRefresh = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("grocery-orders-updated"));
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950 via-gray-900 to-brand-950 p-6 text-white shadow-theme-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-gray-950 shadow-theme-xs">
          <StoreIcon className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight">
              Super<span className="text-emerald-400">Barrio</span> Supermarket
              Hub
            </h2>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Store Online
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-300">
            Real-time grocery inventory, customer orders dispatch & revenue analytics
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Add Product Link */}
        <Link
          href="/add-product"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
          title="Create a new grocery product card"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </Link>

        {/* Refresh Live Data */}
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
          title="Refresh orders & metrics"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
          <span>Sync Data</span>
        </button>

        {/* Visit Grocery Storefront Link */}
        <Link
          href="/grocery"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-gray-950 shadow-theme-xs transition hover:from-emerald-400 hover:to-teal-400 active:scale-95"
        >
          <CartIcon className="h-4 w-4" />
          <span>Open Grocery Storefront →</span>
        </Link>
      </div>
    </div>
  );
}

