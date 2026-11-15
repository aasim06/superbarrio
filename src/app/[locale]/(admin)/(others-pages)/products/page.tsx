import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductsTableView from "@/components/products/ProductsTableView";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products Management | SuperBarrio Control Center",
  description:
    "View, search, edit, and delete supermarket products with real-time inventory synchronization.",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProductsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Products Management" />
      <ProductsTableView />
    </div>
  );
}
