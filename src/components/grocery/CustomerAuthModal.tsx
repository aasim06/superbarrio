"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { X, Sparkles, ShoppingBag, ShieldCheck, ArrowRight, Mail, User as UserIcon } from "lucide-react";

export const CustomerAuthModal: React.FC = () => {
  const { isAuthModalOpen, dismissModal, loginWithGoogle, loginWithEmail, isLoading } =
    useCustomerAuth();

  const [mode, setMode] = useState<"main" | "manual">("main");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isAuthModalOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    loginWithEmail(name, email);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissModal}
          className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog Card / Mobile Bottom Sheet */}
        <motion.div
          initial={isMobile ? { y: "100%", opacity: 0 } : { opacity: 0, scale: 0.92, y: 24 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { y: "100%", opacity: 0 } : { opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", damping: 28, stiffness: 380 }}
          className="relative w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-3xl bg-white shadow-2xl border border-gray-100 dark:border-emerald-950/80 dark:bg-[#071910] text-gray-900 dark:text-white max-h-[92vh] overflow-y-auto"
        >
          {/* Top Decorative Banner */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 px-6 pt-3 sm:pt-7 pb-6 text-white text-center">
            {/* Native Mobile Drag Handle */}
            <div className="sm:hidden flex justify-center pb-2.5">
              <div className="h-1.5 w-12 rounded-full bg-white/40" />
            </div>

            {/* Close Button */}
            <button
              onClick={dismissModal}
              aria-label="Close"
              className="absolute top-4 right-4 rounded-full bg-black/20 p-1.5 text-white/80 hover:bg-black/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Glowing Icon */}
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-inner ring-4 ring-white/20">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>

            <h3 className="text-xl font-extrabold tracking-tight">Welcome to SuperBarrio</h3>
            <p className="mt-1 text-xs text-emerald-100 font-medium">
              Fresh farm groceries delivered to your door in 20 minutes
            </p>

            {/* Promo Pill */}
            <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-amber-400/25 px-3 py-1 text-[11px] font-bold text-amber-200 border border-amber-300/30">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>Get 20% OFF your first order upon login!</span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {/* View 1: Main View (Google 1-Click) */}
            {mode === "main" && (
              <div className="space-y-4">
                {/* Real Google OAuth Sign In */}
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-800 shadow-md transition-all duration-200 hover:border-emerald-500 hover:bg-gray-50 hover:shadow-lg active:scale-[0.98] dark:border-emerald-900 dark:bg-gray-900/90 dark:text-white dark:hover:border-emerald-500 cursor-pointer"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.07.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.39 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="w-full border-t border-gray-200 dark:border-emerald-950/80" />
                  <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:bg-[#071910] dark:text-gray-500">
                    or
                  </span>
                </div>

                {/* Switch to email entry */}
                <button
                  type="button"
                  onClick={() => setMode("manual")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70 cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>Enter email address manually</span>
                </button>
              </div>
            )}

            {/* View 2: Manual Email Form */}
            {mode === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Your Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Asif Ameer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-900/60 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. asim@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-900/60 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMode("main")}
                    className="w-1/3 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:border-emerald-950 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Trust and Dismiss */}
            <div className="mt-5 border-t border-gray-100 pt-3.5 text-center dark:border-emerald-950/60">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Your details are 100% secure with SuperBarrio</span>
              </div>
              <button
                type="button"
                onClick={dismissModal}
                className="mt-2.5 text-[11px] font-semibold text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Skip for now & browse groceries
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerAuthModal;
