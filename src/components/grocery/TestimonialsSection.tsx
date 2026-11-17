"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
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

const TESTIMONIALS_ES: Testimonial[] = [
  {
    id: 1,
    name: "Elena Vance (Madrid)",
    role: "Cliente Verificada SuperBarrio",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    stars: 5,
    favoriteItem: "Pan de Masa Madre y Leche de Granja",
    quote:
      "¡SuperBarrio me entrega las frutas ecológicas y el pan de masa madre recién hecho en menos de 20 minutos! La frescura supera con creces a la del supermercado tradicional.",
  },
  {
    id: 2,
    name: "Marcos Sterling (Barcelona)",
    role: "Entusiasta de la Cocina",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    stars: 5,
    favoriteItem: "Aceite Virgen Extra de Jaén y Huevos Camperos",
    quote:
      "La calidad de los huevos camperos con yemas doradas y el aceite de oliva virgen extra es insuperable. Mis desayunos han cambiado por completo.",
  },
  {
    id: 3,
    name: "Sofía Rodríguez (Valencia)",
    role: "Compradora Semanal Familiar",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    stars: 5,
    favoriteItem: "Chips de Plátano y Cacahuetes Tostados",
    quote:
      "Los chips de plátano macho y los cacahuetes especiados son un vicio. Los repartidores siempre llegan puntuales y con una sonrisa en cada entrega.",
  },
];

const TESTIMONIALS_EN: Testimonial[] = [
  {
    id: 1,
    name: "Elena Vance (Madrid)",
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
    name: "Marcus Sterling (Barcelona)",
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
    name: "Sofia Rodriguez (Valencia)",
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
  const locale = useLocale();
  const isEs = locale === "es";
  const testimonials = isEs ? TESTIMONIALS_ES : TESTIMONIALS_EN;

  return (
    <div className="mt-16 w-full">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto pb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-black tracking-wider uppercase text-emerald-800 shadow-xs dark:bg-emerald-950/80 dark:text-emerald-300">
          {isEs ? "⭐ Historias Reales de Clientes" : "⭐ Real Customer Stories"}
        </span>
        <h3 className="mt-3 font-outfit text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          {isEs ? "Más de 12.000 hogares felices en España" : "Loved by 12,000+ Happy Kitchens"}
        </h3>
        <p className="mt-1 text-xs sm:text-sm font-medium text-gray-500 dark:text-emerald-300/70">
          {isEs
            ? "Descubre por qué tantas familias en España confían en SuperBarrio para su compra diaria"
            : "Discover why neighborhood households trust SuperBarrio for daily groceries"}
        </p>
      </div>

      {/* Testimonials Cards: Swipeable carousel on mobile, 3-column grid on desktop */}
      <div className="flex overflow-x-auto gap-4 pb-3 no-scrollbar snap-x md:grid md:grid-cols-3 md:gap-6 md:pb-0">
        {testimonials.map((item, index) => (
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
                  <span>{isEs ? "Comprador Verificado" : "Verified Buyer"}</span>
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
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-500/40 shadow-sm bg-gray-100 dark:bg-emerald-950">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-full w-full rounded-full object-cover aspect-square"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        item.name
                      )}&background=10b981&color=fff&bold=true`;
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-outfit text-sm font-extrabold text-gray-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-emerald-400/60">
                    {item.role}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {isEs ? "Favorito:" : "Favorite:"} {item.favoriteItem}
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

