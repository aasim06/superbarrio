"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAllGroceryOrders } from "@/data/groceryAdminStore";
import { CustomerOrder } from "@/types/grocery";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function LineChartOne() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    // Load real customer orders from storage
    setOrders(getAllGroceryOrders());

    const handleUpdate = () => {
      setOrders(getAllGroceryOrders());
    };

    window.addEventListener("grocery-orders-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("grocery-orders-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const monthCategories = [
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
  ];

  // Aggregate real orders per calendar month
  const salesData = Array(12).fill(0);
  const revenueData = Array(12).fill(0);

  orders.forEach((order) => {
    const d = order.createdAt ? new Date(order.createdAt) : new Date();
    const month = d.getMonth();
    if (month >= 0 && month < 12) {
      const itemsCount = (order.items || []).reduce(
        (sum, it) => sum + (Number(it.quantity) || 1),
        0,
      );
      salesData[month] += itemsCount || 1;
      revenueData[month] += Math.round((Number(order.total) || 0) * 100) / 100;
    }
  });

  const series = [
    {
      name: "Items Sold",
      data: salesData,
    },
    {
      name: "Revenue (€)",
      data: revenueData.map((v) => Number(v.toFixed(2))),
    },
  ];

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#10b981", "#465FFF"], // Emerald for Sales, Blue for Revenue
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      width: "100%",
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
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number, { seriesIndex }: any) => {
          if (seriesIndex === 0) return `${val} items sold`;
          return `€${val.toFixed(2)}`;
        },
      },
    },
    xaxis: {
      type: "category",
      categories: monthCategories,
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
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val: number) => `€${val.toFixed(0)}`,
      },
    },
  };

  return (
    <div className="custom-scrollbar w-full max-w-full overflow-x-auto">
      <div id="chartEight" className="min-w-[550px] sm:min-w-[600px] xl:min-w-full">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={310}
        />
      </div>
    </div>
  );
}
