"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheckIcon, StarIcon } from "@/icons";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  stars: number;
  favoriteItem: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Elena Vance",
    role: "Verified SuperBarrio Member",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    stars: 5,
    favoriteItem: "Artisan Sourdough & Farm Milk",
    quote:
      "SuperBarrio delivers my organic berries and warm sourdough in literally 18 minutes! The freshness is leagues ahead of standard supermarket shelves.",
  },
  {
    id: 2,
    name: "Marcus Sterling",
    role: "Culinary Enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    stars: 5,
    favoriteItem: "Extra Virgin Olive Oil & Eggs",
    quote:
      "The quality of the free-range farm eggs with golden yolks and cold-pressed olive oil is unbelievable. My morning breakfasts have completely transformed!",
  },
  {
    id: 3,
    name: "Sofia Rodriguez",
    role: "Weekly Household Shopper",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    stars: 5,
    favoriteItem: "Plantain Chips & Roasted Peanuts",
    quote:
      "The CrunchyBites Plantain Chips and spicy peanuts are deeply addictive snacks. Friendly delivery champions and zero delivery hassles every single time.",
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <div className="mt-16 w-full">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto pb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-black tracking-wider uppercase text-emerald-800 shadow-xs dark:bg-emerald-950/80 dark:text-emerald-300">
          ⭐ Real Customer Stories
        </span>
        <h3 className="mt-3 font-outfit text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Loved by 12,000+ Happy Kitchens
        </h3>
        <p className="mt-1 text-xs sm:text-sm font-medium text-gray-500 dark:text-emerald-300/70">
          Discover why neighborhood households trust SuperBarrio for daily groceries
        </p>
      </div>

      {/* Testimonials Cards: Swipeable carousel on mobile, 3-column grid on desktop */}
      <div className="flex overflow-x-auto gap-4 pb-3 no-scrollbar snap-x md:grid md:grid-cols-3 md:gap-6 md:pb-0">
        {TESTIMONIALS.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            whileHover={{ y: -6 }}
            className="w-[280px] sm:w-[320px] md:w-auto shrink-0 snap-center flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white/80 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all hover:border-emerald-300 hover:shadow-[0_16px_32px_-8px_rgba(22,163,74,0.18)] dark:border-emerald-950/60 dark:bg-[#071910]/70 dark:hover:border-emerald-800"
          >
            <div>
              {/* Star Rating & Verified Badge */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-1 text-amber-500 text-sm">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <StarIcon key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  <span>Verified Buyer</span>
                </span>
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            {/* Customer Profile & Favorite Item */}
            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-emerald-950/60">
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-11 w-11 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-outfit text-sm font-extrabold text-gray-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-emerald-400/60">
                    {item.role}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Favorite: {item.favoriteItem}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;

