"use client";

import React, { useEffect } from "react";

/**
 * SmoothScrollProvider — Native GPU-Accelerated 120Hz Responsive Scrolling.
 * Replaces heavy virtual wheel hijacking with fluid, zero-lag browser scrolling.
 */
export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    // Provide lightweight, native programmatic scrollTo without wheel hijacking
    if (typeof window !== "undefined") {
      (window as any).__lenis = {
        scrollTo: (
          pos: number | HTMLElement,
          opts?: { duration?: number; offset?: number },
        ) => {
          if (typeof pos === "number") {
            window.scrollTo({
              top: Math.max(0, pos + (opts?.offset || 0)),
              behavior: "smooth",
            });
          } else if (pos && typeof (pos as HTMLElement).scrollIntoView === "function") {
            (pos as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
          }
        },
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        (window as any).__lenis = null;
      }
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;

