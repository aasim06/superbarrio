"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { CustomerOrder } from "@/types/grocery";
import {
  WhatsAppIcon,
  BoxIcon,
  TruckIcon,
  HomeIcon,
  MapPinIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useGroceryCart } from "@/context/GroceryCartContext";

// 60FPS Native Canvas Confetti Burst (Zero external dependencies)
const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // SuperBarrio festive brand palette: Fresh Greens, Warm Orange, Amber, Gold
    const colors = [
      "#16a34a",
      "#22c55e",
      "#f59e0b",
      "#fbbf24",
      "#10b981",
      "#34d399",
      "#f97316",
      "#eab308",
    ];

    const pieces: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      vRot: number;
      opacity: number;
    }> = [];

    // 120 confetti pieces bursting from center
    for (let i = 0; i < 120; i++) {
      const angle = (Math.PI * 2 * i) / 120 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 9 + 4;
      pieces.push({
        x: width / 2 + (Math.random() - 0.5) * 120,
        y: Math.min(height * 0.32, 280),
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6.5,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    let animationFrameId: number;
    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let isAlive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.vx *= 0.98; // Drag
        p.rotation += p.vRot;

        if (elapsed > 2000) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        if (p.opacity > 0 && p.y < height + 40) {
          isAlive = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (isAlive && elapsed < 4500) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
};

export const OrderSuccessView: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("orderSuccess");
  const isEs = locale === "es";

  const { addToCart } = useGroceryCart();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [pastOrders, setPastOrders] = useState<CustomerOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    try {
      // 1. Load last placed order
      const storedLast = localStorage.getItem("tailgrocery_last_order");
      if (storedLast) {
        setOrder(JSON.parse(storedLast));
      }

      // 2. Load all past orders
      const storedAll = localStorage.getItem("tailgrocery_orders");
      if (storedAll) {
        const list = JSON.parse(storedAll);
        setPastOrders(list);
      }
    } catch {
      // Ignore
    }
  }, []);

  const orderId = order?.orderId || "ES-583921";
  const items = order?.items || [];
  const subtotal = order?.subtotal || 24.5;
  const discount = order?.discount || 0;
  const deliveryFee = order?.deliveryFee ?? 0;
  const total = order?.total || 24.5;
  const address =
    order?.address ||
    "Calle Gran Vía, 28, 3º B, 28013 Madrid (Madrid)";
  const slot = order?.deliverySlot || "Hoy - 17:00 - 20:00 (Tarde)";
  const customerName = order?.customerName || "María García";
  const phone = order?.phone || "+34 612 345 678";

  // Calculate 10% VAT included
  const vatAmount = Number((total - total / 1.1).toFixed(2));

  // Payment method label
  const getPaymentMethodDisplay = (method?: string) => {
    switch (method) {
      case "bizum":
        return { label: "Bizum (Móvil)", icon: "📲", color: "text-[#00A99D]" };
      case "card":
        return {
          label: isEs ? "Tarjeta Bancaria (3D Secure)" : "Credit/Debit Card",
          icon: "💳",
          color: "text-emerald-600 dark:text-emerald-400",
        };
      case "paypal":
        return { label: "PayPal", icon: "🅿️", color: "text-blue-600" };
      case "apple_google":
        return {
          label: "Apple Pay / Google Pay",
          icon: " / G",
          color: "text-gray-900 dark:text-white",
        };
      case "cod":
      default:
        return {
          label: isEs
            ? "Efectivo contra entrega (al recibir)"
            : "Cash on Delivery",
          icon: "💵",
          color: "text-amber-600 dark:text-amber-400",
        };
    }
  };

  const paymentInfo = getPaymentMethodDisplay(order?.paymentMethod);

  // Copy order ID to clipboard
  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setHasCopied(true);
    toast.success(
      isEs
        ? `Nº de pedido #${orderId} copiado al portapapeles`
        : `Order #${orderId} copied to clipboard!`,
    );
    setTimeout(() => setHasCopied(false), 2500);
  };

  // WhatsApp formatted share link
  const getShareWhatsAppUrl = () => {
    const text = isEs
      ? `¡Hola! Acabo de hacer un pedido de alimentos frescos en SuperBarrio España.\n\n📦 *Nº de Pedido:* #${orderId}\n💶 *Total:* ${formatPrice(total, locale)}\n🕒 *Franja de entrega:* ${slot}\n📍 *Dirección:* ${address}\n\n¿Podrían confirmarme la hora aproximada de llegada? ¡Muchas gracias!`
      : `Hi! I just placed a fresh grocery order at SuperBarrio Spain.\n\n📦 *Order ID:* #${orderId}\n💶 *Total:* ${formatPrice(total, locale)}\n🕒 *Delivery Slot:* ${slot}\n📍 *Address:* ${address}\n\nCould you please update me on arrival? Thank you!`;

    return `https://wa.me/34612345678?text=${encodeURIComponent(text)}`;
  };

  // Re-order past order items
  const handleReorder = (pastOrder: CustomerOrder) => {
    if (!pastOrder.items || pastOrder.items.length === 0) return;
    pastOrder.items.forEach((it) => {
      addToCart(it, it.quantity);
    });
    toast.success(t("reorderedSuccess"), { icon: "🛒" });
    router.push("/grocery/checkout");
  };

  return (
    <div className="relative min-h-screen pb-16 pt-6 sm:pt-10">
      {/* 1. Confetti Burst */}
      <ConfettiCanvas />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb / Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/grocery"
            className="group inline-flex items-center gap-2 text-xs font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span>{t("continueShopping")}</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-emerald-400/60">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
            <span>SuperBarrio España • 100% Garantizado</span>
          </div>
        </div>

        {/* Main Success Container */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-emerald-950/70 dark:bg-[#071910] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
          {/* Header Hero with Animated SVG Checkmark */}
          <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white px-6 pb-8 pt-10 text-center dark:from-emerald-950/30 dark:via-[#071910] dark:to-[#071910] sm:px-12 sm:pt-12">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-56 w-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />

            {/* Animated SVG Checkmark */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 220,
                damping: 18,
              }}
              className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-2xl shadow-emerald-600/35 ring-8 ring-emerald-500/15"
            >
              <svg
                className="h-12 w-12"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.circle
                  cx="26"
                  cy="26"
                  r="23"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                <motion.path
                  d="M15 27L22.5 34.5L37 18"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.45, duration: 0.4, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            {/* Confirmation Tag */}
            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <span>{t("badge")}</span>
              </span>
            </div>

            <h1 className="mt-3 font-outfit text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl md:text-4xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-2.5 max-w-lg text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300">
              {t("subtitle")}
            </p>

            {/* Order Number Banner with Copy Action */}
            <div className="mx-auto mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50/70 px-4 py-2 text-xs font-bold text-emerald-950 shadow-xs dark:border-emerald-950/80 dark:bg-emerald-950/40 dark:text-emerald-200">
              <span className="text-gray-500 dark:text-emerald-400">
                {t("orderNumber")}:
              </span>
              <span className="font-outfit text-sm font-black text-emerald-700 dark:text-emerald-300">
                #{orderId}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="ms-1.5 rounded-lg bg-white px-2 py-0.5 text-[11px] font-black text-emerald-700 shadow-xs transition hover:bg-emerald-600 hover:text-white dark:bg-[#071910] dark:text-emerald-300 dark:hover:bg-emerald-600"
              >
                {hasCopied ? `✓ ${t("copied")}` : t("copy")}
              </button>
            </div>
          </div>

          {/* Interactive Navigation: Current Order vs Mis Pedidos History */}
          <div className="border-t border-b border-gray-100 bg-gray-50/70 px-6 py-2.5 dark:border-emerald-950/60 dark:bg-[#05130b] sm:px-10">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("current")}
                className={`rounded-2xl px-4 py-2 text-xs font-black transition-all ${
                  activeTab === "current"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-gray-600 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:bg-emerald-950/60"
                }`}
              >
                {t("tabCurrent")}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-black transition-all ${
                  activeTab === "history"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-gray-600 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:bg-emerald-950/60"
                }`}
              >
                <span>📦</span>
                <span>
                  {t("tabHistory", { count: pastOrders.length || 1 })}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: CURRENT ORDER CONTENT */}
          {activeTab === "current" && (
            <div className="p-6 sm:p-10 space-y-8">
              {/* Highlight Card: Estimated Arrival Time */}
              <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 p-5 shadow-xs dark:border-amber-950/60 dark:bg-gradient-to-r dark:from-amber-950/30 dark:via-[#071910] dark:to-amber-950/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
                      <TruckIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {t("estimatedArrival")}
                      </span>
                      <h4 className="font-outfit text-base sm:text-lg font-black text-gray-900 dark:text-white">
                        {slot}
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                        {t("arrivalNotice")}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/90 px-4 py-2.5 text-center shadow-xs backdrop-blur-sm dark:bg-[#071910] shrink-0 border border-amber-500/20">
                    <span className="block text-[10px] font-bold uppercase text-gray-400">
                      Rango Estimado
                    </span>
                    <span className="font-outfit text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ~30 - 45 min
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Delivery Status Timeline */}
              <div className="rounded-3xl border border-gray-100 bg-gray-50/60 p-6 dark:border-emerald-950/60 dark:bg-[#05130b]">
                <h3 className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                  {t("timelineTitle")}
                </h3>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-4 sm:gap-4">
                  {/* Stage 1: Pedido Recibido */}
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-xs font-black text-white shadow-md shadow-emerald-600/25">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("step1Title")}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {t("step1Desc")}
                      </p>
                    </div>
                  </div>

                  {/* Stage 2: Preparando en Almacén (Active pulsing) */}
                  <div className="flex flex-col items-start gap-2">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-xs font-black text-white shadow-lg shadow-emerald-600/35 ring-4 ring-emerald-500/25">
                      <BoxIcon className="h-4 w-4" />
                      <span className="absolute -top-1 -end-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border border-white" />
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                        {t("step2Title")}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {t("step2Desc")}
                      </p>
                    </div>
                  </div>

                  {/* Stage 3: En Reparto */}
                  <div className="flex flex-col items-start gap-2 opacity-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <TruckIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                        {t("step3Title")}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {t("step3Desc")}
                      </p>
                    </div>
                  </div>

                  {/* Stage 4: Entregado */}
                  <div className="flex flex-col items-start gap-2 opacity-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <HomeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                        {t("step4Title")}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {t("step4Desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Summary & Financial Breakdown */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#05130b]">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-emerald-950/60">
                  <h3 className="font-outfit text-base font-black text-gray-900 dark:text-white">
                    {t("summaryTitle")} ({items.length})
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    SuperBarrio Selección Fresca
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gray-100 dark:divide-emerald-950/60 max-h-72 overflow-y-auto pe-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="truncate">
                          <h5 className="font-bold text-gray-900 dark:text-white truncate">
                            {item.name}
                          </h5>
                          <span className="text-[11px] text-gray-500 dark:text-emerald-300/60">
                            {item.quantity} x {formatPrice(item.price, locale)} ({item.unit})
                          </span>
                        </div>
                      </div>

                      <span className="font-outfit font-black text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity, locale)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-600 dark:border-emerald-950/60 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>{t("subtotal")}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatPrice(subtotal, locale)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{t("discount")}</span>
                      <span>-{formatPrice(discount, locale)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>{t("delivery")}</span>
                    <span className="font-bold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {t("free")}
                        </span>
                      ) : (
                        formatPrice(deliveryFee, locale)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>{t("vatIncluded")}</span>
                    <span>{formatPrice(vatAmount, locale)}</span>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-gray-200/80 pt-3 dark:border-emerald-950/80">
                    <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                      {t("total")}
                    </span>
                    <span className="font-outfit text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(total, locale)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Contact Info Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-xs dark:border-emerald-950/60 dark:bg-[#05130b]">
                  <span className="flex items-center gap-1.5 font-black text-gray-900 dark:text-white mb-2">
                    <MapPinIcon className="h-4 w-4 text-emerald-600" />
                    <span>{t("deliveryAddressTitle")}</span>
                  </span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {customerName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                    {address}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                    {phone}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-xs dark:border-emerald-950/60 dark:bg-[#05130b]">
                  <span className="flex items-center gap-1.5 font-black text-gray-900 dark:text-white mb-2">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                    <span>{t("paymentMethodTitle")}</span>
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base">{paymentInfo.icon}</span>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {paymentInfo.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Estado: <span className="font-bold text-emerald-600">Abonado / Confirmado</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-emerald-950/60">
                <Link
                  href="/grocery"
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-7 py-3.5 text-center text-xs font-black text-white shadow-xl shadow-emerald-600/30 transition hover:scale-105 active:scale-95"
                >
                  {t("continueShopping")}
                </Link>

                <a
                  href={getShareWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#25D366]/40 bg-white px-6 py-3 text-xs font-black text-[#128C7E] shadow-xs transition hover:border-[#25D366] hover:bg-[#25D366]/10 dark:bg-[#071910] dark:text-emerald-300"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-current" />
                  <span>{t("shareWhatsApp")}</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-5 py-3 text-xs font-bold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-emerald-950 dark:bg-[#071910] dark:text-gray-200"
                >
                  🖨️ {t("printReceipt")}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MIS PEDIDOS (MY ORDERS HISTORY FROM LOCALSTORAGE) */}
          {activeTab === "history" && (
            <div className="p-6 sm:p-10 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-emerald-950/60">
                <div>
                  <h3 className="font-outfit text-base font-black text-gray-900 dark:text-white">
                    Historial de Compras en SuperBarrio
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Todos los pedidos guardados en tu navegador
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {pastOrders.length} {pastOrders.length === 1 ? "pedido" : "pedidos"}
                </span>
              </div>

              {pastOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-500">{t("noOrders")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastOrders.map((pOrder) => {
                    const isExpanded = expandedOrderId === pOrder.orderId;
                    const orderDate = new Date(pOrder.createdAt).toLocaleDateString(
                      isEs ? "es-ES" : "en-US",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );

                    return (
                      <div
                        key={pOrder.orderId}
                        className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs dark:border-emerald-950/70 dark:bg-[#05130b]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-outfit text-sm font-black text-emerald-700 dark:text-emerald-400">
                                #{pOrder.orderId}
                              </span>
                              <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {pOrder.status === "placed"
                                  ? "Recibido"
                                  : pOrder.status === "packing"
                                  ? "En Almacén"
                                  : pOrder.status === "on_the_way"
                                  ? "En Reparto"
                                  : "Entregado"}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400">
                              {t("orderPlacedAt")} {orderDate} • {pOrder.items?.length || 0} artículos
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-outfit text-base font-black text-gray-900 dark:text-white">
                              {formatPrice(pOrder.total, locale)}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOrderId(
                                  isExpanded ? null : pOrder.orderId,
                                )
                              }
                              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-emerald-950 dark:text-gray-300 dark:hover:bg-emerald-950/60"
                            >
                              {isExpanded ? t("hideDetails") : t("viewDetails")}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReorder(pOrder)}
                              className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3.5 py-1.5 text-xs font-black text-white shadow-xs transition hover:scale-105 active:scale-95"
                            >
                              ↻ {t("reorder")}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible item details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 border-t border-gray-100 pt-3 dark:border-emerald-950/60"
                            >
                              <div className="divide-y divide-gray-100 dark:divide-emerald-950/40">
                                {pOrder.items?.map((it) => (
                                  <div
                                    key={it.id}
                                    className="flex items-center justify-between py-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      {it.imageUrl && (
                                        <img
                                          src={it.imageUrl}
                                          alt={it.name}
                                          className="h-7 w-7 rounded-lg object-cover"
                                        />
                                      )}
                                      <span className="font-bold text-gray-800 dark:text-gray-200">
                                        {it.name} ({it.unit})
                                      </span>
                                    </div>
                                    <span className="font-medium text-gray-500">
                                      {it.quantity} x {formatPrice(it.price, locale)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 text-[11px] text-gray-400">
                                📍 Entrega: {pOrder.address}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessView;
