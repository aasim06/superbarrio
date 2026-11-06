import React from "react";
import { GroceryCartProvider } from "@/context/GroceryCartContext";
import GroceryHeader from "@/components/grocery/GroceryHeader";
import CartDrawer from "@/components/grocery/CartDrawer";
import GroceryFooter from "@/components/grocery/GroceryFooter";
import WhatsAppFloatingButton from "@/components/grocery/WhatsAppFloatingButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SuperBarrio | Fresh Farm Food Delivered in Minutes",
  description:
    "Order farm-fresh vegetables, organic fruits, daily dairy, bakery & kitchen essentials directly to your home.",
};

export default function GroceryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GroceryCartProvider>
      <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800 antialiased dark:bg-gray-950 dark:text-gray-100">
        <GroceryHeader />
        <main className="flex-1">{children}</main>
        <CartDrawer />
        <WhatsAppFloatingButton />
        <GroceryFooter />
      </div>
    </GroceryCartProvider>
  );
}
