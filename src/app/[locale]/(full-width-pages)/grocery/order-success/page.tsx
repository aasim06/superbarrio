import React from "react";
import OrderSuccessView from "@/components/grocery/OrderSuccessView";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Placed Successfully | SuperBarrio",
  description: "Track your live fresh grocery delivery order.",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OrderSuccessView />;
}
