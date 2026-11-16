import React from "react";
import GroceryLayoutWrapper from "@/components/grocery/GroceryLayoutWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SuperBarrio | Alimentos Frescos de Granja Entregados en Minutos",
  description:
    "Pide verduras frescas de huerta, frutas ecológicas, lácteos del día, panadería artesana y alimentos básicos directos a tu hogar en España.",
};

export default function GroceryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GroceryLayoutWrapper>{children}</GroceryLayoutWrapper>;
}
