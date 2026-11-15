import React from "react";
import { GroceryCartProvider } from "@/context/GroceryCartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import GroceryHeader from "@/components/grocery/GroceryHeader";
import GroceryFooter from "@/components/grocery/GroceryFooter";
import SmoothScrollProvider from "@/components/grocery/SmoothScrollProvider";
// GroceryOverlays bundles all client-only floating UI (CartDrawer, QuickViewModal, etc.)
// loaded lazily after first paint — improves LCP and reduces initial JS payload.
import GroceryOverlays from "@/components/grocery/GroceryOverlays";
import { Toaster } from "sonner";
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
  return (
    <SmoothScrollProvider>
      <CustomerAuthProvider>
        <GroceryCartProvider>
          <div className="flex min-h-screen flex-col bg-[#f8faf9] text-gray-800 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300 dark:bg-[#04130b] dark:text-gray-100 pb-[calc(76px+env(safe-area-inset-bottom,0px))] md:pb-0">
            <GroceryHeader />
            <main className="flex-1">{children}</main>
            {/* All floating/overlay UI loaded lazily after initial paint */}
            <GroceryOverlays />
            <GroceryFooter />
            <Toaster richColors position="top-right" closeButton />
          </div>
        </GroceryCartProvider>
      </CustomerAuthProvider>
    </SmoothScrollProvider>
  );
}
