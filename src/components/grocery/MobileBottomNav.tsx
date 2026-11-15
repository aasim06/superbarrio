"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { HomeIcon, SearchIcon, StoreIcon, CartIcon } from "@/icons";
import { Package, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/utils/currency";
import { triggerHaptic } from "@/utils/haptics";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const isEs = locale === "es";
  const t = useTranslations("grocery");
  const { totalItems, total, setIsCartOpen } = useGroceryCart();
  const { user, setIsAuthModalOpen } = useCustomerAuth();

  type TabType = "home" | "categories" | "search" | "orders" | "account";
  const [activeTab, setActiveTab] = useState<TabType>("home");

  // Sync active tab with current URL route
  useEffect(() => {
    if (pathname.includes("/orders")) {
      setActiveTab("orders");
    } else if (pathname.includes("/profile")) {
      setActiveTab("account");
    } else if (pathname.includes("/grocery")) {
      if (window.scrollY < 200) {
        setActiveTab("home");
      }
    }
  }, [pathname]);

  // Track scroll position to auto-highlight "home" vs "categories"
  useEffect(() => {
    if (pathname.includes("/orders") || pathname.includes("/profile")) return;

    const handleScroll = () => {
      const catEl = document.getElementById("category-bar-section");
      if (catEl) {
        const rect = catEl.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 0) {
          setActiveTab("categories");
          return;
        }
      }
      if (window.scrollY < 200) {
        setActiveTab("home");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Hide on checkout or order-success screens
  if (pathname.includes("/checkout") || pathname.includes("/order-success")) {
    return null;
  }

  const handleHome = () => {
    triggerHaptic("selection");
    setActiveTab("home");
    if (pathname === "/grocery") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/grocery");
    }
  };

  const handleCategories = () => {
    triggerHaptic("selection");
    setActiveTab("categories");
    if (pathname !== "/grocery") {
      router.push("/grocery");
      setTimeout(() => {
        const el = document.getElementById("category-bar-section");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } else {
      const el = document.getElementById("category-bar-section");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearch = () => {
    triggerHaptic("selection");
    setActiveTab("search");
    if (pathname !== "/grocery") {
      router.push("/grocery");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const searchInputs = document.querySelectorAll<HTMLInputElement>(
        'header input[type="text"]',
      );
      if (searchInputs.length > 0) {
        const mobileInput = searchInputs[searchInputs.length - 1];
        mobileInput?.focus();
      }
    }, 250);
  };

  const handleOrders = () => {
    triggerHaptic("selection");
    setActiveTab("orders");
    router.push("/grocery/orders");
  };

  const handleAccount = () => {
    triggerHaptic("selection");
    setActiveTab("account");
    if (user) {
      router.push("/grocery/profile");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      {/* 🟢 Android Floating Cart Snack-Bar (Floats smoothly above the Bottom Nav) */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="fixed bottom-[calc(62px+env(safe-area-inset-bottom,0px))] inset-x-3 z-40 md:hidden"
          >
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setIsCartOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 px-4 py-2.5 text-white shadow-[0_10px_25px_-4px_rgba(5,150,105,0.5)] ring-1 ring-white/20 active:scale-[0.98] transition-transform select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-xs font-black">
                  <CartIcon className="h-4 w-4" />
                  <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-gray-900 shadow-xs">
                    {totalItems}
                  </span>
                </div>
                <div className="text-start">
                  <p className="text-xs font-black leading-tight">
                    {totalItems} {totalItems === 1 ? (isEs ? "artículo" : "item") : (isEs ? "artículos" : "items")} • {formatPrice(total, locale)}
                  </p>
                  <p className="text-[10px] text-emerald-100/90 font-semibold leading-none flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 animate-ping" />
                    {isEs ? "Reparto Exprés 25 Min" : "25-Min Express Delivery"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-black tracking-tight backdrop-blur-sm">
                <span>{isEs ? "Ver Cesta" : "View Cart"}</span>
                <span className="text-[11px]">➔</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 5-Tab Native Android Bottom Navigation Bar */}
      <nav
        aria-label="Barra de navegación móvil"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200/80 bg-white/95 px-2 pt-1.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-emerald-950/70 dark:bg-[#071910]/95"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Tab 1: Home / Inicio */}
          <motion.button
            type="button"
            onClick={handleHome}
            whileTap={{ scale: 0.9 }}
            className={`relative flex min-h-[46px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1 transition-colors select-none ${
              activeTab === "home"
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
            }`}
          >
            {activeTab === "home" && (
              <motion.div
                layoutId="mobileNavActivePill"
                className="absolute inset-0 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <HomeIcon className="relative z-10 h-5 w-5 stroke-[2]" />
            <span className="relative z-10 text-[10px] tracking-tight">{isEs ? "Inicio" : "Home"}</span>
          </motion.button>

          {/* Tab 2: Catálogo / Categorías */}
          <motion.button
            type="button"
            onClick={handleCategories}
            whileTap={{ scale: 0.9 }}
            className={`relative flex min-h-[46px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1 transition-colors select-none ${
              activeTab === "categories"
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
            }`}
          >
            {activeTab === "categories" && (
              <motion.div
                layoutId="mobileNavActivePill"
                className="absolute inset-0 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <StoreIcon className="relative z-10 h-5 w-5 stroke-[2]" />
            <span className="relative z-10 text-[10px] tracking-tight">{isEs ? "Catálogo" : "Catalog"}</span>
          </motion.button>

          {/* Tab 3: Buscar / Search */}
          <motion.button
            type="button"
            onClick={handleSearch}
            whileTap={{ scale: 0.9 }}
            className={`relative flex min-h-[46px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1 transition-colors select-none ${
              activeTab === "search"
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
            }`}
          >
            {activeTab === "search" && (
              <motion.div
                layoutId="mobileNavActivePill"
                className="absolute inset-0 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <SearchIcon className="relative z-10 h-5 w-5 stroke-[2]" />
            <span className="relative z-10 text-[10px] tracking-tight">{isEs ? "Buscar" : "Search"}</span>
          </motion.button>

          {/* Tab 4: Mis Pedidos / Orders */}
          <motion.button
            type="button"
            onClick={handleOrders}
            whileTap={{ scale: 0.9 }}
            className={`relative flex min-h-[46px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1 transition-colors select-none ${
              activeTab === "orders"
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
            }`}
          >
            {activeTab === "orders" && (
              <motion.div
                layoutId="mobileNavActivePill"
                className="absolute inset-0 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <Package className="relative z-10 h-5 w-5 stroke-[2]" />
            <span className="relative z-10 text-[10px] tracking-tight">{isEs ? "Pedidos" : "Orders"}</span>
          </motion.button>

          {/* Tab 5: Mi Cuenta / Perfil */}
          <motion.button
            type="button"
            onClick={handleAccount}
            whileTap={{ scale: 0.9 }}
            className={`relative flex min-h-[46px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1 transition-colors select-none ${
              activeTab === "account"
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
            }`}
          >
            {activeTab === "account" && (
              <motion.div
                layoutId="mobileNavActivePill"
                className="absolute inset-0 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <div className="relative z-10">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-emerald-500"
                />
              ) : (
                <User className="h-5 w-5 stroke-[2]" />
              )}
            </div>
            <span className="relative z-10 text-[10px] tracking-tight">{isEs ? "Cuenta" : "Account"}</span>
          </motion.button>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
