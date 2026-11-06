"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { LeafIcon } from "@/icons";

export const FlyingCartOverlay: React.FC = () => {
  const { flyingItems, onFlyingItemComplete } = useGroceryCart();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      <AnimatePresence>
        {flyingItems.map((item) => {
          // Mid-point curve for natural parabolic throw
          const midX = (item.startX + item.endX) / 2;
          const midY = Math.min(item.startY, item.endY) - 100;

          return (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX,
                y: item.startY,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: [item.startX, midX, item.endX],
                y: [item.startY, midY, item.endY],
                scale: [1, 0.8, 0.2],
                opacity: [1, 0.95, 0.2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 0.75,
                ease: [0.2, 0.8, 0.2, 1],
                times: [0, 0.5, 1],
              }}
              onAnimationComplete={() => onFlyingItemComplete(item.id)}
              className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-emerald-400 bg-white shadow-2xl dark:bg-gray-800"
              style={{
                boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.6)",
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt="flying product"
                  className="h-full w-full object-cover"
                />
              ) : (
                <LeafIcon className="h-7 w-7 text-emerald-500" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FlyingCartOverlay;

