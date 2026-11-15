import { getOrders } from "@/lib/firebase/db";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrdersTableClient from "./OrdersTableClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders Management | SuperBarrio Control Center",
  description: "Monitor and manage customer grocery orders, payment statuses, and delivery dispatch.",
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Customer Orders" />

      <ComponentCard
        title="Live Orders Dispatch"
        desc="Real-time order pipeline connected to Firestore database."
      >
        <OrdersTableClient initialOrders={orders} />
      </ComponentCard>
    </div>
  );
}
