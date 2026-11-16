import React from "react";
import { GroceryCartProvider } from "@/context/GroceryCartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import GroceryHeader from "@/components/grocery/GroceryHeader";
import GroceryFooter from "@/components/grocery/GroceryFooter";
import SmoothScrollProvider from "@/components/grocery/SmoothScrollProvider";
import GroceryOverlays from "@/components/grocery/GroceryOverlays";
import { Toaster } from "sonner";

export default function GroceryLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <CustomerAuthProvider>
        <GroceryCartProvider>
          <div className="flex min-h-screen flex-col bg-[#f8faf9] text-gray-800 antialiased selection:bg-emerald-500 selection:text-white dark:bg-[#04130b] dark:text-gray-100 pb-[calc(76px+env(safe-area-inset-bottom,0px))] md:pb-0">
            <GroceryHeader />
            <main className="flex-1">{children}</main>
            <GroceryOverlays />
            <GroceryFooter />
            <Toaster richColors position="top-right" closeButton />
          </div>
        </GroceryCartProvider>
      </CustomerAuthProvider>
    </SmoothScrollProvider>
  );
}
