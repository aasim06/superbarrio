import React from "react";
import OrderSuccessView from "@/components/grocery/OrderSuccessView";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¡Pedido Realizado con Éxito! | SuperBarrio España",
  description: "Sigue en directo la preparación y entrega de tu pedido de alimentos frescos en España.",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OrderSuccessView />;
}
