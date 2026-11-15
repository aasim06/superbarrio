"use client";

import React, { useState, useEffect } from "react";
import CartDrawer from "@/components/grocery/CartDrawer";
import QuickViewModal from "@/components/grocery/QuickViewModal";
import WhatsAppFloatingButton from "@/components/grocery/WhatsAppFloatingButton";
import GroceryAIVoiceBot from "@/components/grocery/GroceryAIVoiceBot";
import BackToTopButton from "@/components/grocery/BackToTopButton";
import MobileBottomNav from "@/components/grocery/MobileBottomNav";
import FlyingCartOverlay from "@/components/grocery/FlyingCartOverlay";
import CustomerAuthModal from "@/components/grocery/CustomerAuthModal";

/**
 * GroceryOverlays — Client-side only overlay manager.
 * Mounts after client hydration to guarantee 100% zero hydration mismatch.
 */
export default function GroceryOverlays() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <CartDrawer />
      <QuickViewModal />
      <WhatsAppFloatingButton />
      <GroceryAIVoiceBot />
      <BackToTopButton />
      <MobileBottomNav />
      <FlyingCartOverlay />
      <CustomerAuthModal />
    </>
  );
}
