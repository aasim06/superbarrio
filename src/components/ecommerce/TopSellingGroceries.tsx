"use client";

import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import {
  computeGroceryDashboardMetrics,
  getAllGroceryOrders,
  SEEDED_ORDERS,
} from "@/data/groceryAdminStore";
import { AlertIcon, LeafIcon } from "@/icons";
import { useLocale } from "next-intl";
import { formatPrice } from "@/utils/currency";

export default function TopSellingGroceries() {
  const locale = useLocale();
  const [metrics, setMetrics] = useState(() =>
    computeGroceryDashboardMetrics(SEEDED_ORDERS),
  );

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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Top-Selling Fresh Products & Inventory
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Highest turnover supermarket essentials with real-time stock status
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
          <LeafIcon className="h-3.5 w-3.5" />
          Fresh Daily
        </span>
      </div>

      <div className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
        {metrics.topProducts.map((product, idx) => (
          <div
            key={product.id}
            className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Product Rank & Info */}
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 text-xs font-black text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                #{idx + 1}
              </span>

              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-800">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h4>
                <span className="text-[11px] text-gray-400">
                  {product.category} • {product.unit} @ {formatPrice(product.price, locale)}
                </span>
              </div>
            </div>

            {/* Sales Volume & Stock Status */}
            <div className="flex items-center justify-between gap-6 sm:justify-end">
              <div className="text-start sm:text-end">
                <span className="block text-xs font-bold text-gray-900 dark:text-white">
                  {formatPrice(product.revenue, locale)}
                </span>
                <span className="block text-[11px] text-gray-400">
                  {product.unitsSold.toLocaleString()} sold
                </span>
              </div>

              <div>
                {product.status === "Low Stock" ? (
                  <Badge color="warning">
                    <span className="flex items-center gap-1">
                      <AlertIcon className="h-3 w-3" />
                      Low: {product.stock} left
                    </span>
                  </Badge>
                ) : (
                  <Badge color="success">
                    In Stock ({product.stock})
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

