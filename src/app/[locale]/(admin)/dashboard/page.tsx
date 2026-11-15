import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import ComponentCard from "@/components/common/ComponentCard";
import LineChartOne from "@/components/charts/line/LineChartOne";
import StoreManagerHeader from "@/components/ecommerce/StoreManagerHeader";
import TopSellingGroceries from "@/components/ecommerce/TopSellingGroceries";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "SuperBarrio Control Center | Live Grocery & Supermarket Dashboard",
  description:
    "Real-time sales turnover, inventory, express dispatch & orders management for SuperBarrio Supermarket.",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function EcommerceDashboard({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      {/* 1. SuperBarrio Store Status Bar */}
      <StoreManagerHeader />

      {/* 2. Primary KPI Performance Metrics (4-Column Full Width) */}
      <EcommerceMetrics />

      {/* 3. Line Chart from Chart Module */}
      <div className="w-full min-w-0 max-w-full">
        <ComponentCard
          title="Line Chart"
          desc="Monthly sales & revenue velocity tracking"
        >
          <LineChartOne />
        </ComponentCard>
      </div>

      {/* 4. Live Orders Management & Inventory Alerts */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <RecentOrders />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <TopSellingGroceries />
        </div>
      </div>
    </div>
  );
}
