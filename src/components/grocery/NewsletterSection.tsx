"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LeafIcon } from "@/icons";

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "🎉 Welcome to SuperBarrio! Check your email for your $10 welcome voucher.",
        { duration: 4000 },
      );
      setEmail("");
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55 }}
      className="mt-16 w-full"
    >
      {/* Animated Gradient Border Outer Wrapper */}
      <div className="relative overflow-hidden rounded-3xl p-[2px] bg-gradient-to-r from-emerald-500 via-amber-400 to-green-600 shadow-[0_12px_36px_-6px_rgba(22,163,74,0.3)]">
        <div className="relative rounded-[22px] bg-gradient-to-br from-[#062013] via-[#092d1c] to-[#04160d] p-8 sm:p-12 text-white">
          {/* Subtle Ambient Flares */}
          <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -start-20 -bottom-20 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            {/* Top Icon Badge */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30 mb-4">
              <LeafIcon className="h-6 w-6" />
            </div>

            <span className="text-xs font-black tracking-widest uppercase text-amber-300">
              Join The SuperBarrio Neighborhood
            </span>

            <h3 className="mt-2 font-outfit text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Get $10 Off Your First Farm-Fresh Order
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-lg">
              Subscribe to our weekly harvest newsletter for exclusive seasonal discounts, new farm arrivals, and chef recipes.
            </p>

            {/* Email Input Form with Focus Rings */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-emerald-200/50 backdrop-blur-md transition-all focus:border-amber-400 focus:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-3 text-xs sm:text-sm font-black text-gray-950 shadow-lg shadow-amber-400/30 transition-all hover:shadow-xl hover:shadow-amber-400/40 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                {isSubmitting ? "Subscribing..." : "Get My $10"}
              </motion.button>
            </form>

            <p className="mt-3 text-[11px] font-medium text-emerald-200/60">
              🔒 Zero spam. Unsubscribe anytime with 1 click.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsletterSection;
