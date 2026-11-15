"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BoltIcon,
  LeafIcon,
  RefreshIcon,
  ShieldCheckIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  WhatsAppIcon,
  TimeIcon,
  CheckCircleIcon,
} from "@/icons";
import { motion, useReducedMotion } from "framer-motion";
import SuperBarrioLogo from "@/components/common/SuperBarrioLogo";
import {
  BizumLogo,
  VisaLogo,
  MastercardLogo,
  ApplePayLogo,
  PayPalLogo,
  CashBadgeIcon,
  PaymentBadge,
} from "./PaymentCardLogos";

export const GroceryFooter: React.FC = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const isEs = locale === "es";
  const t = useTranslations("grocery");
  const shouldReduceMotion = useReducedMotion();

  // If on checkout or order confirmation page, render a compact distraction-free trust footer
  if (pathname.includes("/checkout") || pathname.includes("/order-success")) {
    return (
      <footer className="mt-8 border-t border-gray-200/80 bg-white/95 pt-6 pb-28 lg:pb-6 backdrop-blur-sm dark:border-emerald-950/80 dark:bg-[#071910] text-center">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-gray-500 dark:text-emerald-400/80">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {isEs ? "Pago 100% Seguro SSL" : "100% Secure SSL Payment"}
            </span>
            <span className="flex items-center gap-1.5">
              <BoltIcon className="h-4 w-4 text-amber-500 fill-current" />
              {isEs ? "Reparto Refrigerado" : "Refrigerated Delivery"}
            </span>
            <span className="flex items-center gap-1.5">
              <LeafIcon className="h-4 w-4 text-emerald-500" />
              {isEs ? "Garantía de Frescura" : "Freshness Guarantee"}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
            © 2026 SuperBarrio España S.L. {isEs ? "Todos los derechos reservados." : "All rights reserved."}
          </p>
        </div>
      </footer>
    );
  }

  const perks = [
    {
      icon: <LeafIcon className="h-6 w-6 text-emerald-500" />,
      title: t("perks.fresh"),
      desc: t("perks.freshDesc"),
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      icon: <BoltIcon className="h-6 w-6 text-amber-500 fill-current" />,
      title: t("perks.speed"),
      desc: t("perks.speedDesc"),
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />,
      title: t("perks.hygiene"),
      desc: t("perks.hygieneDesc"),
      bg: "bg-green-50 dark:bg-green-950/50",
    },
    {
      icon: <RefreshIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      title: t("perks.replacement"),
      desc: t("perks.replacementDesc"),
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
  ];

  const categories = [
    { name: isEs ? "Frutas y Verduras" : "Fruits & Vegetables", href: "/grocery?category=fruits-vegetables" },
    { name: isEs ? "Lácteos y Huevos" : "Dairy & Eggs", href: "/grocery?category=dairy-eggs" },
    { name: isEs ? "Panadería Artesana" : "Artisan Bakery", href: "/grocery?category=bakery" },
    { name: isEs ? "Carnes y Charcutería" : "Meat & Deli", href: "/grocery?category=meat-seafood" },
    { name: isEs ? "Despensa y Aceites" : "Pantry & Oils", href: "/grocery?category=pantry-cooking" },
    { name: isEs ? "Bebidas y Cafés" : "Beverages & Coffee", href: "/grocery?category=beverages" },
    { name: isEs ? "Ofertas Especiales" : "Special Deals", href: "/grocery" },
  ];

  const supportLinks = [
    { name: isEs ? "¿Cómo funciona el reparto?" : "How delivery works", href: "/grocery" },
    { name: isEs ? "Horarios y Zonas de Envío" : "Delivery times & zones", href: "/grocery" },
    { name: isEs ? "Preguntas Frecuentes (FAQ)" : "Frequently Asked Questions", href: "/grocery" },
    { name: isEs ? "Garantía de Devolución" : "Refund & Freshness Policy", href: "/grocery" },
    { name: isEs ? "Seguimiento de Pedido" : "Order Tracking", href: "/grocery" },
    { name: isEs ? "Contacto por WhatsApp" : "WhatsApp Support", href: "https://wa.me/34612345678" },
  ];

  const legalLinks = [
    { name: isEs ? "Aviso Legal" : "Legal Notice", href: "/grocery" },
    { name: isEs ? "Política de Privacidad (RGPD)" : "Privacy Policy (GDPR)", href: "/grocery" },
    { name: isEs ? "Política de Cookies" : "Cookie Policy", href: "/grocery" },
    { name: isEs ? "Términos y Condiciones" : "Terms & Conditions", href: "/grocery" },
    { name: isEs ? "Panel de Administración" : "Admin Dashboard", href: "/dashboard" },
  ];

  return (
    <footer className="mt-20 border-t border-gray-200/80 bg-white/95 pb-36 pt-4 backdrop-blur-sm dark:border-emerald-950/80 dark:bg-[#071910] sm:pb-24">
      {/* 1. Trust & Value Perks Grid */}
      <div className="mx-auto w-full max-w-[1920px] border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8 xl:px-10 dark:border-emerald-950/60">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {perks.map((p, idx) => (
            <motion.div
              key={idx}
              whileHover={shouldReduceMotion ? {} : { y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 sm:p-4.5 transition-all hover:border-emerald-200 hover:shadow-md dark:border-emerald-950/60 dark:bg-[#05130b] dark:hover:border-emerald-800"
            >
              <div
                className={`flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl shadow-xs ${p.bg}`}
              >
                {p.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-outfit text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate">
                  {p.title}
                </h4>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. Main Multi-Column Footer Grid */}
      <div className="mx-auto w-full max-w-[1920px] px-4 py-12 sm:px-6 lg:px-8 xl:px-10 border-b border-gray-100 dark:border-emerald-950/60">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Brand & Contact Info (4 Columns) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link href="/grocery" className="inline-block transition-transform hover:scale-102">
              <SuperBarrioLogo showSubtitle={false} />
            </Link>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm">
              {isEs
                ? "Tu supermercado de barrio online en España. Frutas, verduras y alimentos frescos de la huerta a tu cocina en menos de 30 minutos. Calidad garantizada."
                : "Your local online grocery store in Spain. Farm-fresh fruits, vegetables and everyday essentials delivered to your kitchen in under 30 minutes."}
            </p>

            {/* Physical Address & Contact Pills */}
            <div className="space-y-2 pt-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Calle Gran Vía, 28, 28013 Madrid, España (CIF: B-87654321)</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <a
                  href="tel:+34612345678"
                  className="font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  +34 612 345 678
                </a>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {isEs ? "Lun-Dom 08:00 - 23:00" : "Mon-Sun 08:00 - 23:00"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <a
                  href="mailto:hola@superbarrio.es"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  hola@superbarrio.es
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href="https://wa.me/34612345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white shadow-xs"
                title="WhatsApp Directo"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ⭐ 4.9/5 {isEs ? "en más de 12.000 hogares" : "rated by 12,000+ homes"}
              </span>
            </div>
          </div>

          {/* Column 2: Categorías / Departments (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-outfit text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              {isEs ? "Categorías" : "Departments"}
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.map((c, i) => (
                <li key={i}>
                  <Link
                    href={c.href}
                    className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Ayuda & Clientes (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-outfit text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              {isEs ? "Atención al Cliente" : "Customer Care"}
            </h4>
            <ul className="space-y-2 text-xs">
              {supportLinks.map((s, i) => (
                <li key={i}>
                  <Link
                    href={s.href}
                    className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Cumplimiento (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-outfit text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              {isEs ? "Legal y Empresa" : "Legal & Company"}
            </h4>
            <ul className="space-y-2 text-xs">
              {legalLinks.map((l, i) => (
                <li key={i}>
                  <Link
                    href={l.href}
                    className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: WhatsApp Direct Order & Delivery Box (2 Columns) */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-3">
            <h4 className="font-outfit text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              {isEs ? "Pedidos Rápidos" : "Quick Orders"}
            </h4>
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 to-green-50/50 p-4 dark:border-emerald-950/80 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <TimeIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{isEs ? "Reparto Express" : "Express Delivery"}</span>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                {isEs
                  ? "Entregas en 25 minutos con furgonetas refrigeradas en tu barrio."
                  : "25-minute deliveries with temperature-controlled vans to your door."}
              </p>
              <a
                href="https://wa.me/34612345678?text=Hola%20SuperBarrio,%20quiero%20hacer%20un%20pedido%20fresco."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>{isEs ? "Pedir por WhatsApp" : "Order via WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar: Security, Payment Badges & Copyright (With Floating Buttons Safe Clearance) */}
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-between gap-4 px-4 pt-8 text-xs sm:flex-row sm:px-6 sm:ps-72 sm:pe-60 lg:px-8 lg:ps-72 lg:pe-60 xl:px-10 xl:ps-72 xl:pe-60 text-gray-500 dark:text-gray-400">
        {/* Copyright */}
        <div className="text-center sm:text-start">
          <p className="text-[11px]">
            © {new Date().getFullYear()} SuperBarrio España S.L. · {isEs ? "Todos los derechos reservados." : "All rights reserved."}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
            {isEs
              ? "Inscrita en el Registro Mercantil de Madrid. IVA incluido en todos los precios mostrados."
              : "Registered in the Mercantile Registry of Madrid. VAT included in all displayed prices."}
          </p>
        </div>

        {/* Accepted Payment Card Vector SVGs (Including Spain's #1 Bizum) */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <PaymentBadge title="Bizum España">
            <BizumLogo className="h-3.5 w-auto" />
          </PaymentBadge>
          <PaymentBadge title="Visa">
            <VisaLogo className="h-3.5 w-auto" />
          </PaymentBadge>
          <PaymentBadge title="Mastercard">
            <MastercardLogo className="h-4 w-auto" />
          </PaymentBadge>
          <PaymentBadge title="Apple Pay">
            <ApplePayLogo className="h-3.5 w-auto text-gray-900 dark:text-white" />
          </PaymentBadge>
          <PaymentBadge title="PayPal">
            <PayPalLogo className="h-3.5 w-auto" />
          </PaymentBadge>
          <PaymentBadge title="Pago en Efectivo / Cash on Delivery" label={isEs ? "Efectivo" : "Cash"}>
            <CashBadgeIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </PaymentBadge>
          <div className="inline-flex h-7 items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-50/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 ms-1">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            <span>SSL 256-Bit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GroceryFooter;
