"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useLocale } from "next-intl";
import { getCurrencySymbol, formatPrice, formatCompactCurrency } from "@/utils/currency";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const locale = useLocale();
  const currSymbol = getCurrencySymbol(locale);
  const [viewMode, setViewMode] = useState<"revenue" | "orders">("revenue");

  const revenueData = [
    28400, 31200, 34500, 32800, 38100, 41200, 43600, 42100, 45300, 48290,
    51000, 54200,
  ];
  const ordersData = [
    1120, 1240, 1380, 1310, 1520, 1640, 1720, 1680, 1790, 1842, 1980, 2100,
  ];

  const series = [
    {
      name: viewMode === "revenue" ? `Revenue (${currSymbol})` : "Orders Count",
      data: viewMode === "revenue" ? revenueData : ordersData,
    },
  ];

  const options: ApexOptions = {
    colors: [viewMode === "revenue" ? "#10b981" : "#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 240,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: "#9ca3af",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: "#9ca3af",
        },
        formatter: (val: number) => {
          if (viewMode === "revenue") {
            return formatCompactCurrency(val, locale);
          }
          return val.toLocaleString();
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          if (viewMode === "revenue") {
            return formatPrice(val, locale);
          }
          return `${val.toLocaleString()} Orders`;
        },
      },
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            SuperBarrio Sales Turnover & Velocity
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Monthly grocery performance across all departments
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setViewMode("revenue")}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
              viewMode === "revenue"
                ? "bg-white text-emerald-600 shadow-theme-xs dark:bg-gray-900 dark:text-emerald-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            Revenue ({currSymbol})
          </button>
          <button
            type="button"
            onClick={() => setViewMode("orders")}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
              viewMode === "orders"
                ? "bg-white text-brand-600 shadow-theme-xs dark:bg-gray-900 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            Orders Count
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ms-4 min-w-[580px] pt-4">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={240}
          />
        </div>
      </div>
    </div>
  );
}
