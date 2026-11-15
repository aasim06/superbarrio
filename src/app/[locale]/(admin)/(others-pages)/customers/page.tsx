import { getCustomers } from "@/lib/firebase/db";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CustomersTableClient from "./CustomersTableClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers Directory | SuperBarrio Control Center",
  description: "Customer database, Google auth records, login activity, and order history.",
};

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Customers & User Registrations" />
      <CustomersTableClient initialCustomers={customers} />
    </div>
  );
}
