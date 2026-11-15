import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DeliveryTableClient, { DeliveryZone } from "./DeliveryTableClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery Zones & Slots | SuperBarrio Control Center",
  description: "Configure local delivery dispatch zones, postal code coverage, and delivery time windows.",
};

const ZONES: DeliveryZone[] = [];

export default function DeliveryPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Delivery Zones & Logistics" />

      <ComponentCard
        title="Active Dispatch Coverage"
        desc="Geographic zones and express delivery fulfillment rules."
      >
        <DeliveryTableClient zones={ZONES} />
      </ComponentCard>
    </div>
  );
}
