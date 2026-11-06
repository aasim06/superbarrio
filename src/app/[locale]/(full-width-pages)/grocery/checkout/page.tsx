import React from "react";
import CheckoutView from "@/components/grocery/CheckoutView";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | SuperBarrio",
  description: "Complete your grocery order with fast express delivery.",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CheckoutView />;
}
