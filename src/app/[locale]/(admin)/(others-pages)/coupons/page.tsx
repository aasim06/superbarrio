import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CouponsTableClient, { Coupon } from "./CouponsTableClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coupons & Promotions | SuperBarrio Control Center",
  description: "Configure discount codes, percentage vouchers, and minimum order qualifiers.",
};

const ACTIVE_COUPONS: Coupon[] = [];

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Coupons & Discounts" />

      <ComponentCard
        title="Active Promotion Codes"
        desc="Discount vouchers validated server-side during checkout."
      >
        <CouponsTableClient coupons={ACTIVE_COUPONS} />
      </ComponentCard>
    </div>
  );
}
