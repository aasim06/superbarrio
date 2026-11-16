import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-200/90 bg-white/90 text-gray-600 shadow-xs backdrop-blur-sm transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 active:scale-90 dark:border-emerald-900/60 dark:bg-[#05130b]/90 dark:text-emerald-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/60"
      aria-label="Cambiar tema de color"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`absolute h-5 w-5 transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-amber-400"
              : "-rotate-90 scale-0 opacity-0 text-amber-500"
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`absolute h-5 w-5 transition-all duration-300 ${
            isDark
              ? "rotate-90 scale-0 opacity-0 text-slate-400"
              : "rotate-0 scale-100 opacity-100 text-slate-700"
          }`}
        />
      </div>
    </button>
  );
};
