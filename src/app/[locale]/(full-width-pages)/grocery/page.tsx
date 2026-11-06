import React from "react";
import GroceryCatalog from "@/components/grocery/GroceryCatalog";
import { setRequestLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function GroceryPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <GroceryCatalog />;
}
