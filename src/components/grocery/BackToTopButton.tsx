"use client";

import React, { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpIcon } from "@/icons";

/**
 * BackToTopButton — Ultra-Smooth Physics-Based Circular Scroll Progress.
 * Uses Framer Motion's useScroll + critically damped useSpring to turn
 * discrete mousewheel ticks into buttery 120 FPS continuous liquid motion.
 */
export const BackToTopButton: React.FC = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Hide on checkout & order-success to keep checkout funnel focused
  const isExcludedPage =
    pathname.includes("/checkout") || pathname.includes("/order-success");

  // 1. Hardware-accelerated native scroll tracking (0 layout reflows)
  const { scrollYProgress } = useScroll();

  // 2. Critically damped spring physics: eliminates wheel stutter and jerking
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    restDelta: 0.001,
  });

  // 3. Smart visibility threshold (shows after ~4% scroll down)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isExcludedPage) return;
    const nextVisible = latest > 0.035;
    if (nextVisible !== isVisible) {
      setIsVisible(nextVisible);
    }
  });

  if (isExcludedPage) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.8,
            y: shouldReduceMotion ? 0 : 16,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.8,
            y: shouldReduceMotion ? 0 : 16,
          }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
          onClick={scrollToTop}
          className="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom)+68px)] end-3.5 sm:end-6 md:bottom-24 md:end-8 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-emerald-700 shadow-xl dark:bg-[#071910] dark:text-emerald-400 dark:border dark:border-emerald-950/80 cursor-pointer select-none transition-shadow hover:shadow-2xl"
          aria-label="Volver arriba / Scroll back to top"
          title="Volver arriba"
        >
          {/* Circular SVG Progress Ring with explicit viewBox for pixel-perfect subpixel rendering */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90 transform"
            viewBox="0 0 48 48"
          >
            {/* Background Track Circle */}
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              className="text-gray-200/70 dark:text-emerald-950/70"
            />

            {/* Liquid Continuous Progress Circle driven by GPU pathLength */}
            <motion.circle
              cx="24"
              cy="24"
              r="18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="transparent"
              style={{
                pathLength: smoothProgress,
              }}
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
