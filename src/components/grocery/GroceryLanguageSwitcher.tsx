"use client";

import React, { useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { languages, getLanguage } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";
import { useClickOutside } from "@/hooks/useClickOutside";

export const GroceryLanguageSwitcher: React.FC = () => {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const currentLang = getLanguage(locale);
  const CurrentFlag = currentLang.FlagIcon;

  const handleSelect = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
        title="Cambiar idioma / Change language"
        aria-label="Change language"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full">
          <CurrentFlag className="h-full w-full object-cover" />
        </span>
        <span className="uppercase">{currentLang.id}</span>
        <span className="text-[10px] text-gray-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-1.5 z-50 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-850">
          {languages.map((lang) => {
            const isSelected = locale === lang.id;
            const Flag = lang.FlagIcon;
            return (
              <button
                key={lang.id}
                onClick={() => handleSelect(lang.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                  isSelected
                    ? "bg-brand-50 text-brand-600 font-bold dark:bg-brand-950/40 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full">
                  <Flag className="h-full w-full object-cover" />
                </span>
                <span>{lang.name}</span>
                {isSelected && <span className="ms-auto text-xs text-brand-500">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroceryLanguageSwitcher;

