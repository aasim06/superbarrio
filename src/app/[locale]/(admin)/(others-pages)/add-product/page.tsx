import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AddProductView from "@/components/products/AddProductView";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Product Card | SuperBarrio Supermarket Control Center",
  description:
    "Create and configure grocery product cards with image, pricing, categories, and real-time live preview.",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AddProductPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Product Card" />
      <AddProductView />
    </div>
  );
}

