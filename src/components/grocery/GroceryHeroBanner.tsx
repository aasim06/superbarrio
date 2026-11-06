"use client";

import React, { useEffect, useState } from "react";
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

export const GroceryHeroBanner: React.FC = () => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const { setActiveCategory } = useGroceryCart();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides: HeroSlide[] = [
    // Slide 1: The Iconic Snacks Theme (Matching the user's reference design)
    {
      id: "snacks-theme",
      category: "snacks",
      kickerKey: "kickerSnacks",
      title1Key: "titleSnacks1",
      title2Key: "titleSnacks2",
      title3Key: "titleSnacks3",
      descKey: "descSnacks",
      accentColor: "#ea384c", // Iconic warm coral red from reference
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
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80",
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
            "https://images.unsplash.com/photo-1536591375315-1b83683e32a7?w=400&auto=format&fit=crop&q=80",
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

    // Slide 3: Artisanal Bakery & Breakfast Theme
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

  // Auto-advance banner every 7 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

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
        {/* Atmospheric Forest Green Radial Lighting */}
        <div
          className="pointer-events-none absolute inset-0 opacity-95 transition-opacity duration-1000"
          style={{
            background:
              "radial-gradient(ellipse 95% 85% at 75% 35%, #144f30 0%, #09331e 45%, #051a10 100%)",
          }}
        />

        {/* Ambient Sunlight Flare from Top-Right */}
        <div className="pointer-events-none absolute -end-20 -top-20 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="pointer-events-none absolute start-1/3 -top-16 h-72 w-72 rounded-full bg-amber-400/5 blur-3xl" />

        {/* Subtle Botanical Leaf Silhouette Accents */}
        <div className="pointer-events-none absolute -start-10 -top-10 text-emerald-400/10 blur-[1px]">
          <LeafIcon className="h-64 w-64 -rotate-45" />
        </div>
        <div className="pointer-events-none absolute -end-8 -top-8 text-emerald-400/10 blur-[1px]">
          <LeafIcon className="h-56 w-56 rotate-45" />
        </div>

        {/* Rustic Tabletop Platform (Bottom Horizon) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-32 border-t border-[#4a2b13]/40"
          style={{
            background:
              "linear-gradient(to top, #140a04 0%, #1e0f06 35%, #2a160a 75%, #341c0d 95%, transparent 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        />

        {/* Banner Content Container */}
        <div className="relative z-10 flex min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] w-full flex-col justify-between p-6 sm:p-10 lg:p-14">
          {/* Main Flex Row: Text on Left, Products on Right */}
          <div className="flex flex-1 flex-col justify-between gap-8 lg:flex-row lg:items-center">
            {/* Left Column: Bold Typography & Action Button */}
            <div className="max-w-xl flex-1 select-none">
              {/* Spaced Kicker Tagline */}
              <p className="text-xs sm:text-[13px] font-extrabold tracking-[0.25em] text-white/80 uppercase">
                {t(slide.kickerKey)}
              </p>

              {/* Massive Modern Headline with Vibrant Accent */}
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.06]">
                <span className="block">{t(slide.title1Key)}</span>
                <span className="block">{t(slide.title2Key)}</span>
                <span
                  className="block transition-colors duration-500"
                  style={{ color: slide.accentColor }}
                >
                  {t(slide.title3Key)}
                </span>
              </h1>

              {/* Wholesome Narrative Paragraph */}
              <p className="mt-4 text-xs sm:text-sm lg:text-[15px] text-gray-200/90 leading-relaxed max-w-lg">
                {t(slide.descKey)}
              </p>

              {/* Red Rounded Pill Action Button */}
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollToCatalog(slide.category)}
                  className="group/btn inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: slide.accentColor,
                    boxShadow: `0 12px 30px ${slide.accentColor}50`,
                  }}
                >
                  <span>{t("shopNowBtn")}</span>
                  <ArrowRightIcon className="h-4 w-4 rtl:rotate-180 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>

                <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200/80">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t("expressDelivery")}</span>
                </span>
              </div>
            </div>

            {/* Right Column: Staged Hero Products on Rustic Wooden Surface */}
            <div className="relative flex-1 flex flex-col items-center lg:items-end justify-end mt-4 lg:mt-0">
              {/* Playful Handwritten Script Accent at Top Right */}
              <div className="mb-4 pe-2 hidden sm:flex flex-col items-end text-end select-none">
                <div className="flex items-center gap-1.5 font-serif italic text-white/95 text-base sm:text-lg tracking-wide">
                  <span>{t(slide.doodleTextKey)}</span>
                  <span className="text-amber-300 text-sm">✨</span>
                </div>
                {/* Hand-drawn underline doodle stroke */}
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

              {/* 3 Stand-Up Product Pouches Standing Side-by-Side on Wood */}
              <div className="relative flex items-end justify-center gap-2.5 sm:gap-4 pb-2">
                {/* POUCH 1: Left (Slightly tilted) */}
                <div
                  onClick={() => scrollToCatalog(slide.category)}
                  className="group/pouch relative flex flex-col justify-between h-56 sm:h-64 lg:h-72 w-28 sm:w-36 lg:w-40 rounded-2xl p-3 sm:p-4 text-white cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl -rotate-2 select-none shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  style={{
                    background: `linear-gradient(175deg, ${slide.pouches[0].color} 0%, #0d3820 100%)`,
                  }}
                >
                  {/* Pouch Top Notch & Crimp Seal */}
                  <div className="flex items-center justify-between border-b border-black/25 pb-1.5 opacity-80">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span className="text-[9px] font-black tracking-widest uppercase">
                      SuperBarrio
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  </div>

                  {/* Title & Info */}
                  <div className="text-center my-1">
                    <h3 className="text-[11px] sm:text-xs font-black leading-tight">
                      {slide.pouches[0].name}
                    </h3>
                    <p className="text-[9px] text-white/80 mt-0.5">
                      {slide.pouches[0].subname}
                    </p>
                  </div>

                  {/* Circular Product Window with Real Food Photo */}
                  <div className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 overflow-hidden rounded-full border-2 border-white/60 shadow-inner bg-black/20 my-1">
                    <img
                      src={slide.pouches[0].imgUrl}
                      alt={slide.pouches[0].name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/pouch:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Bottom Weight & Price */}
                  <div className="flex items-center justify-between border-t border-white/20 pt-1.5 text-[10px]">
                    <span className="text-white/80">{slide.pouches[0].weight}</span>
                    <span className="font-extrabold text-amber-300">
                      {formatPrice(slide.pouches[0].priceNum, locale)}
                    </span>
                  </div>

                  {/* Stand Shadow onto Wooden Table */}
                  <div className="absolute -bottom-2 inset-x-2 h-3 rounded-full bg-black/60 blur-sm pointer-events-none" />
                </div>

                {/* POUCH 2: Center (Hero, Taller, Elevated) */}
                <div
                  onClick={() => scrollToCatalog(slide.category)}
                  className="group/pouch relative z-10 flex flex-col justify-between h-64 sm:h-76 lg:h-84 w-32 sm:w-44 lg:w-48 rounded-2xl p-3.5 sm:p-5 text-white cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl scale-105 select-none shadow-[0_25px_40px_rgba(0,0,0,0.7)]"
                  style={{
                    background: `linear-gradient(175deg, ${slide.pouches[1].color} 0%, #7f1d1d 100%)`,
                  }}
                >
                  {/* Pouch Top Crimp */}
                  <div className="flex items-center justify-between border-b border-black/25 pb-2 opacity-90">
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                      SuperBarrio™ Original
                    </span>
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                  </div>

                  {/* Title & Badge */}
                  <div className="text-center my-1.5">
                    {slide.pouches[1].accentBadge && (
                      <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white mb-1">
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

                  {/* Circular Product Window with Real Food Photo */}
                  <div className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 overflow-hidden rounded-full border-2 border-white/80 shadow-md bg-black/30 my-1">
                    <img
                      src={slide.pouches[1].imgUrl}
                      alt={slide.pouches[1].name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/pouch:scale-110"
                      loading="eager"
                    />
                  </div>

                  {/* Bottom Weight & Price */}
                  <div className="flex items-center justify-between border-t border-white/25 pt-2 text-[11px]">
                    <span className="text-white/90 font-medium">
                      {slide.pouches[1].weight}
                    </span>
                    <span className="font-black text-amber-300 text-xs sm:text-sm">
                      {formatPrice(slide.pouches[1].priceNum, locale)}
                    </span>
                  </div>

                  {/* Stand Shadow onto Wooden Table */}
                  <div className="absolute -bottom-3 inset-x-3 h-4 rounded-full bg-black/80 blur-md pointer-events-none" />
                </div>

                {/* POUCH 3: Right (Slightly tilted) */}
                <div
                  onClick={() => scrollToCatalog(slide.category)}
                  className="group/pouch relative flex flex-col justify-between h-56 sm:h-64 lg:h-72 w-28 sm:w-36 lg:w-40 rounded-2xl p-3 sm:p-4 text-white cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl rotate-2 select-none shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  style={{
                    background: `linear-gradient(175deg, ${slide.pouches[2].color} 0%, #713f12 100%)`,
                  }}
                >
                  {/* Pouch Top Crimp */}
                  <div className="flex items-center justify-between border-b border-black/25 pb-1.5 opacity-80">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span className="text-[9px] font-black tracking-widest uppercase">
                      SuperBarrio
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  </div>

                  {/* Title & Info */}
                  <div className="text-center my-1">
                    <h3 className="text-[11px] sm:text-xs font-black leading-tight">
                      {slide.pouches[2].name}
                    </h3>
                    <p className="text-[9px] text-white/80 mt-0.5">
                      {slide.pouches[2].subname}
                    </p>
                  </div>

                  {/* Circular Product Window with Real Food Photo */}
                  <div className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 overflow-hidden rounded-full border-2 border-white/60 shadow-inner bg-black/20 my-1">
                    <img
                      src={slide.pouches[2].imgUrl}
                      alt={slide.pouches[2].name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/pouch:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Bottom Weight & Price */}
                  <div className="flex items-center justify-between border-t border-white/20 pt-1.5 text-[10px]">
                    <span className="text-white/80">{slide.pouches[2].weight}</span>
                    <span className="font-extrabold text-amber-300">
                      {formatPrice(slide.pouches[2].priceNum, locale)}
                    </span>
                  </div>

                  {/* Stand Shadow onto Wooden Table */}
                  <div className="absolute -bottom-2 inset-x-2 h-3 rounded-full bg-black/60 blur-sm pointer-events-none" />
                </div>

                {/* Foreground Rustic Table Garnish: Bowls & Fresh Ingredients Scattered */}
                <div className="pointer-events-none absolute -bottom-3 inset-x-0 z-20 hidden sm:flex items-end justify-between px-1 md:px-3">
                  {/* Left: Mini Rustic Bowl of Golden Crispy Chips */}
                  <div className="relative flex items-center filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.85)]">
                    <div className="h-8 w-14 sm:h-9 sm:w-16 overflow-hidden rounded-full border border-amber-800/40 bg-[#1e0f06] shadow-inner">
                      <img
                        src="https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=160&auto=format&fit=crop&q=80"
                        alt="Chips in bowl"
                        className="h-full w-full object-cover scale-125"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Center: Fresh Red Chili Pepper & Peanuts */}
                  <div className="relative flex items-center gap-1 pb-0.5 filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.9)]">
                    <span className="text-xl -rotate-12 transform select-none" title="Chili">
                      🌶️
                    </span>
                    <span className="text-xs select-none">
                      🥜
                    </span>
                  </div>

                  {/* Right: Rustic Mini Dish of Mixed Whole Nuts */}
                  <div className="relative flex items-center filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.85)]">
                    <div className="h-8 w-14 sm:h-9 sm:w-16 overflow-hidden rounded-full border border-amber-800/40 bg-[#1e0f06] shadow-inner">
                      <img
                        src="https://images.unsplash.com/photo-1536591375315-1b83683e32a7?w=160&auto=format&fit=crop&q=80"
                        alt="Mixed nuts"
                        className="h-full w-full object-cover scale-125"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slider Navigation Arrows (Floating at ends) */}
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

      {/* 2. Premium Quality & Guarantee Ribbon (Below Banner) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-theme-xs sm:p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <BoltIcon className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {t("trust1Title")}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("trust1Desc")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <LeafIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {t("trust2Title")}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("trust2Desc")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {t("trust3Title")}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("trust3Desc")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <StarIcon className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {t("trust4Title")}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("trust4Desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryHeroBanner;
