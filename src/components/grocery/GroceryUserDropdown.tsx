"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  ShoppingBag,
  LogIn,
  LogOut,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface GroceryUserDropdownProps {
  className?: string;
}

export const GroceryUserDropdown: React.FC<GroceryUserDropdownProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, setIsAuthModalOpen } = useCustomerAuth();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  const displayName = user?.displayName || "Guest Customer";
  const userEmail = user?.email || "Click below to sign in";
  const userPoints = user?.points ?? (user ? 250 : 0);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={toggleDropdown}
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
        className="group relative flex items-center gap-1.5 rounded-full p-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
      >
        {/* Avatar Wrapper with External Online Badge */}
        <div className="relative">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-2 ring-emerald-500/40 transition-all duration-300 group-hover:ring-emerald-500 group-hover:scale-105 shadow-sm bg-gray-100 dark:bg-emerald-950">
            {user && user.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=10b981&color=fff&bold=true`;
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
          </div>

          {/* Active online green dot placed outside on the bottom-right rim */}
          {user && (
            <span
              className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#071910] shadow-sm pointer-events-none"
              title="Online"
            />
          )}
        </div>

        <ChevronDown
          className={`hidden sm:block h-3.5 w-3.5 text-gray-500 transition-transform duration-200 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 rtl:right-auto rtl:left-0 mt-2.5 w-68 origin-top-right rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-2xl backdrop-blur-xl transition-all duration-200 dark:border-emerald-950/70 dark:bg-[#071910]/95 z-50"
          >
            {/* Header info */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-50/80 to-green-50/40 p-3 dark:from-emerald-950/40 dark:to-green-950/20 border border-emerald-100/60 dark:border-emerald-900/40">
              <div className="flex items-center gap-2.5">
                <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-emerald-500/40 shrink-0 bg-gray-200 dark:bg-emerald-950">
                  {user && user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          displayName
                        )}&background=10b981&color=fff&bold=true`;
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] text-gray-500 dark:text-emerald-300/70">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Loyalty Club Badge */}
              <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-600/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  {user ? "VIP Customer" : "Guest Pass"}
                </span>
                <span className="font-extrabold">{userPoints} Pts</span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="mt-2 space-y-1">
              <Link
                href="/grocery/orders"
                onClick={closeDropdown}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>My Orders (Mis Pedidos)</span>
              </Link>

              <Link
                href="/grocery/profile"
                onClick={closeDropdown}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
              >
                <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Profile & Addresses</span>
              </Link>
            </div>

            {/* Divider & Auth Link */}
            <div className="my-1 border-t border-gray-100 dark:border-emerald-950/60" />

            <div className="space-y-1">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    logout();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    setIsAuthModalOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors dark:text-emerald-400 dark:hover:bg-emerald-950/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <LogIn className="h-4 w-4" />
                    Sign In with Google
                  </span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    20% OFF
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroceryUserDropdown;
