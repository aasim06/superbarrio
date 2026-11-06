"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpIcon,
  BoxIcon,
  CartIcon,
  DollarLineIcon,
  TruckIcon,
} from "@/icons";
import Badge from "../ui/badge/Badge";
import {
  getAllGroceryOrders,
  computeGroceryDashboardMetrics,
  SEEDED_ORDERS,
} from "@/data/groceryAdminStore";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";

export const EcommerceMetrics = () => {
  const t = useTranslations("ecommerce.metrics");
  const locale = useLocale();

  const [metrics, setMetrics] = useState(() => {
    return computeGroceryDashboardMetrics(SEEDED_ORDERS);
  });

  useEffect(() => {
    setMetrics(computeGroceryDashboardMetrics(getAllGroceryOrders()));

    const handleUpdate = () => {
      setMetrics(computeGroceryDashboardMetrics(getAllGroceryOrders()));
    };

    window.addEventListener("grocery-orders-updated", handleUpdate);
    return () => {
      window.removeEventListener("grocery-orders-updated", handleUpdate);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {/* 1. Total Supermarket Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <DollarLineIcon className="h-6 w-6" />
          </div>
          <Badge color="success">
            <ArrowUpIcon className="h-3 w-3" />
            +14.2%
          </Badge>
        </div>

        <div className="mt-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Total Revenue
          </span>
          <h4
            suppressHydrationWarning
            className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90"
          >
            {formatPrice(metrics.totalRevenue, locale)}
          </h4>
          <p className="mt-1 text-[11px] text-gray-400">
            Across 8 SuperBarrio departments
          </p>
        </div>
      </div>

      {/* 2. Total Grocery Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <BoxIcon className="h-6 w-6" />
          </div>
          <Badge color="success">
            <ArrowUpIcon className="h-3 w-3" />
            +8.5%
          </Badge>
        </div>

        <div className="mt-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            {t("orders")}
          </span>
          <h4
            suppressHydrationWarning
            className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90"
          >
            {metrics.totalOrders.toLocaleString()} Orders
          </h4>
          <p className="mt-1 text-[11px] text-gray-400">
            {metrics.statusCounts.on_the_way} out for delivery right now
          </p>
        </div>
      </div>

      {/* 3. Average Order Value (AOV) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <CartIcon className="h-6 w-6 stroke-[1.8]" />
          </div>
          <Badge color="success">
            <ArrowUpIcon className="h-3 w-3" />
            +4.1%
          </Badge>
        </div>

        <div className="mt-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Avg Order Basket
          </span>
          <h4
            suppressHydrationWarning
            className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90"
          >
            {formatPrice(metrics.avgOrderValue, locale)}
          </h4>
          <p className="mt-1 text-[11px] text-gray-400">
            4.2 items average per shopping basket
          </p>
        </div>
      </div>

      {/* 4. On-Time Delivery Performance */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <TruckIcon className="h-6 w-6 stroke-[1.8]" />
          </div>
          <Badge color="success">
            {metrics.onTimeDeliveryRate}% On-Time
          </Badge>
        </div>

        <div className="mt-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Avg Delivery Time
          </span>
          <h4
            suppressHydrationWarning
            className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90"
          >
            {metrics.avgDeliveryMinutes} Minutes
          </h4>
          <p className="mt-1 text-[11px] text-gray-400">
            Fastest: 18 min in Central Zone
          </p>
        </div>
      </div>
    </div>
  );
};

export default EcommerceMetrics;
