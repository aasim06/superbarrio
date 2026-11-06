"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { BoltIcon, LeafIcon, RefreshIcon, ShieldCheckIcon } from "@/icons";

export const GroceryFooter: React.FC = () => {
  const t = useTranslations("grocery");

  const perks = [
    {
      icon: <LeafIcon className="h-6 w-6 text-brand-500" />,
      title: t("perks.fresh"),
      desc: t("perks.freshDesc"),
    },
    {
      icon: <BoltIcon className="h-6 w-6 text-orange-500" />,
      title: t("perks.speed"),
      desc: t("perks.speedDesc"),
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6 text-emerald-500" />,
      title: t("perks.hygiene"),
      desc: t("perks.hygieneDesc"),
    },
    {
      icon: <RefreshIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />,
      title: t("perks.replacement"),
      desc: t("perks.replacementDesc"),
    },
  ];

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Perks Grid */}
      <div className="mx-auto w-full max-w-[1920px] border-b border-gray-100 px-4 py-10 sm:px-6 lg:px-8 xl:px-10 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 rounded-xl border border-gray-100 p-4 transition hover:border-brand-200 dark:border-gray-800 dark:hover:border-gray-700"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700/60">
                {p.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                  {p.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8 xl:px-10 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 dark:text-white">
            Super<span className="text-brand-500">Barrio</span>
          </span>
          <span>•</span>
          <span>{t("poweredBy")}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/grocery" className="hover:text-brand-500 transition">
            {t("storefront")}
          </Link>
          <Link href="/dashboard" className="hover:text-brand-500 transition">
            {t("adminDashboard")}
          </Link>
          <span className="text-gray-400">{t("cashOnDelivery")}</span>
        </div>
      </div>
    </footer>
  );
};

export default GroceryFooter;
