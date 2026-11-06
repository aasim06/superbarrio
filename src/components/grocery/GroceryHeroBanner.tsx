"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGroceryCart } from "@/context/GroceryCartContext";
import {
  AngleLeftIcon,
  AngleRightIcon,
  ArrowRightIcon,
  BoltIcon,
  LeafIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, AnimatePresence, useInView } from "framer-motion";
import FloatingParticles from "@/components/grocery/FloatingParticles";

interface ProductPouch {
  name: string;
  subname: string;
  tag: string;
  weight: string;
  color: string;
  bgGradient: string;
  imgUrl: string;
  accentBadge?: string;
  priceNum: number;
}

interface HeroSlide {
  id: string;
  category: string;
  kickerKey: string;
  title1Key: string;
  title2Key: string;
  title3Key: string;
  descKey: string;
  accentColor: string;
  doodleTextKey: string;
  pouches: [ProductPouch, ProductPouch, ProductPouch];
}

// Magnetic Button with spring physics for "Shop Now"
const MagneticButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  accentColor: string;
}> = ({ children, onClick, accentColor }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (clientX - centerX) * 0.28;
    const deltaY = (clientY - centerY) * 0.28;
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 220, damping: 16, mass: 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group/btn relative inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm sm:text-base font-black text-white shadow-xl transition-shadow duration-300"
      style={{
        backgroundColor: accentColor,
        boxShadow: `0 14px 34px ${accentColor}55`,
      }}
    >
      {children}
    </motion.button>
  );
};

