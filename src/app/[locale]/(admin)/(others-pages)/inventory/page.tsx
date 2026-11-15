import { getProducts } from "@/lib/firebase/db";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InventoryTableClient from "./InventoryTableClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory & Stock Control | SuperBarrio Control Center",
  description: "Monitor real-time warehouse stock levels, low-inventory alerts, and item replenishment.",
};

export default async function InventoryPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Inventory & Stock" />

      <ComponentCard
        title="Warehouse Inventory Levels"
        desc="Real-time stock indicators synced with store ordering."
      >
        <InventoryTableClient initialProducts={products} />
      </ComponentCard>
    </div>
  );
}
