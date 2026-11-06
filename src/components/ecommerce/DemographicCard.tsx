"use client";

import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { LeafIcon } from "@/icons";
import { useLocale } from "next-intl";
import { formatCompactCurrency } from "@/utils/currency";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function DemographicCard() {
  const locale = useLocale();

  const categories = [
    { name: "Fruits & Vegetables", percent: 35, revenueNum: 16901, color: "#10b981" },
    { name: "Dairy & Eggs", percent: 24, revenueNum: 11589, color: "#f59e0b" },
    { name: "Bakery & Breads", percent: 16, revenueNum: 7726, color: "#ea580c" },
    { name: "Meat & Poultry", percent: 12, revenueNum: 5794, color: "#ef4444" },
    { name: "Pantry & Cooking", percent: 8, revenueNum: 3863, color: "#8b5cf6" },
    { name: "Drinks & Snacks", percent: 5, revenueNum: 2414, color: "#06b6d4" },
  ];

  const series = categories.map((c) => c.percent);

  const options: ApexOptions = {
    colors: categories.map((c) => c.color),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 240,
    },
    labels: categories.map((c) => c.name),
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Top Dept",
              formatter: () => "Fresh Produce",
              fontSize: "13px",
              fontWeight: 700,
              color: "#10b981",
            },
          },
        },
      },
    },
    stroke: {
      width: 2,
      colors: ["#ffffff"],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}% of Total Revenue`,
      },
    },
  };

  const deliveryZones = [
    { zone: "Madrid Centro & Salamanca", orders: 482, onTime: "99.2%" },
    { zone: "Barcelona Eixample & Gràcia", orders: 395, onTime: "98.5%" },
    { zone: "Valencia Ciutat Vella & Ruzafa", orders: 320, onTime: "97.8%" },
    { zone: "Sevilla Triana & Nervión", orders: 285, onTime: "98.1%" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Department Sales Share
          </h3>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <LeafIcon className="h-3.5 w-3.5" />
            7 Departments
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Revenue contribution by supermarket category
        </p>
      </div>

      {/* Donut Chart */}
      <div className="mt-4 flex items-center justify-center">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={240}
        />
      </div>

      {/* Category List */}
      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
        {categories.slice(0, 4).map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {cat.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{cat.percent}%</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCompactCurrency(cat.revenueNum, locale)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Zones Breakdown */}
      <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider dark:text-white/90">
          Top Local Delivery Zones
        </h4>
        <div className="mt-2.5 space-y-2">
          {deliveryZones.map((z) => (
            <div key={z.zone} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {z.zone}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {z.orders} orders
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {z.onTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
