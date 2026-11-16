"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import WhatsAppFloatingButton from "@/components/grocery/WhatsAppFloatingButton";
import BackToTopButton from "@/components/grocery/BackToTopButton";
import MobileBottomNav from "@/components/grocery/MobileBottomNav";
import FlyingCartOverlay from "@/components/grocery/FlyingCartOverlay";

// Code-split heavy modals & overlays to keep initial bundle size tiny and fast
const CartDrawer = dynamic(() => import("@/components/grocery/CartDrawer"), {
  ssr: false,
});
const QuickViewModal = dynamic(
  () => import("@/components/grocery/QuickViewModal"),
  { ssr: false },
);
const GroceryAIVoiceBot = dynamic(
  () => import("@/components/grocery/GroceryAIVoiceBot"),
  { ssr: false },
);
const CustomerAuthModal = dynamic(
  () => import("@/components/grocery/CustomerAuthModal"),
  { ssr: false },
);
const CookieConsentBanner = dynamic(
  () => import("@/components/grocery/CookieConsentBanner"),
  { ssr: false },
);

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
      <CookieConsentBanner />
    </>
  );
}
