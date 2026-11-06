"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Particle {
  id: number;
  emoji: string;
  top: string;
  left?: string;
  right?: string;
  duration: number;
  delay: number;
  size: string;
}

const PARTICLES: Particle[] = [
  { id: 1, emoji: "🍃", top: "12%", left: "6%", duration: 5.5, delay: 0, size: "text-2xl" },
  { id: 2, emoji: "🌿", top: "25%", right: "8%", duration: 6.8, delay: 0.5, size: "text-xl" },
  { id: 3, emoji: "🍋", top: "68%", left: "8%", duration: 7.2, delay: 1, size: "text-lg" },
  { id: 4, emoji: "🥑", top: "75%", right: "12%", duration: 6.2, delay: 1.5, size: "text-xl" },
  { id: 5, emoji: "✨", top: "18%", left: "45%", duration: 4.8, delay: 0.8, size: "text-base" },
  { id: 6, emoji: "🍓", top: "82%", left: "38%", duration: 8.0, delay: 2, size: "text-base" },
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
          initial={{ opacity: 0.25 }}
          animate={
            shouldReduceMotion
              ? { opacity: 0.25 }
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
          className={`absolute ${p.size} filter drop-shadow-md`}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingParticles;
