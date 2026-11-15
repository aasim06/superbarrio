"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpIcon } from "@/icons";

export const BackToTopButton: React.FC = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const progressRef = useRef(0);
  const circleRef = useRef<SVGCircleElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  // Hide on checkout & order-success to keep checkout funnel 100% focused
  const isExcludedPage =
    pathname.includes("/checkout") || pathname.includes("/order-success");

  useEffect(() => {
    if (isExcludedPage) return;

    let rafId: number | null = null;

    const updateProgress = (currentScrollY?: number) => {
      const scrollY =
        typeof currentScrollY === "number" ? currentScrollY : window.scrollY;
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        totalHeight > 0
          ? Math.min(100, Math.max(0, (scrollY / totalHeight) * 100))
          : 0;

      progressRef.current = progress;

      // Direct DOM update: 0ms latency, zero CSS delay, 60/120 FPS real-time response
      if (circleRef.current) {
        const offset = circumference - (progress / 100) * circumference;
        circleRef.current.style.strokeDashoffset = `${offset}`;
      }

      // Only trigger React state re-render when visibility threshold (300px) changes
      const nextVisible = scrollY > 300;
      if (nextVisible !== isVisibleRef.current) {
        isVisibleRef.current = nextVisible;
        setIsVisible(nextVisible);
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updateProgress();
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Initial check
    updateProgress();

    // Hook into Lenis smooth-scroll instance for instant frame-by-frame progress
    const checkLenis = () => {
      const lenis = (window as unknown as { __lenis?: { on?: (event: string, cb: (e: { scroll?: number }) => void) => void; off?: (event: string, cb: (e: { scroll?: number }) => void) => void; scrollTo?: (pos: number, opts: { duration: number }) => void } }).__lenis;
      if (lenis && typeof lenis.on === "function") {
        const lenisHandler = (e: { scroll?: number }) => {
          updateProgress(e?.scroll);
        };
        lenis.on("scroll", lenisHandler);
        return () => {
          if (lenis && typeof lenis.off === "function") {
            lenis.off("scroll", lenisHandler);
          }
        };
      }
      return null;
    };

    let cleanupLenis = checkLenis();
    let retryTimer: NodeJS.Timeout | null = null;

    if (!cleanupLenis) {
      retryTimer = setTimeout(() => {
        cleanupLenis = checkLenis();
      }, 150);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (retryTimer) clearTimeout(retryTimer);
      if (cleanupLenis) cleanupLenis();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isExcludedPage, circumference]);

  if (isExcludedPage) {
    return null;
  }

  const scrollToTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo?: (pos: number, opts: { duration: number }) => void } }).__lenis;
    if (lenis && typeof lenis.scrollTo === "function" && !shouldReduceMotion) {
      lenis.scrollTo(0, { duration: 1.0 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    }
  };

  const initialOffset = circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.8,
            y: shouldReduceMotion ? 0 : 20,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.8,
            y: shouldReduceMotion ? 0 : 20,
          }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-36 start-4 sm:bottom-24 sm:start-8 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-700 shadow-xl transition-shadow dark:bg-[#071910] dark:text-emerald-400 dark:border dark:border-emerald-950/80 cursor-pointer"
          aria-label="Volver arriba / Scroll back to top"
          title="Volver arriba"
        >
          {/* SVG Circular Progress Ring */}
          <svg className="pointer-events-none absolute inset-0 h-12 w-12 -rotate-90 transform">
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              className="text-gray-200/60 dark:text-emerald-950/60"
            />
            {/* Real-time progress circle: NO transition classes so it moves synchronously with scroll */}
            <circle
              ref={circleRef}
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={initialOffset}
              strokeLinecap="round"
              className="text-emerald-500"
            />
          </svg>

          {/* Up Arrow Icon */}
          <ArrowUpIcon className="h-4 w-4 relative z-10 font-bold" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTopButton;
