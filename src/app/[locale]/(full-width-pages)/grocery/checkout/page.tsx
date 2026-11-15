import React from "react";
import CheckoutView from "@/components/grocery/CheckoutView";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finalizar Compra | SuperBarrio España",
  description: "Completa tu pedido de supermercado fresco con entrega rápida en España.",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CheckoutView />;
}
