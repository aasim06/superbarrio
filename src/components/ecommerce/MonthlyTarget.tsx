"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { CheckCircleIcon } from "@/icons";
import { useLocale } from "next-intl";
import { formatPrice, formatCompactCurrency } from "@/utils/currency";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget() {
  const locale = useLocale();
  const targetAmount = 50000;
  const currentRevenue = 48290.5;
  const progressPercent = Math.min(
    100,
    Number(((currentRevenue / targetAmount) * 100).toFixed(1)),
  );

  const series = [progressPercent];

  const options: ApexOptions = {
    colors: ["#10b981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 310,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "75%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "32px",
            fontWeight: "800",
            offsetY: -25,
            color: "#111827",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#059669"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round",
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Monthly Revenue Goal
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            On Track
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          SuperBarrio monthly revenue milestone
        </p>
      </div>

      <div className="relative mt-2 flex justify-center">
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={300}
        />
      </div>

      <div className="-mt-16 text-center">
        <p className="mx-auto max-w-[280px] text-xs text-gray-600 dark:text-gray-400">
          You earned{" "}
          <strong className="text-emerald-600 dark:text-emerald-400">
            {formatPrice(2140, locale)} today
          </strong>
          , pacing 14% higher than last month&apos;s daily average.
        </p>

        {/* Milestone Stats */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4 dark:divide-gray-800 dark:border-gray-800">
          <div className="px-2">
            <span className="block text-[11px] text-gray-400">Goal</span>
            <span className="block text-sm font-bold text-gray-800 dark:text-white">
              {formatCompactCurrency(targetAmount, locale)}
            </span>
          </div>
          <div className="px-2">
            <span className="block text-[11px] text-gray-400">Achieved</span>
            <span className="block text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatCompactCurrency(currentRevenue, locale)}
            </span>
          </div>
          <div className="px-2">
            <span className="block text-[11px] text-gray-400">Today</span>
            <span className="block text-sm font-bold text-brand-600 dark:text-brand-400">
              {formatCompactCurrency(2140, locale)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
