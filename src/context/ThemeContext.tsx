"use client";

import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type ThemeMode = "light" | "dark" | "auto";
type ResolvedTheme = "light" | "dark";

type ThemeContextType = {
  theme: ResolvedTheme; // Resolved theme actually active ("light" or "dark")
  themeMode: ThemeMode; // The configured preference ("light", "dark", or "auto")
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [theme, setTheme] = useState<ResolvedTheme>("light");
  const [isInitialized, setIsInitialized] = useState(false);
  const isFirstRender = useRef(true);

  const applyTheme = (targetTheme: ResolvedTheme) => {
    localStorage.setItem("theme", targetTheme);
    document.cookie = `theme=${targetTheme};path=/;max-age=31536000;SameSite=Lax`;
    if (targetTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-color-scheme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-color-scheme", "light");
    }
  };

  // 1. Initial mount: read saved theme and resolve immediately without flash
  useEffect(() => {
    const savedMode = (localStorage.getItem("theme-mode") || localStorage.getItem("theme")) as ThemeMode | null;
    const isDocDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialMode: ThemeMode = savedMode || (isDocDark ? "dark" : "light");
    let resolved: ResolvedTheme = "light";
    if (initialMode === "auto") {
      resolved = prefersDark ? "dark" : "light";
    } else {
      resolved = initialMode === "dark" ? "dark" : "light";
    }

    setThemeModeState(initialMode);
    setTheme(resolved);
    setIsInitialized(true);

    // Sync classes directly without triggering transitions on mount
    applyTheme(resolved);
  }, []);

  // 2. Listen to auto theme media query changes if mode === "auto"
  useEffect(() => {
    if (!isInitialized || themeMode !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = mediaQuery.matches ? "dark" : "light";
      setTheme(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, isInitialized]);

  // 3. User toggle transition effect (only after initial mount)
  useEffect(() => {
    if (!isInitialized) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    localStorage.setItem("theme-mode", themeMode);

    if (typeof window === "undefined" || typeof document === "undefined") {
      applyTheme(theme);
      return;
    }

    const doc = document;
    // Modern Chrome / Edge GPU-accelerated View Transitions API
    if (Boolean((doc as any).startViewTransition)) {
      (doc as any).startViewTransition(() => {
        applyTheme(theme);
      });
      return;
    }

    // Fallback: CSS transition with forced reflow
    doc.documentElement.classList.add("theme-transition");
    void doc.documentElement.offsetHeight;
    applyTheme(theme);

    const timer = setTimeout(() => {
      doc.documentElement.classList.remove("theme-transition");
    }, 450);

    return () => clearTimeout(timer);
  }, [theme, isInitialized]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (mode === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } else {
      setTheme(mode as ResolvedTheme);
    }
  };

  const toggleTheme = () => {
    const nextTheme: ResolvedTheme = theme === "light" ? "dark" : "light";
    setThemeModeState(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, themeMode, setThemeMode, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