// Animated Counter component that animates smoothly when scrolled into view
const AnimatedCounter: React.FC<{
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}> = ({
  from = 0,
  to,
  duration = 2,
  decimals = 0,
  suffix = "",
  prefix = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const updateCounter = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(to);
      }
    };

    animationFrame = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, from, to, duration]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.floor(displayValue).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export const GroceryHeroBanner: React.FC = () => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const { setActiveCategory } = useGroceryCart();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides: HeroSlide[] = [
    // Slide 1: Iconic Snacks & Munchies Theme
    {
      id: "snacks-theme",
      category: "snacks",
      kickerKey: "kickerSnacks",
      title1Key: "titleSnacks1",
      title2Key: "titleSnacks2",
      title3Key: "titleSnacks3",
      descKey: "descSnacks",
      accentColor: "#ea384c", // Warm coral red
      doodleTextKey: "handwrittenNote",
      pouches: [
        {
          name: "Plantain Chips",
          subname: "Lightly Salted",
          tag: "Real Plantain • No Preservatives",
          weight: "100g",
          color: "#166534",
          bgGradient: "from-[#15803d] to-[#14532d]",
          imgUrl:
            "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&auto=format&fit=crop&q=80",
          priceNum: 2.8,
        },
        {
          name: "Spicy Roasted Peanuts",
          subname: "High Protein",
          tag: "Real Nuts • No Artificial Flavours",
          weight: "100g",
          color: "#dc2626",
          bgGradient: "from-[#ef4444] to-[#b91c1c]",
          imgUrl:
            "https://images.unsplash.com/photo-1569460275917-763435165c01?w=400&auto=format&fit=crop&q=80",
          accentBadge: "🌶️ Mild Chili",
          priceNum: 2.2,
        },
        {
          name: "Mixed Nuts",
          subname: "Almonds & Cashews",
          tag: "Whole Roasted • Sea Salted",
          weight: "100g",
          color: "#ca8a04",
          bgGradient: "from-[#eab308] to-[#a16207]",
          imgUrl:
            "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&auto=format&fit=crop&q=80",
          priceNum: 4.5,
        },
      ],
    },

    // Slide 2: Farm Fresh Organic Produce Theme
    {
      id: "produce-theme",
      category: "fruits-vegetables",
      kickerKey: "kickerProduce",
      title1Key: "titleProduce1",
      title2Key: "titleProduce2",
      title3Key: "titleProduce3",
      descKey: "descProduce",
      accentColor: "#10b981", // Crisp Emerald Green
      doodleTextKey: "handwrittenNote",
      pouches: [
        {
          name: "Royal Gala Apples",
          subname: "Crisp & Sweet",
          tag: "Handpicked • Grade A Orchard",
          weight: "1 kg",
          color: "#b91c1c",
          bgGradient: "from-[#dc2626] to-[#991b1b]",
          imgUrl:
            "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
          priceNum: 3.2,
        },
        {
          name: "Farm Red Tomatoes",
          subname: "Vine Ripened",
          tag: "100% Organic • Pesticide Free",
          weight: "1 kg",
          color: "#15803d",
          bgGradient: "from-[#16a34a] to-[#14532d]",
          imgUrl:
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80",
          accentBadge: "🌱 100% Organic",
          priceNum: 1.85,
        },
        {
          name: "Cavendish Bananas",
          subname: "Naturally Sweet",
          tag: "Potassium Rich • Freshly Cut",
          weight: "1 Dozen",
          color: "#ca8a04",
          bgGradient: "from-[#eab308] to-[#a16207]",
          imgUrl:
            "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80",
          priceNum: 1.5,
        },
      ],
    },

    // Slide 3: Artisanal Bakery & Breakfast Essentials Theme
    {
      id: "bakery-theme",
      category: "bakery",
      kickerKey: "kickerBakery",
      title1Key: "titleBakery1",
      title2Key: "titleBakery2",
      title3Key: "titleBakery3",
      descKey: "descBakery",
      accentColor: "#f59e0b", // Warm Golden Amber
      doodleTextKey: "handwrittenNote",
      pouches: [
        {
          name: "Pure Farm Milk",
          subname: "Full Cream",
          tag: "Grass Fed • Freshly Bottled",
          weight: "1 Liter",
          color: "#0369a1",
          bgGradient: "from-[#0284c7] to-[#075985]",
          imgUrl:
            "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
          priceNum: 2.45,
        },
        {
          name: "Sourdough Bread",
          subname: "Slow Fermented",
          tag: "Crusty Loaf • Wood Fired",
          weight: "500g",
          color: "#b45309",
          bgGradient: "from-[#d97706] to-[#92400e]",
          imgUrl:
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
          accentBadge: "🍞 Oven Fresh",
          priceNum: 3.75,
        },
        {
          name: "Golden Farm Eggs",
          subname: "Free Range",
          tag: "Brown Farm Eggs • Pack of 12",
          weight: "12 pcs",
          color: "#ca8a04",
          bgGradient: "from-[#eab308] to-[#a16207]",
          imgUrl:
            "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80",
          priceNum: 3.1,
        },
      ],
    },
  ];

  // Auto-advance banner every 6.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const scrollToCatalog = (category: string) => {
    setActiveCategory(category);
    const el = document.getElementById("grocery-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full space-y-4">
      {/* 1. Main Billboard Banner Canvas */}
      <div
        className="group relative w-full overflow-hidden rounded-3xl border border-emerald-900/30 bg-[#072416] shadow-2xl transition-all"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Animated Radial Lighting Glow Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-95 transition-all duration-1000"
          style={{
            background:
              "radial-gradient(ellipse 95% 85% at 75% 35%, #144f30 0%, #09331e 45%, #051a10 100%)",
          }}
        />

        {/* Ambient Glowing Floating Flares */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.12, 0.22, 0.12],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -end-16 -top-16 h-[420px] w-[420px] rounded-full bg-emerald-300/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.18, 0.08],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="pointer-events-none absolute start-1/4 -top-20 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl"
        />

        {/* Botanical Leaf Accents */}
        <div className="pointer-events-none absolute -start-10 -top-10 text-emerald-400/10 blur-[1px]">
          <LeafIcon className="h-64 w-64 -rotate-45" />
        </div>
        <div className="pointer-events-none absolute -end-8 -top-8 text-emerald-400/10 blur-[1px]">
          <LeafIcon className="h-56 w-56 rotate-45" />
        </div>

        {/* Floating Fruit & Leaf Particles */}
        <FloatingParticles />

        {/* Rustic Tabletop Platform (Bottom Horizon) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-32 border-t border-[#4a2b13]/40"
          style={{
            background:
              "linear-gradient(to top, #140a04 0%, #1e0f06 35%, #2a160a 75%, #341c0d 95%, transparent 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        />

        {/* Banner Content Container with AnimatePresence Crossfade */}
        <div className="relative z-10 flex min-h-[470px] sm:min-h-[510px] lg:min-h-[530px] w-full flex-col justify-between p-6 sm:p-10 lg:p-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 flex-col justify-between gap-8 lg:flex-row lg:items-center"
            >
              {/* Left Column: Bold Typography & Magnetic Action Button */}
              <div className="max-w-xl flex-1 select-none">
                {/* Spaced Kicker Tagline */}
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="text-xs sm:text-[13px] font-extrabold tracking-[0.25em] text-white/80 uppercase"
                >
                  {t(slide.kickerKey)}
                </motion.p>

                {/* Massive Modern Headline with Vibrant Accent */}
                <h1 className="mt-4 font-outfit text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.06]">
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                    className="block"
                  >
                    {t(slide.title1Key)}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.45 }}
                    className="block"
                  >
                    {t(slide.title2Key)}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.29, duration: 0.45 }}
                    className="block transition-colors duration-500"
                    style={{ color: slide.accentColor }}
                  >
                    {t(slide.title3Key)}
                  </motion.span>
                </h1>

                {/* Narrative Paragraph */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="mt-4 text-xs sm:text-sm lg:text-[15px] text-gray-200/90 leading-relaxed max-w-lg"
                >
                  {t(slide.descKey)}
                </motion.p>

                {/* Action Area with Magnetic Button & Express Delivery Pill */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.45 }}
                  className="mt-7 flex flex-wrap items-center gap-4"
                >
                  <MagneticButton
                    onClick={() => scrollToCatalog(slide.category)}
                    accentColor={slide.accentColor}
                  >
                    <span>{t("shopNowBtn")}</span>
                    <ArrowRightIcon className="h-4 w-4 rtl:rotate-180 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </MagneticButton>

                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>⚡ {t("expressDelivery")}</span>
                  </span>
                </motion.div>
              </div>

              {/* Right Column: Floating Parallax Product Cards */}
              <div className="relative flex-1 flex flex-col items-center lg:items-end justify-end mt-4 lg:mt-0">
                {/* Handwritten Script Accent */}
                <div className="mb-4 pe-2 hidden sm:flex flex-col items-end text-end select-none">
                  <div className="flex items-center gap-1.5 font-serif italic text-white/95 text-base sm:text-lg tracking-wide">
                    <span>{t(slide.doodleTextKey)}</span>
                    <span className="text-amber-300 text-sm">✨</span>
                  </div>
                  <svg
                    className="w-24 h-3 text-white/50 -scale-x-100"
                    viewBox="0 0 100 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 10 Q 50 2, 95 8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* 3 Floating Product Pouches with Parallax Physics */}
                <div className="relative flex items-end justify-center gap-2.5 sm:gap-4 pb-2">
                  {/* POUCH 1: Left (Floating softly with gentle tilt) */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [-2, -0.5, -2],
                    }}
                    transition={{
                      duration: 4.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    whileHover={{ scale: 1.05, y: -16 }}
                    onClick={() => scrollToCatalog(slide.category)}
                    className="group/pouch relative flex flex-col justify-between h-56 sm:h-64 lg:h-72 w-28 sm:w-36 lg:w-40 rounded-2xl p-3 sm:p-4 text-white cursor-pointer select-none shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
                    style={{
                      background: `linear-gradient(175deg, ${slide.pouches[0].color} 0%, #0d3820 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-black/25 pb-1.5 opacity-80">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                      <span className="text-[9px] font-black tracking-widest uppercase">
                        SuperBarrio
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    </div>

                    <div className="text-center my-1">
                      <h3 className="text-[11px] sm:text-xs font-black leading-tight">
                        {slide.pouches[0].name}
                      </h3>
                      <p className="text-[9px] text-white/80 mt-0.5">
                        {slide.pouches[0].subname}
                      </p>
                    </div>

                    <div className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 overflow-hidden rounded-full border-2 border-white/60 shadow-inner bg-black/20 my-1">
                      <img
                        src={slide.pouches[0].imgUrl}
                        alt={slide.pouches[0].name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/pouch:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/20 pt-1.5 text-[10px]">
                      <span className="text-white/80">
                        {slide.pouches[0].weight}
                      </span>
                      <span className="font-extrabold text-amber-300">
                        {formatPrice(slide.pouches[0].priceNum, locale)}
                      </span>
                    </div>

                    {/* Dynamic Floor Shadow */}
                    <motion.div
                      animate={{ scale: [1, 0.85, 1], opacity: [0.6, 0.35, 0.6] }}
                      transition={{
                        duration: 4.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -bottom-2.5 inset-x-2 h-3 rounded-full bg-black/70 blur-sm pointer-events-none"
                    />
                  </motion.div>

                  {/* POUCH 2: Center Hero (Taller, Center Floating) */}
                  <motion.div
                    animate={{
                      y: [0, -16, 0],
                    }}
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                    whileHover={{ scale: 1.08, y: -22 }}
                    onClick={() => scrollToCatalog(slide.category)}
                    className="group/pouch relative z-10 flex flex-col justify-between h-64 sm:h-76 lg:h-84 w-32 sm:w-44 lg:w-48 rounded-2xl p-3.5 sm:p-5 text-white cursor-pointer scale-105 select-none shadow-[0_30px_50px_rgba(0,0,0,0.75)]"
                    style={{
                      background: `linear-gradient(175deg, ${slide.pouches[1].color} 0%, #7f1d1d 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-black/25 pb-2 opacity-90">
                      <span className="h-2 w-2 rounded-full bg-white/40" />
                      <span className="text-[10px] font-black tracking-widest uppercase">
                        SuperBarrio™ Fresh
                      </span>
                      <span className="h-2 w-2 rounded-full bg-white/40" />
                    </div>

                    <div className="text-center my-1.5">
                      {slide.pouches[1].accentBadge && (
                        <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white mb-1 shadow-xs">
                          {slide.pouches[1].accentBadge}
                        </span>
                      )}
                      <h3 className="text-xs sm:text-sm font-black leading-tight">
                        {slide.pouches[1].name}
                      </h3>
                      <p className="text-[10px] text-white/80 mt-0.5">
                        {slide.pouches[1].subname}
                      </p>
                    </div>

                    <div className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 overflow-hidden rounded-full border-2 border-white/80 shadow-md bg-black/30 my-1">
                      <img
                        src={slide.pouches[1].imgUrl}
                        alt={slide.pouches[1].name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/pouch:scale-110"
                        loading="eager"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/25 pt-2 text-[11px]">
                      <span className="text-white/90 font-medium">
                        {slide.pouches[1].weight}
                      </span>
                      <span className="font-black text-amber-300 text-xs sm:text-sm">
                        {formatPrice(slide.pouches[1].priceNum, locale)}
                      </span>
                    </div>

                    {/* Dynamic Floor Shadow */}
                    <motion.div
                      animate={{ scale: [1, 0.8, 1], opacity: [0.8, 0.4, 0.8] }}
                      transition={{
                        duration: 3.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2,
                      }}
                      className="absolute -bottom-3 inset-x-3 h-4 rounded-full bg-black/90 blur-md pointer-events-none"
                    />
                  </motion.div>

                  {/* POUCH 3: Right (Floating softly with gentle right tilt) */}
                  <motion.div
                    animate={{
                      y: [0, -11, 0],
                      rotate: [2, 0.5, 2],
                    }}
                    transition={{
                      duration: 4.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    whileHover={{ scale: 1.05, y: -16 }}
                    onClick={() => scrollToCatalog(slide.category)}
                    className="group/pouch relative flex flex-col justify-between h-56 sm:h-64 lg:h-72 w-28 sm:w-36 lg:w-40 rounded-2xl p-3 sm:p-4 text-white cursor-pointer select-none shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
                    style={{
                      background: `linear-gradient(175deg, ${slide.pouches[2].color} 0%, #713f12 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-black/25 pb-1.5 opacity-80">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                      <span className="text-[9px] font-black tracking-widest uppercase">
                        SuperBarrio
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    </div>

                    <div className="text-center my-1">
                      <h3 className="text-[11px] sm:text-xs font-black leading-tight">
                        {slide.pouches[2].name}
                      </h3>
                      <p className="text-[9px] text-white/80 mt-0.5">
                        {slide.pouches[2].subname}
                      </p>
                    </div>

                    <div className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 overflow-hidden rounded-full border-2 border-white/60 shadow-inner bg-black/20 my-1">
                      <img
                        src={slide.pouches[2].imgUrl}
                        alt={slide.pouches[2].name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/pouch:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/20 pt-1.5 text-[10px]">
                      <span className="text-white/80">
                        {slide.pouches[2].weight}
                      </span>
                      <span className="font-extrabold text-amber-300">
                        {formatPrice(slide.pouches[2].priceNum, locale)}
                      </span>
                    </div>

                    {/* Dynamic Floor Shadow */}
                    <motion.div
                      animate={{ scale: [1, 0.85, 1], opacity: [0.6, 0.35, 0.6] }}
                      transition={{
                        duration: 4.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                      className="absolute -bottom-2.5 inset-x-2 h-3 rounded-full bg-black/70 blur-sm pointer-events-none"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Slider Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute start-3 sm:start-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/70 hover:scale-110 active:scale-95 opacity-70 group-hover:opacity-100"
          title="Previous Banner"
        >
          <AngleLeftIcon className="h-5 w-5 rtl:rotate-180" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute end-3 sm:end-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/70 hover:scale-110 active:scale-95 opacity-70 group-hover:opacity-100"
          title="Next Banner"
        >
          <AngleRightIcon className="h-5 w-5 rtl:rotate-180" />
        </button>

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? "w-8 bg-white shadow-lg"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              title={`Switch to banner ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Premium Live Counter & Guarantee Ribbon with Animated Numbers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 rounded-3xl border border-gray-200/80 bg-white/80 p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5 dark:border-emerald-950/60 dark:bg-[#071d12]/70 dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]"
      >
        {/* Metric 1: Express 15 Min Delivery */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
            <BoltIcon className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h4 className="font-outfit text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
              <AnimatedCounter to={15} suffix=" Mins" />
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-emerald-300/70">
              {t("trust1Desc")}
            </p>
          </div>
        </div>

        {/* Metric 2: 100% Farm Fresh Quality */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 shadow-xs dark:bg-green-950/60 dark:text-green-400">
            <LeafIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-outfit text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
              <AnimatedCounter to={100} suffix="%" /> Fresh
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-emerald-300/70">
              {t("trust2Desc")}
            </p>
          </div>
        </div>

        {/* Metric 3: 12,000+ Happy Homes */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-xs dark:bg-amber-950/60 dark:text-amber-400">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-outfit text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
              <AnimatedCounter to={12450} suffix="+" />
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-emerald-300/70">
              Happy Homes Served
            </p>
          </div>
        </div>

        {/* Metric 4: 4.9 Rating */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-amber-500 shadow-xs dark:bg-amber-950/60 dark:text-amber-400">
            <StarIcon className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h4 className="font-outfit text-sm sm:text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-1">
              <AnimatedCounter to={4.9} decimals={1} />
              <span className="text-amber-500 text-xs">★</span>
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-emerald-300/70">
              Customer Rating
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GroceryHeroBanner;
