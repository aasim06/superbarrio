import React from "react";
import { GroceryCartProvider } from "@/context/GroceryCartContext";
import GroceryHeader from "@/components/grocery/GroceryHeader";
import CartDrawer from "@/components/grocery/CartDrawer";
import GroceryFooter from "@/components/grocery/GroceryFooter";
import WhatsAppFloatingButton from "@/components/grocery/WhatsAppFloatingButton";
import FlyingCartOverlay from "@/components/grocery/FlyingCartOverlay";
import SmoothScrollProvider from "@/components/grocery/SmoothScrollProvider";
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
    <SmoothScrollProvider>
      <GroceryCartProvider>
        <div className="flex min-h-screen flex-col bg-[#f8faf9] text-gray-800 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300 dark:bg-[#04130b] dark:text-gray-100">
          <GroceryHeader />
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <WhatsAppFloatingButton />
          <FlyingCartOverlay />
          <GroceryFooter />
        </div>
      </GroceryCartProvider>
    </SmoothScrollProvider>
  );
}
