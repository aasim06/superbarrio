"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const MARQUEE_ITEMS = [
  { icon: "🌿", text: "100% Organic Produce" },
  { icon: "⚡", text: "15-25 Min Ultra-Fast Delivery" },
  { icon: "🚜", text: "Direct From Local Organic Farms" },
  { icon: "🛡️", text: "Grade-A Hygiene Certified" },
  { icon: "🥑", text: "100% Freshness Guarantee" },
  { icon: "🥖", text: "Daily Oven-Fresh Breads" },
  { icon: "🥛", text: "Pure Grass-Fed Dairy" },
  { icon: "🌶️", text: "Zero Artificial Preservatives" },
];

export const MarqueeStrip: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Duplicate items for continuous seamless loop
  const duplicated = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="relative w-full overflow-hidden border-y border-emerald-900/10 bg-gradient-to-r from-emerald-50/70 via-emerald-100/50 to-green-50/70 py-3 shadow-inner backdrop-blur-sm dark:border-emerald-950/60 dark:from-[#061d11]/80 dark:via-[#072416]/60 dark:to-[#05180e]/90 my-8">
      {/* Edge Gradient Fades for Depth */}
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-[#f8faf9] to-transparent dark:from-[#04130b]" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-[#f8faf9] to-transparent dark:from-[#04130b]" />

      <div className="flex w-max select-none">
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: ["0%", "-50%"],
                }
          }
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex shrink-0 items-center gap-8 pe-8 hover:[animation-play-state:paused]"
        >
          {duplicated.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold tracking-wide text-emerald-900 dark:text-emerald-200"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.text}</span>
              <span className="ms-6 text-emerald-400/40 dark:text-emerald-700">
                •
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MarqueeStrip;
