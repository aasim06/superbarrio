"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { BoltIcon, LeafIcon, RefreshIcon, ShieldCheckIcon } from "@/icons";
import { motion, useReducedMotion } from "framer-motion";

export const GroceryFooter: React.FC = () => {
  const t = useTranslations("grocery");
  const shouldReduceMotion = useReducedMotion();

  const perks = [
    {
      icon: <LeafIcon className="h-6 w-6 text-emerald-500" />,
      title: t("perks.fresh"),
      desc: t("perks.freshDesc"),
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      icon: <BoltIcon className="h-6 w-6 text-amber-500 fill-current" />,
      title: t("perks.speed"),
      desc: t("perks.speedDesc"),
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />,
      title: t("perks.hygiene"),
      desc: t("perks.hygieneDesc"),
      bg: "bg-green-50 dark:bg-green-950/50",
    },
    {
      icon: <RefreshIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      title: t("perks.replacement"),
      desc: t("perks.replacementDesc"),
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
  ];

  return (
    <footer className="mt-20 border-t border-gray-200/80 bg-white/95 pb-32 pt-2 backdrop-blur-sm dark:border-emerald-950/80 dark:bg-[#071910] sm:pb-20">
      {/* Perks Grid */}
      <div className="mx-auto w-full max-w-[1920px] border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8 xl:px-10 dark:border-emerald-950/60">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, idx) => (
            <motion.div
              key={idx}
              whileHover={shouldReduceMotion ? {} : { y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4.5 transition-all hover:border-emerald-200 hover:shadow-md dark:border-emerald-950/60 dark:bg-[#05130b] dark:hover:border-emerald-800"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs ${p.bg}`}
              >
                {p.icon}
              </div>
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-gray-900 dark:text-white">
                  {p.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Footer Links & Copyright with Safety Clearance Padding for Floating Buttons */}
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6 sm:ps-24 sm:pe-32 lg:px-8 lg:ps-28 lg:pe-36 xl:px-10 text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
        {/* Brand Logo & Copyright (Indented to never be covered by BackToTop) */}
        <div className="flex items-center gap-2">
          <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
            Super<span className="text-emerald-600 dark:text-emerald-400">Barrio</span>
          </span>
          <span>•</span>
          <span>{t("poweredBy")}</span>
        </div>

        {/* Links (Padded so Floating WhatsApp button never overlaps them) */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/grocery"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {t("storefront")}
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {t("adminDashboard")}
          </Link>
          <span className="text-gray-400 dark:text-emerald-400/50">
            {t("cashOnDelivery")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default GroceryFooter;
