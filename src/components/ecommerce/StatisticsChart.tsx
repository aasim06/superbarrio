"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";
import ChartTab from "../common/ChartTab";
import { useLocale } from "next-intl";
import { getCurrencySymbol, formatCompactCurrency } from "@/utils/currency";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StatisticsChart() {
  const locale = useLocale();
  const currSymbol = getCurrencySymbol(locale);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "monthly" | "weekly" | "annually"
  >("monthly");

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
      markers: {
        size: 5,
      },
    },
    colors: ["#10b981", "#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2.5, 2.5],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 0,
    },
    xaxis: {
      type: "category",
      categories: [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "12px",
        },
        formatter: (val: number) => formatCompactCurrency(val, locale),
      },
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: `Gross Sales (${currSymbol})`,
      data: [1840, 2120, 2480, 2210, 2980, 3420, 3190],
    },
    {
      name: `Net Orders Revenue (${currSymbol})`,
      data: [1620, 1910, 2240, 1990, 2710, 3110, 2890],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-5 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Daily Grocery Sales & Revenue Velocity
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Real-time grocery gross vs net revenue tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChartTab
            selected={selectedPeriod}
            onChange={(period) => setSelectedPeriod(period)}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[650px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={280} />
        </div>
      </div>
    </div>
  );
}
