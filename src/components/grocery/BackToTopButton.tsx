"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpIcon } from "@/icons";

export const BackToTopButton: React.FC = () => {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Hide on checkout & order-success to keep checkout funnel 100% focused
  if (pathname.includes("/checkout") || pathname.includes("/order-success")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, (window.scrollY / totalHeight) * 100);
        setScrollProgress(progress);
      }
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, y: shouldReduceMotion ? 0 : 20 }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-22 start-4 sm:bottom-8 sm:start-8 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-700 shadow-xl transition-shadow dark:bg-[#071910] dark:text-emerald-400 dark:border dark:border-emerald-950/80"
          aria-label="Volver arriba / Scroll back to top"
          title="Volver arriba"
        >
          {/* SVG Circular Progress Ring */}
          <svg className="absolute inset-0 h-12 w-12 -rotate-90 transform">
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              className="text-gray-200/60 dark:text-emerald-950/60"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-150"
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
