"use client";

import React, { useRef, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { languages, getLanguage } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";
import { useClickOutside } from "@/hooks/useClickOutside";
import { AnimatePresence, motion } from "framer-motion";

export const GroceryLanguageSwitcher: React.FC = () => {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const currentLang = getLanguage(locale);
  const CurrentFlag = currentLang.FlagIcon;

  const [isPending, startTransition] = useTransition();

  const handleSelect = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }
    const currentScrollY = typeof window !== "undefined" ? window.scrollY : 0;

    // Set cookie for persistence across sessions
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    setIsOpen(false);

    // Smooth SPA transition without full browser reload and WITHOUT scrolling to top
    startTransition(() => {
      router.replace(pathname, { locale: newLocale, scroll: false });
      router.refresh();
    });

    if (currentScrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: currentScrollY, behavior: "instant" });
      });
      setTimeout(() => {
        window.scrollTo({ top: currentScrollY, behavior: "instant" });
      }, 50);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 sm:h-11 items-center gap-2 rounded-xl sm:rounded-2xl border border-gray-200/90 bg-white/90 px-3 py-2 text-xs font-bold text-gray-700 shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:text-emerald-700 active:scale-95 dark:border-emerald-700/60 dark:bg-[#05130b]/90 dark:text-emerald-200 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/60"
        title="Cambiar idioma / Change language"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-emerald-500/30">
          <CurrentFlag className="h-full w-full object-cover" />
        </span>
        <span className="font-extrabold uppercase tracking-wide">{currentLang.id}</span>
        <span
          className={`text-[10px] text-gray-400 transition-transform duration-200 dark:text-emerald-400/80 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute end-0 top-full mt-2 z-50 w-44 overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl transition-colors duration-200 dark:border-emerald-700/60 dark:bg-[#071910]/95 dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
          >
            {languages.map((lang) => {
              const isSelected = locale === lang.id;
              const Flag = lang.FlagIcon;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleSelect(lang.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-900/40 dark:text-emerald-200 dark:border dark:border-emerald-600/40"
                      : "text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200"
                  }`}
                >
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/10 dark:ring-white/10 shadow-xs">
                    <Flag className="h-full w-full object-cover" />
                  </span>
                  <span className="truncate">{lang.name}</span>
                  {isSelected && (
                    <span className="ms-auto flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs dark:bg-emerald-500">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroceryLanguageSwitcher;

