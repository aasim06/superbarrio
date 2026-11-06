"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LeafIcon, FruitIcon, ShootingStarIcon } from "@/icons";

interface Particle {
  id: number;
  type: "leaf" | "fruit" | "star";
  top: string;
  left?: string;
  right?: string;
  duration: number;
  delay: number;
  sizeClass: string;
  colorClass: string;
}

const PARTICLES: Particle[] = [
  { id: 1, type: "leaf", top: "12%", left: "6%", duration: 5.5, delay: 0, sizeClass: "h-7 w-7", colorClass: "text-emerald-500/35 dark:text-emerald-400/25" },
  { id: 2, type: "leaf", top: "25%", right: "8%", duration: 6.8, delay: 0.5, sizeClass: "h-6 w-6", colorClass: "text-green-600/30 dark:text-green-400/20" },
  { id: 3, type: "fruit", top: "68%", left: "8%", duration: 7.2, delay: 1, sizeClass: "h-6 w-6", colorClass: "text-amber-500/35 dark:text-amber-400/25" },
  { id: 4, type: "fruit", top: "75%", right: "12%", duration: 6.2, delay: 1.5, sizeClass: "h-7 w-7", colorClass: "text-emerald-600/30 dark:text-emerald-300/20" },
  { id: 5, type: "star", top: "18%", left: "45%", duration: 4.8, delay: 0.8, sizeClass: "h-5 w-5", colorClass: "text-amber-400/40 dark:text-amber-300/30" },
  { id: 6, type: "fruit", top: "82%", left: "38%", duration: 8.0, delay: 2, sizeClass: "h-5 w-5", colorClass: "text-rose-400/35 dark:text-rose-400/25" },
];

export const FloatingParticles: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none"
    >
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0.2 }}
          animate={
            shouldReduceMotion
              ? { opacity: 0.2 }
              : {
                  y: [0, -18, 0],
                  x: [0, 8, -8, 0],
                  rotate: [0, 15, -10, 0],
                  opacity: [0.2, 0.45, 0.2],
                }
          }
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
          className={`absolute ${p.colorClass} filter drop-shadow-xs`}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
          }}
        >
          {p.type === "leaf" && <LeafIcon className={p.sizeClass} />}
          {p.type === "fruit" && <FruitIcon className={p.sizeClass} />}
          {p.type === "star" && <ShootingStarIcon className={p.sizeClass} />}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingParticles;
