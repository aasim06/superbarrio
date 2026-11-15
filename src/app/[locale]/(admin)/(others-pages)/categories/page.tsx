import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { getCategories } from "@/lib/firebase/db";
import CategoriesClient from "./CategoriesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories Management | SuperBarrio Control Center",
  description: "Manage supermarket departments, catalog taxonomies, and item categories.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Product Categories" />
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
